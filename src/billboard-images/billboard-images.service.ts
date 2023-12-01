import { Injectable } from '@nestjs/common';
import { Billboard, BillboardImage, Provider } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as randomBytes from 'randombytes';
import * as path from 'path';
import {
  deleteImage,
  resizeImageToMax,
  resizeImageToThumbnail,
  uploadImage,
} from 'src/utils';

@Injectable()
export class BillboardImagesService {
  constructor(private config: ConfigService, private prisma: PrismaService) {}

  provider: Provider =
    this.config.getOrThrow<string>('NODE_ENV') === 'production'
      ? 'GCS'
      : 'CLOUDINARY';

  async uploadImages(billboard: Billboard, images: Array<Express.Multer.File>) {
    return Promise.all(
      images?.map((image, index) => {
        const imageBaseName = randomBytes(16).toString('hex');
        const extension = path.extname(image.originalname);

        const options: any = {
          folder: `billboards`,
          filename: `${imageBaseName}${extension}`,
          provider: this.provider,
        };

        // resize image before uploading
        resizeImageToMax(image)
          .then(async (result) =>
            uploadImage(result, options)
              .then(async (response) => {
                try {
                  const metadata = await result.metadata();
                  await this.prisma.billboardImage.create({
                    data: {
                      name: imageBaseName,
                      extension,
                      mime: image.mimetype,
                      height: metadata.height,
                      width: metadata.width,
                      url: response.url,
                      size: metadata.size,
                      billboardId: billboard.id,
                      provider: options.provider,
                      providerMetadata: response?.providerMetadata,
                    },
                  });
                } catch (error) {}
              })
              .catch((err) => err),
          )
          .catch((err) => err);

        // resize first image to create a thumbnail before uploading
        if (index === 0) {
          resizeImageToThumbnail(image)
            .then((result) =>
              uploadImage(result, {
                ...options,
                filename: `thumbnail_${options.filename}`,
              })
                .then(async (response) => {
                  try {
                    const metadata = await result.metadata();

                    this.prisma.billboardImage
                      .create({
                        data: {
                          name: `thumbnail_${imageBaseName}`,
                          extension,
                          mime: image.mimetype,
                          height: metadata.height,
                          width: metadata.width,
                          url: response.url,
                          size: metadata.size,
                          billboardId: billboard.id,
                          provider: options.provider,
                          providerMetadata: response?.providerMetadata,
                        },
                      })
                      .then((billboardImage) => {
                        this.prisma.billboard
                          .update({
                            data: {
                              thumbnailId: billboardImage.id,
                            },
                            where: {
                              id: billboard.id,
                            },
                          })
                          .catch(() => {
                            // pass
                          });
                      })
                      .catch(() => {
                        // pass
                      });
                  } catch (error) {
                    return error;
                  }
                })
                .catch((err) => err),
            )
            .catch((err) => err);
        }
      }),
    );
  }

  async deleteBillboardImages(
    billboard: Billboard & { images: BillboardImage[] },
  ) {
    return Promise.all(
      billboard.images.map((image) =>
        this.prisma.billboardImage
          .delete({ where: { id: image.id } })
          .then(async (billboardImage) => await deleteImage(billboardImage))
          .catch((err) => err),
      ),
    );
  }
}
