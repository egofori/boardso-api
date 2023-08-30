import { Injectable } from '@nestjs/common';
import { CreateBillboardDto } from './dto/create-billboard.dto';
import { UpdateBillboardDto } from './dto/update-billboard.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { BillboardImagesService } from 'src/billboard-images/billboard-images.service';
import { randomBytes } from 'crypto';
import slugify from 'slugify';

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

  findAll() {
    return this.prisma.billboard.findMany();
  }

  findOne(slug: string) {
    // return this.prisma.billboard.findUnique({ where: { slug } });
  }

  update(id: number, updateBillboardDto: UpdateBillboardDto) {
    return `This action updates a #${id} billboard`;
  }

  remove(id: number) {
    return `This action removes a #${id} billboard`;
  }
}
