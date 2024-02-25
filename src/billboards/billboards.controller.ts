import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BillboardsService } from './billboards.service';
import { CreateBillboardDto } from './dto/create-billboard.dto';
import { UpdateBillboardDto } from './dto/update-billboard.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GetCurrentUserId } from 'src/decorators/get-current-user-id.decorator';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { SearchBillboardsDto } from './dto/search-billboards.dto';
import { PaginateInterceptor } from '../interceptors/paginate.interceptor';
import { AnonymousAuthGuard } from '@/auth/anonymous.guard';
import { GetBillboardDto } from './dto/get-billboard.dto';
import { imageValidator } from '@/utils/constants';

@Controller('billboards')
export class BillboardsController {
  constructor(private readonly billboardsService: BillboardsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  @UseInterceptors(FilesInterceptor('images', 10))
  create(
    @Body() createBillboardDto: CreateBillboardDto,
    @UploadedFiles(imageValidator)
    images: Array<Express.Multer.File>,
    @GetCurrentUserId() userId: string,
  ) {
    return this.billboardsService.create(+userId, createBillboardDto, images);
  }

  @UseGuards(AnonymousAuthGuard)
  @Get()
  @UseInterceptors(PaginateInterceptor)
  findAll(
    @GetCurrentUserId() userId: string,
    @Query() searchBillboardsDto?: SearchBillboardsDto,
  ) {
    return this.billboardsService.findAll(userId, searchBillboardsDto);
  }

  @UseGuards(AnonymousAuthGuard)
  @Get('billboard')
  findOne(
    @GetCurrentUserId() userId: string,
    @Query() getBillboardDto: GetBillboardDto,
  ) {
    return this.billboardsService.findOne(userId, getBillboardDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('images', 5))
  update(
    @Param('id') id: string,
    @Body() updateBillboardDto: UpdateBillboardDto,
    @GetCurrentUserId() userId: string,
    @UploadedFiles(imageValidator)
    images: Array<Express.Multer.File>,
  ) {
    return this.billboardsService.update(
      userId,
      id,
      updateBillboardDto,
      images,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@GetCurrentUserId() userId: string, @Param('id') id: string) {
    return this.billboardsService.remove(userId, id);
  }
}
