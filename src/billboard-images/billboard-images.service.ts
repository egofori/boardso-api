import { Injectable } from '@nestjs/common';
import { Billboard, BillboardImage } from '@prisma/client';
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

  async uploadImages(billboard: Billboard, images: Array<Express.Multer.File>) {
    images?.forEach((image, index) => {
      const imageBaseName = randomBytes(16).toString('hex');
      const extension = path.extname(image.originalname);

      const config: Record<string, string> = {
        folder: `billboards`,
        filename: `${imageBaseName}${extension}`,
        provider: 'AWS_S3',
      };

      // resize image before uploading
      resizeImageToMax(image)
        .then(async (result) =>
          uploadImage(result, config)
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
                    provider: 'AWS_S3',
                    providerMetadata: response?.providerMetadata,
                  },
                });
              } catch (error) {}
            })
            .catch(() => {
              // pass
            }),
        )
        .catch(() => {
          // pass
        });

      // resize first image to create a thumbnail before uploading
      if (index === 0) {
        resizeImageToThumbnail(image)
          .then((result) =>
            uploadImage(result, {
              ...config,
              filename: `thumbnail_${config.filename}`,
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
                        provider: 'AWS_S3',
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
                } catch (error) {}
              })
              .catch(() => {
                // pass
              }),
          )
          .catch(() => {
            // pass
          });
      }
    });
  }

  async deleteBillboardImages(
    billboard: Billboard & { images: BillboardImage[] },
  ) {
    billboard.images.forEach((image) =>
      this.prisma.billboardImage
        .delete({ where: { id: image.id } })
        .then((billboardImage) => {
          deleteImage(billboardImage);
        })
        .catch(() => {
          // pass
        }),
    );
  }
}
