import {
  Controller,
  Delete,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileImagesService } from './profile-images.service';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { GetCurrentUserId } from '@/decorators/get-current-user-id.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageValidator } from '@/utils/constants';

@Controller('profile-images')
export class ProfileImagesController {
  constructor(private readonly profileImagesService: ProfileImagesService) {}

  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard)
  @Patch()
  updateProfileImage(
    @GetCurrentUserId() userId: string,
    @UploadedFile(imageValidator) image: Express.Multer.File,
  ) {
    return this.profileImagesService.updateProfileImage(userId, image);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  deleteProfileImage(@GetCurrentUserId() userId: string) {
    return this.profileImagesService.deleteUserProfileImage(userId);
  }
}
