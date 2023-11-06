import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { FindUserDto } from './dto/find-user.dto';
import { resizeImageToThumbnail, uploadImage } from '@/utils';
import * as randomBytes from 'randombytes';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findOne(userId: string) {
    if (!userId) {
      throw new UnauthorizedException();
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        zipCode: true,
        phone: true,
        createdAt: true,
        userProfile: {
          select: {
            userContacts: {
              select: {
                contacts: true,
                title: true,
                type: true,
              },
            },
            about: true,
            profileImage: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return user;
  }

  async findOneByUsername({ username }: FindUserDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        zipCode: true,
        phone: true,
        createdAt: true,
        userProfile: {
          select: {
            userContacts: {
              select: {
                contacts: true,
                title: true,
                type: true,
              },
            },
            about: true,
            profileImage: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    return user;
  }

  async update(userId: string, data: UpdateUserDto) {
    if (!userId) {
      throw new UnauthorizedException();
    }

    const updatedUser = await this.prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        firstName: data?.firstName,
        lastName: data?.lastName,
        username: data?.username,
        userProfile: {
          connect: {
            userId: Number(userId),
          },
          update: {
            about: data?.about,
          },
        },
      },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        zipCode: true,
        phone: true,
        createdAt: true,
        userProfile: {
          select: {
            userContacts: {
              select: {
                id: true,
                contacts: true,
                title: true,
                type: true,
              },
            },
            about: true,
            profileImage: true,
          },
        },
      },
    });

    if (!updatedUser) {
      throw new BadRequestException('Could not update user data');
    }

    return updatedUser;
  }

  async updateProfileImage(userId: string, image: Express.Multer.File) {
    if (!userId) {
      throw new UnauthorizedException();
    }

    const imageBaseName = randomBytes(16).toString('hex');
    const extension = path.extname(image.originalname);

    const config: Record<string, unknown> = {
      folder: `profileImages`,
      filename: `${imageBaseName}${extension}`,
      provider: 'CLOUDINARY',
    };

    resizeImageToThumbnail(image).then((result) =>
      uploadImage(result, {
        ...config,
        filename: config.filename,
      }).then((response) =>
        this.prisma.user.update({
          where: {
            id: Number(userId),
          },
          data: {
            userProfile: {
              connect: {
                userId: Number(userId),
              },
              update: {
                profileImage: response.secure_url,
              },
            },
          },
        }),
      ),
    );
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
