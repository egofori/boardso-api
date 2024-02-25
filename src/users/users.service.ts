import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { FindUserDto } from './dto/find-user.dto';
import { deleteImage } from '@/utils';
import { firebaseAuth } from '@/utils/firebase';
import { ConfigService } from '@nestjs/config';
import * as dayjs from 'dayjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findOne(userId: string) {
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
            profileImage: {
              select: {
                url: true,
              },
            },
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
    const updatedUser = await this.prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        firstName: data?.firstName,
        lastName: data?.lastName,
        username: data?.username,
        userProfile: {
          upsert: {
            where: {
              userId: Number(userId),
            },
            create: {
              about: data?.about,
            },
            update: {
              about: data?.about,
            },
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

  async remove(userId: string) {
    await this.prisma.user
      .delete({
        where: { id: Number(userId) },
        include: {
          billboards: { include: { images: true } },
          userProfile: {
            include: {
              profileImage: true,
            },
          },
        },
      })
      .then(async (user) => {
        try {
          // delete media
          await deleteImage(user?.userProfile?.profileImage);
          user?.billboards?.forEach((billboard) => {
            billboard?.images?.forEach(
              async (image) => await deleteImage(image),
            );
          });

          // delete from firebase
          if (user.email) {
            await firebaseAuth
              .getUserByEmail(user.email)
              .then(
                async (firebaseUser) =>
                  await firebaseAuth.deleteUser(firebaseUser.uid),
              );
          }
        } catch (err) {
          throw new BadRequestException(err);
        }
      })
      .catch((err) => {
        throw new BadRequestException(err);
      });
  }

  async getStatus(userId: string | number) {
    try {
      const billboardAggregate = await this.prisma.billboard.aggregate({
        where: {
          ownerId: Number(userId),
        },
        _count: true,
      });

      const subscription = await this.prisma.subscription.findFirst({
        where: { ownerId: +userId },
        orderBy: { createdAt: 'desc' },
        select: {
          subscribedAt: true,
          expiresAt: true,
          plan: { select: { name: true } },
        },
      });

      const isSubscriptionActive = subscription
        ? dayjs(subscription.expiresAt).isAfter(dayjs())
        : false;

      const daysLeft = subscription
        ? dayjs(subscription.expiresAt).diff(dayjs(), 'day')
        : null;

      let currentPlan = subscription?.plan?.name;

      if (!subscription) {
        // find the free plan if there is no subscription
        const freePlan = await this.prisma.plan.findFirst({
          where: {
            amount: 0,
            number: 0,
          },
        });

        currentPlan = freePlan?.name;
      }

      return {
        billboardCount: billboardAggregate._count,
        maxFreeListings:
          Number(this.config.get<number>('MAX_FREE_LISTINGS')) || 3,
        isSubscriptionActive,
        subscriptionExpiresAt: subscription?.expiresAt,
        subscribedAt: subscription?.subscribedAt,
        currentPlan,
        daysLeft: daysLeft < 0 ? 0 : daysLeft,
      };
    } catch {
      throw new BadRequestException();
    }
  }
}
