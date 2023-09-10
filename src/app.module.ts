import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { BillboardsModule } from './billboards/billboards.module';
import { BillboardImagesModule } from './billboard-images/billboard-images.module';
import { BillboardLocationsModule } from './billboard-locations/billboard-locations.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BillboardsModule,
    BillboardImagesModule,
    BillboardLocationsModule,
  ],
})
export class AppModule {}
