import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { deleteImage, resizeImageToThumbnail, uploadImage } from '../utils';
import * as randomBytes from 'randombytes';
import * as path from 'path';
import { PrismaService } from '@/prisma/prisma.service';
import { ProfileImage, Provider } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ProfileImagesService {
  constructor(private config: ConfigService, private prisma: PrismaService) {}

  provider: Provider =
    this.config.getOrThrow<string>('NODE_ENV') === 'production'
      ? 'GCS'
      : 'CLOUDINARY';

  async updateProfileImage(userId: string, image: Express.Multer.File) {
    const imageBaseName = randomBytes(16).toString('hex');
    const extension = path.extname(image.originalname);

    const options: any = {
      folder: `profile-images`,
      filename: `${imageBaseName}${extension}`,
      provider: this.provider,
    };

    await this.prisma.userProfile
      .findUniqueOrThrow({
        where: {
          userId: +userId,
        },
        include: {
          profileImage: true,
        },
      })
      .then(async (profile) => {
        if (profile.profileImage) {
          await this.deleteProfileImage(profile.profileImage);
        }
        return resizeImageToThumbnail(image)
          .then(async (result) => {
            return uploadImage(result, options).then(async (uploadedImage) =>
              this.prisma.profileImage
                .create({
                  data: {
                    name: imageBaseName,
                    extension,
                    mime: image.mimetype,
                    url: uploadedImage.url,
                    provider: options.provider,
                    providerMetadata: uploadedImage?.providerMetadata,
                    userProfile: {
                      connect: {
                        id: profile.id,
                      },
                    },
                  },
                })
                .then((res) => res)
                .catch(() => {
                  throw new BadGatewayException();
                }),
            );
          })
          .catch(() => {
            throw new InternalServerErrorException();
          });
      })
      .catch(async () => {
        return resizeImageToThumbnail(image)
          .then((result) =>
            uploadImage(result, options).then(async (uploadedImage) => {
              try {
                return await this.prisma.userProfile.create({
                  data: {
                    userId: +userId,
                    profileImage: {
                      create: {
                        name: imageBaseName,
                        extension,
                        mime: image.mimetype,
                        url: uploadedImage.url,
                        provider: options.provider,
                        providerMetadata: uploadedImage?.providerMetadata,
                      },
                    },
                  },
                });
              } catch (error) {
                throw new BadGatewayException();
              }
            }),
          )
          .catch(() => {
            throw new InternalServerErrorException();
          });
      });
  }

  deleteUserProfileImage(userId: string) {
    this.prisma.userProfile
      .findUniqueOrThrow({
        where: { userId: Number(userId) },
        include: { profileImage: true },
      })
      .then(async (profile) => {
        if (profile.profileImage) {
          await this.deleteProfileImage(profile.profileImage);
        } else {
          throw new NotFoundException();
        }
      })
      .catch(() => {
        throw new NotFoundException();
      });
  }

  async deleteProfileImage(profileImage: ProfileImage) {
    await this.prisma.profileImage
      .delete({
        where: {
          id: profileImage.id,
        },
      })
      .then(async () => await deleteImage(profileImage))
      .catch((err) => err);
  }
}
