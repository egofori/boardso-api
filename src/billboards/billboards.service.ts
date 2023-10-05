import {
  NotFoundException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateBillboardDto } from './dto/create-billboard.dto';
import { UpdateBillboardDto } from './dto/update-billboard.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BillboardImagesService } from 'src/billboard-images/billboard-images.service';
import { randomBytes } from 'crypto';
import slugify from 'slugify';
import { SearchBillboardsDto } from './dto/search-billboards.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BillboardsService {
  constructor(
    private prisma: PrismaService,
    private billboardImages: BillboardImagesService,
  ) {}

  async create(
    userId: number,
    data: CreateBillboardDto,
    images: Array<Express.Multer.File>,
  ) {
    const { title } = data;
    const randomSuffix = randomBytes(6).toString('hex');
    const titleSlug = slugify(title, {
      replacement: '_',
      lower: true,
      strict: true,
      locale: 'en',
    });

    const location = JSON.parse(data.location);

    let width = +data.width;
    let height = +data.height;

    if (data.dimensionUnit === 'METERS') {
      width = width * 3.28084;
      height = height * 3.28084;
    }

    return this.prisma.billboard
      .create({
        data: {
          ownerId: userId,
          title: data.title,
          description: data.description,
          slug: `${titleSlug}_${randomSuffix}`,
          type: data.type,
          price: +data.price,
          currency: data.currency,
          rate: data.rate,
          width: width,
          height: height,
          billboardLocation: {
            create: {
              route: location?.route,
              neighbourhood: location?.neighbourhood,
              sublocality: location?.sublocality,
              locality: location?.locality,
              administrativeAreaLevel3: location?.administrativeAreaLevel3,
              administrativeAreaLevel2: location?.administrativeAreaLevel2,
              administrativeAreaLevel1: location?.administrativeAreaLevel1,
              country: location?.country,
              address: location?.address,
              lat: location?.coordinates.lat,
              lng: location?.coordinates.lng,
            },
          },
        },
      })
      .then((billboard) =>
        this.billboardImages.uploadImages(billboard, images),
      );
  }

  orderBy(
    sort: 'DATE_ASC' | 'DATE_DESC' | 'PRICE_ASC' | 'PRICE_DESC',
  ): Prisma.BillboardOrderByWithRelationInput {
    switch (sort) {
      case 'DATE_ASC':
        return { createdAt: 'asc' };
      case 'DATE_DESC':
        return { createdAt: 'desc' };
      case 'PRICE_ASC':
        return { price: 'asc' };
      case 'PRICE_DESC':
        return { price: 'desc' };
      default:
        return { createdAt: 'desc' };
    }
  }

  async findAll(userId: string, data?: SearchBillboardsDto) {
    const minPrice = data?.minPrice ? Number(data.minPrice) : undefined;
    const maxPrice = data?.maxPrice ? Number(data.maxPrice) : undefined;
    let width = data?.width ? Number(data.width) : undefined;
    let height = data?.height ? Number(data.height) : undefined;

    if (data.dimensionUnit === 'METERS') {
      width = width ? width * 3.28084 : undefined;
      height = height ? height * 3.28084 : undefined;
    }

    const filter: Prisma.BillboardWhereInput = {
      owner: {
        username: data?.username,
      },
      OR: [
        {
          title: {
            contains: data?.search || '',
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: data?.search || '',
            mode: 'insensitive',
          },
        },
      ],
      type: data?.type,
      AND: [
        {
          price: {
            gte: minPrice,
          },
        },
        {
          price:
            maxPrice !== 10000
              ? {
                  lte: maxPrice,
                }
              : undefined,
        },
      ],
      width,
      height,
      currency: data?.currency,
      billboardLocation: {
        OR: [
          {
            address: {
              contains: data?.location || '',
              mode: 'insensitive',
            },
          },
          {
            administrativeAreaLevel1: {
              contains: data?.location || '',
              mode: 'insensitive',
            },
          },
          {
            administrativeAreaLevel2: {
              contains: data?.location || '',
              mode: 'insensitive',
            },
          },
          {
            administrativeAreaLevel3: {
              contains: data?.location || '',
              mode: 'insensitive',
            },
          },
          {
            locality: {
              contains: data?.location || '',
              mode: 'insensitive',
            },
          },
          {
            sublocality: {
              contains: data?.location || '',
              mode: 'insensitive',
            },
          },
          {
            country: {
              contains: data?.location || '',
              mode: 'insensitive',
            },
          },
          {
            route: {
              contains: data?.location || '',
              mode: 'insensitive',
            },
          },
        ],
      },
    };

    const billboards = await this.prisma.billboard.findMany({
      skip: data.offset,
      take: data.limit,
      where: filter,
      select: {
        updateAt: true,
        currency: true,
        id: true,
        slug: true,
        title: true,
        description: true,
        height: true,
        width: true,
        price: true,
        rate: true,
        type: true,
        status: true,
        thumbnailId: true,
        images: true,
        billboardLocation: {
          select: {
            address: true,
            lat: true,
            lng: true,
          },
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            userProfile: {
              select: {
                profileImage: true,
              },
            },
          },
        },
        bookmarks: {
          where: {
            OR: [
              {
                ownerId: userId ? Number(userId) : undefined,
              },
            ],
          },
        },
      },
      orderBy: this.orderBy(data?.sort),
    });

    // get the count using the smae filter as the findAll
    const aggregations = await this.prisma.billboard.aggregate({
      _count: true,
      where: filter,
    });

    return {
      data: billboards.map((billboard) => {
        const { bookmarks, ...rest } = billboard;
        return { ...rest, bookmarked: bookmarks.length > 0 };
      }),
      count: aggregations._count,
    };
  }

  async findOne(userId: string, slug: string) {
    const billboard = await this.prisma.billboard.findUnique({
      where: { slug },
      select: {
        currency: true,
        description: true,
        height: true,
        images: true,
        id: true,
        rate: true,
        slug: true,
        thumbnailId: true,
        status: true,
        title: true,
        type: true,
        updateAt: true,
        width: true,
        price: true,
        billboardLocation: {
          select: {
            address: true,
            lat: true,
            lng: true,
          },
        },
        owner: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            userProfile: {
              select: {
                profileImage: true,
                userContacts: {
                  select: {
                    id: true,
                    title: true,
                    contacts: true,
                    type: true,
                  },
                },
              },
            },
          },
        },
        bookmarks: {
          where: {
            OR: [
              {
                ownerId: userId ? Number(userId) : undefined,
              },
            ],
          },
        },
      },
    });

    if (!billboard) {
      throw new NotFoundException('Billboard does not exist');
    }

    const { bookmarks, ...rest } = billboard;
    return { ...rest, bookmarked: bookmarks.length > 0 };
  }

  update(id: number, updateBillboardDto: UpdateBillboardDto) {
    return `This action updates a #${id} billboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} billboard`;
  }
}
