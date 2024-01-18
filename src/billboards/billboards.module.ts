import { Module } from '@nestjs/common';
import { BillboardsService } from './billboards.service';
import { BillboardsController } from './billboards.controller';
import { JWTStrategy } from 'src/auth/jwt.strategy';
import { PrismaService } from 'src/prisma/prisma.service';
import { BillboardImagesService } from 'src/billboard-images/billboard-images.service';
import { UsersService } from '@/users/users.service';

@Module({
  controllers: [BillboardsController],
  providers: [
    BillboardsService,
    JWTStrategy,
    PrismaService,
    BillboardImagesService,
    UsersService,
  ],
})
export class BillboardsModule {}
