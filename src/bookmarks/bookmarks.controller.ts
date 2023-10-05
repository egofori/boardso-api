import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { PaginateInterceptor } from '@/interceptors/paginate.interceptor';
import { FindBookmarksDto } from './dto/find-bookmarks.dto';
import { JwtAuthGuard } from '@/auth/jwt.guard';
import { GetCurrentUserId } from '@/decorators/get-current-user-id.decorator';

@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':billboardId')
  create(
    @GetCurrentUserId() userId: string,
    @Param('billboardId') billboardId: string,
  ) {
    return this.bookmarksService.create(userId, { billboardId });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @UseInterceptors(PaginateInterceptor)
  findAll(
    @GetCurrentUserId() userId: string,
    @Query() findBookmarksDto?: FindBookmarksDto,
  ) {
    return this.bookmarksService.findAll(userId, findBookmarksDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':billboardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @GetCurrentUserId() userId: string,
    @Param('billboardId') billboardId: string,
  ) {
    return this.bookmarksService.remove(userId, { billboardId });
  }
}
