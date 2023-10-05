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

@Controller('billboards')
export class BillboardsController {
  constructor(private readonly billboardsService: BillboardsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  @UseInterceptors(FilesInterceptor('images', 5))
  create(
    @Body() createBillboardDto: CreateBillboardDto,
    @UploadedFiles() images: Array<Express.Multer.File>,
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
  @Get(':slug')
  findOne(@GetCurrentUserId() userId: string, @Param('slug') slug: string) {
    return this.billboardsService.findOne(userId, slug);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBillboardDto: UpdateBillboardDto,
  ) {
    return this.billboardsService.update(+id, updateBillboardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billboardsService.remove(+id);
  }
}
