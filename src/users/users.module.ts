import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { JWTStrategy } from '@/auth/jwt.strategy';

@Module({
  controllers: [UsersController],
  providers: [UsersService, PrismaService, JWTStrategy],
})
export class UsersModule {}
