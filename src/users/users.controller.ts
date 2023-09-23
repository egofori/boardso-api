import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetCurrentUserId } from '@/decorators/get-current-user-id.decorator';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findOne(@GetCurrentUserId() userId: string) {
    return this.usersService.findOne(userId);
  }

  @Get(':username')
  findOneByUsername(@Param('username') username: string) {
    return this.usersService.findOneByUsername({ username });
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(
    @GetCurrentUserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(userId, updateUserDto);
  }

  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(JwtAuthGuard)
  @Patch('profile-image')
  updateProfileImage(
    @GetCurrentUserId() userId: string,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.usersService.updateProfileImage(userId, image);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
