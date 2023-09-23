import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserContactsService } from './user-contacts.service';
import { CreateUserContactDto } from './dto/create-user-contact.dto';
import { UpdateUserContactDto } from './dto/update-user-contact.dto';
import { GetCurrentUserId } from '@/decorators/get-current-user-id.decorator';
import { JwtAuthGuard } from '@/auth/jwt.guard';

@Controller('contacts')
export class UserContactsController {
  constructor(private readonly userContactsService: UserContactsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @GetCurrentUserId() userId: string,
    @Body() createUserContactDto: CreateUserContactDto,
  ) {
    return this.userContactsService.create(userId, createUserContactDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@GetCurrentUserId() userId: string) {
    return this.userContactsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userContactsService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserContactDto: UpdateUserContactDto,
  ) {
    return this.userContactsService.update(+id, updateUserContactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userContactsService.remove(+id);
  }
}