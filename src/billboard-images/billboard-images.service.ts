import { Injectable } from '@nestjs/common';
import { Billboard } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as randomBytes from 'randombytes';
import * as path from 'path';
import {
  getFileMetadata,
  resizeImageToMax,
  resizeImageToThumbnail,
  uploadImage,
} from 'src/utils';

@Injectable()
export class BillboardImagesService {
  constructor(private config: ConfigService, private prisma: PrismaService) {}

  async uploadImages(billboard: Billboard, images: Array<Express.Multer.File>) {
    images?.forEach((image, index) => {
      const imageBaseName = randomBytes(8).toString('hex');
      const extension = path.extname(image.originalname);

      const config: Record<string, unknown> = {
        folder: `billboards/${billboard.slug}`,
        filename: `${imageBaseName}${extension}`,
        provider: 'CLOUDINARY',
      };

      // resize image before uploading
      resizeImageToMax(image).then(async (result) =>
        uploadImage(result, config).then((response) =>
          getFileMetadata(image).then(async (medatadata) => {
            this.prisma.billboardImage
              .create({
                data: {
                  name: imageBaseName,
                  extension,
                  mime: image.mimetype,
                  height: medatadata.height,
                  width: medatadata.width,
                  url: response.secure_url,
                  size: medatadata.size,
                  billboardId: billboard.id,
                  provider: 'CLOUDINARY',
                  providerMetadata: {
                    resourceType: response.resource_type,
                    publicId: response.public_id,
                  },
                },
              })
              .then(() => {
                // resize first image to create a thumbnail before uploading
                if (index === 0) {
                  resizeImageToThumbnail(image).then((result) =>
                    uploadImage(result, {
                      ...config,
                      filename: `thumbnail_${config.filename}`,
                    }).then((response) =>
                      getFileMetadata(image).then(async (medatadata) => {
                        this.prisma.billboardImage
                          .create({
                            data: {
                              name: `thumbnail_${imageBaseName}`,
                              extension,
                              mime: image.mimetype,
                              height: medatadata.height,
                              width: medatadata.width,
                              url: response.secure_url,
                              size: medatadata.size,
                              billboardId: billboard.id,
                              provider: 'CLOUDINARY',
                              providerMetadata: {
                                resourceType: response.resource_type,
                                publicId: response.public_id,
                              },
                            },
                          })
                          .then((billboardImage) =>
                            this.prisma.billboard.update({
                              data: {
                                thumbnailId: billboardImage.id,
                              },
                              where: {
                                id: billboard.id,
                              },
                            }),
                          );
                      }),
                    ),
                  );
                }
              });
          }),
        ),
      );
    });
  }
}
