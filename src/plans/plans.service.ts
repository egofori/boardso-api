import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.plan
      .findMany({
        where: { active: true },
        select: {
          id: true,
          amount: true,
          name: true,
          currency: true,
          description: true,
          number: true,
          period: true,
          discount: {
            select: { amount: true, name: true, unit: true, description: true },
          },
        },
      })
      .then((response) => response)
      .catch((error) => {
        throw new BadRequestException(error);
      });
  }
}
