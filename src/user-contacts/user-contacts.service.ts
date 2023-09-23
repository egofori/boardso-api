import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserContactDto } from './dto/create-user-contact.dto';
import { UpdateUserContactDto } from './dto/update-user-contact.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserContactsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateUserContactDto) {
    if (!userId) {
      throw new UnauthorizedException('Unauthorized user');
    }
    const contact = await this.prisma.userContact.create({
      data: {
        userProfile: {
          connect: {
            userId: Number(userId),
          },
        },
        ...dto,
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
    if (!userId) {
      throw new UnauthorizedException('Unauthorized user');
    }

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

  findOne(id: number) {
    return `This action returns a #${id} userContact`;
  }

  update(id: number, dto: UpdateUserContactDto) {
    const updatedUserContact = this.prisma.userContact.update({
      where: {
        id,
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

  remove(id: number) {
    return `This action removes a #${id} userContact`;
  }
}
