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
} from '@nestjs/common';
import { BillboardsService } from './billboards.service';
import { CreateBillboardDto } from './dto/create-billboard.dto';
import { UpdateBillboardDto } from './dto/update-billboard.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

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

  @Get()
  findAll() {
    return this.billboardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // return this.billboardsService.findOne(+id);
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
