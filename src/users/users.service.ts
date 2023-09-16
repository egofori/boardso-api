import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { FindUserDto } from './dto/find-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  async findOne({ username }: FindUserDto) {
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
            contacts: {
              select: {
                contact: true,
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
