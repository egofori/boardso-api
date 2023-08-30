import { Injectable } from '@nestjs/common';
import { Billboard } from '@prisma/client';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as randomBytes from 'randombytes';
import * as path from 'path';
import {
  getFileMetadata,
  resizeImageToMax,
  resizeImageToThumbnail,
} from 'src/utils';
import sharp from 'sharp';

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
        this.uploadImage(result, config).then((response) =>
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
                    this.uploadImage(result, {
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

  async uploadImage(pipeline: sharp.Sharp, config?: any) {
    const { provider } = config || {};

    if (provider === 'CLOUDINARY') {
      const options: UploadApiOptions = {
        folder: config?.folder,
        filename_override: config?.filename,
        resource_type: 'image',
        unique_filename: false,
        use_filename: true,
      };
      return this.uploadImageToCloudinary(pipeline, options);
    }
  }

  async uploadImageToCloudinary(
    pipeline: sharp.Sharp,
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.config({
        cloud_name: this.config.get<string>('CLOUD_NAME'),
        api_key: this.config.get<string>('CLOUD_API_KEY'),
        api_secret: this.config.get<string>('CLOUD_API_SECRET'),
      });
      const upload = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      pipeline.pipe(upload);
    });
  }
}
