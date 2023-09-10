import { Module } from '@nestjs/common';
import { BillboardLocationsService } from './billboard-locations.service';
import { BillboardLocationsController } from './billboard-locations.controller';
import { PrismaService } from '@/prisma/prisma.service';

@Module({
  controllers: [BillboardLocationsController],
  providers: [BillboardLocationsService, PrismaService],
})
export class BillboardLocationsModule {}
