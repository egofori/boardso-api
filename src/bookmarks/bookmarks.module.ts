import { Module } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { BookmarksController } from './bookmarks.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { JWTStrategy } from '@/auth/jwt.strategy';

@Module({
  controllers: [BookmarksController],
  providers: [BookmarksService, PrismaService, JWTStrategy],
})
export class BookmarksModule {}
