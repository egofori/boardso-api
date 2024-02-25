import {
  NotFoundException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { CreateBillboardDto } from './dto/create-billboard.dto';
import { UpdateBillboardDto } from './dto/update-billboard.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BillboardImagesService } from 'src/billboard-images/billboard-images.service';
import { randomBytes } from 'crypto';
import slugify from 'slugify';
import { SearchBillboardsDto } from './dto/search-billboards.dto';
import { Prisma } from '@prisma/client';
import { GetBillboardDto } from './dto/get-billboard.dto';
import { deleteImage } from '../utils';
import { UsersService } from '@/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BillboardsService {
  constructor(
    private prisma: PrismaService,
    private billboardImages: BillboardImagesService,
    private readonly usersService: UsersService,
    private config: ConfigService,
  ) {}

  async create(
    userId: number,
    data: CreateBillboardDto,
    images: Array<Express.Multer.File>,
  ) {
    try {
      const { billboardCount, maxFreeListings, isSubscriptionActive } =
        await this.usersService.getStatus(userId);

      // limit the number of free listings if unsubscribed
      if (billboardCount >= maxFreeListings && !isSubscriptionActive) {
        throw new BadRequestException(
          'Subscribe to add more billboard listings',
        );
      }

      // limit the number of images if unsubscribed
      if (images.length > 5 && !isSubscriptionActive) {
        throw new BadRequestException('Subscribe to add more images');
      }
    } catch (err) {
      throw new BadRequestException(err);
    }

    const { title } = data;
    const randomSuffix = randomBytes(16).toString('hex');
    const titleSlug = slugify(title, {
      replacement: '-',
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
          slug: `${titleSlug}-${randomSuffix}`,
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
      .then((billboard) => this.billboardImages.uploadImages(billboard, images))
      .catch(() => {
        throw new BadRequestException();
      });
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
        uid: true,
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
            subscription: {
              select: { expiresAt: true },
              where: {
                expiresAt: { gte: new Date() },
              },
              orderBy: { updateAt: 'desc' },
              take: 1,
            },
            billboards: {
              take: Number(this.config.get<number>('MAX_FREE_LISTINGS')) || 3,
              orderBy: {
                createdAt: 'desc',
              },
            },
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

    // get the count using the same filter as the findAll
    const aggregations = await this.prisma.billboard.aggregate({
      _count: true,
      where: filter,
    });

    return {
      data: billboards.map((billboard) => {
        const {
          bookmarks,
          owner: { subscription, billboards: ownerBillboards, ...ownerRest },
          ...rest
        } = billboard;

        return {
          ...rest,
          owner: ownerRest,
          // tag as premium if user has an active subscription
          premium: subscription.length > 0,
          // make active by default if user is subscribed
          // else only make first 3 billboards active
          isActive:
            subscription.length > 0
              ? true
              : ownerBillboards.filter(
                  (ownerBillboard) => ownerBillboard.id === billboard.id,
                ).length > 0,
          bookmarked: bookmarks.length > 0,
        };
      }),
      count: aggregations._count,
    };
  }

  async findOne(userId: string, getBillboardDto: GetBillboardDto) {
    const { slug, uid, id } = getBillboardDto;
    let billboard = null;
    const select: any = {
      currency: true,
      description: true,
      height: true,
      images: true,
      id: true,
      uid: true,
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
          route: true,
          neighbourhood: true,
          sublocality: true,
          locality: true,
          administrativeAreaLevel3: true,
          administrativeAreaLevel2: true,
          administrativeAreaLevel1: true,
          country: true,
        },
      },
      owner: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
          subscription: {
            select: { expiresAt: true },
            where: {
              expiresAt: { gte: new Date() },
            },
            orderBy: { updateAt: 'desc' },
            take: 1,
          },
          billboards: {
            take: Number(this.config.get<number>('MAX_FREE_LISTINGS')) || 3,
            orderBy: {
              createdAt: 'desc',
            },
          },
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
    };
    if (slug) {
      billboard = await this.prisma.billboard.findUnique({
        where: { slug },
        select: {
          ...select,
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
      // return details based on uid when the user wants to edit
    } else if (uid && userId) {
      billboard = await this.prisma.billboard.findUnique({
        where: { uid },
        select,
      });
    } else if (id && userId) {
      billboard = await this.prisma.billboard.findUnique({
        where: { id: +id },
        select,
      });
    }

    if (!billboard) {
      throw new NotFoundException('Billboard does not exist');
    }

    const {
      bookmarks,
      owner: { subscription, billboards: ownerBillboards, ...ownerRest },
      ...rest
    } = billboard;

    billboard = {
      ...rest,
      owner: ownerRest,
      // tag as premium if user has an active subscription
      premium: subscription.length > 0,
      // make active by default if user is subscribed
      // else only make first 3 billboards active
      isActive:
        subscription.length > 0
          ? true
          : ownerBillboards.filter(
              (ownerBillboard: any) => ownerBillboard.id === billboard.id,
            ).length > 0,
    };

    if (bookmarks) {
      return {
        ...billboard,
        bookmarked: bookmarks.length > 0,
      };
    } else {
      return billboard;
    }
  }

  async update(
    userId: string,
    id: string,
    data: UpdateBillboardDto,
    images: Array<Express.Multer.File>,
  ) {
    const billboard = await this.findOne(userId, { id });

    if (!billboard?.isActive) {
      throw new BadRequestException('Subscribe to edit this billboard');
    }
    const { title } = data;
    const randomSuffix = randomBytes(16).toString('hex');
    const titleSlug = slugify(title, {
      replacement: '-',
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
      .update({
        where: { id: Number(id), ownerId: Number(userId) },
        data: {
          title: data.title,
          description: data.description,
          slug: `${titleSlug}-${randomSuffix}`,
          type: data.type,
          price: +data.price,
          currency: data.currency,
          rate: data.rate,
          width: width,
          height: height,
          billboardLocation: {
            update: {
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
          thumbnailId: null,
        },
        include: {
          images: true,
        },
      })
      .then(async (billboard) => {
        return this.billboardImages
          .deleteBillboardImages(billboard)
          .then(async () => {
            await this.billboardImages.uploadImages(billboard, images);
          })
          .catch((err) => err);
      })
      .catch(() => {
        throw new BadRequestException();
      });
  }

  remove(userId: string, id: string) {
    this.prisma.billboard
      .delete({
        where: { id: Number(id), ownerId: Number(userId) },
        include: {
          images: true,
        },
      })
      .then((billboard) => {
        billboard.images.forEach((image) => deleteImage(image));
      })
      .catch(() => {
        throw new BadRequestException();
      });
  }
}
