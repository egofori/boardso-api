import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BillboardsModule } from './billboards/billboards.module';
import { BillboardImagesModule } from './billboard-images/billboard-images.module';
import { BillboardLocationsModule } from './billboard-locations/billboard-locations.module';
import { UsersModule } from './users/users.module';
import { UserContactsModule } from './user-contacts/user-contacts.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { ProfileImagesModule } from './profile-images/profile-images.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    BillboardsModule,
    BillboardImagesModule,
    BillboardLocationsModule,
    UsersModule,
    UserContactsModule,
    BookmarksModule,
    ProfileImagesModule,
  ],
})
export class AppModule {}
