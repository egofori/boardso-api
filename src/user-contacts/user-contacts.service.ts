import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserContactDto } from './dto/create-user-contact.dto';
import { UpdateUserContactDto } from './dto/update-user-contact.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserContactsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateUserContactDto) {
    const contact = await this.prisma.userContact.create({
      data: {
        userProfile: {
          connectOrCreate: {
            where: {
              userId: Number(userId),
            },
            create: {
              user: {
                connect: {
                  id: Number(userId),
                },
              },
            },
          },
        },
        title: dto.title,
        type: dto.type,
        contacts: dto.contacts,
      },
      select: {
        id: true,
        type: true,
        contacts: true,
        title: true,
      },
    });

    return contact;
  }

  async findAll(userId: string) {
    const contacts = await this.prisma.userContact.findMany({
      where: {
        userProfile: {
          user: {
            id: Number(userId),
          },
        },
      },
      select: {
        id: true,
        contacts: true,
        title: true,
        type: true,
      },
    });

    if (!contacts) {
      throw new BadRequestException('Could not complete this operation');
    }

    return contacts;
  }

  update(userId: string, id: string, dto: UpdateUserContactDto) {
    const updatedUserContact = this.prisma.userContact.update({
      where: {
        userProfile: {
          userId: Number(userId),
        },
        id: +id,
      },
      data: {
        title: dto.title,
        type: dto.type,
        contacts: dto.contacts,
      },
    });

    if (!updatedUserContact) {
      throw new BadRequestException('Could not complete this operation');
    }

    return updatedUserContact;
  }

  async remove(userId: string, id: string) {
    await this.prisma.userContact
      .delete({
        where: {
          userProfile: {
            userId: Number(userId),
          },
          id: +id,
        },
      })
      .then((res) => res)
      .catch(() => {
        throw new BadRequestException();
      });
  }
}
