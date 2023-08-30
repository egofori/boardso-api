import { Module } from '@nestjs/common';
import { BillboardImagesService } from './billboard-images.service';

@Module({
  providers: [BillboardImagesService],
})
export class BillboardImagesModule {}
