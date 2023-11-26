import { Module } from '@nestjs/common';
import { ProfileImagesService } from './profile-images.service';
import { ProfileImagesController } from './profile-images.controller';
import { JWTStrategy } from '@/auth/jwt.strategy';

@Module({
  controllers: [ProfileImagesController],
  providers: [ProfileImagesService, JWTStrategy],
})
export class ProfileImagesModule {}
