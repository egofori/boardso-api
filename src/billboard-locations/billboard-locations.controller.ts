import { Controller, Get, Query } from '@nestjs/common';
import { BillboardLocationsService } from './billboard-locations.service';
import { SearchBillboardLocationDto } from './dto/search-billboard-location.dto';

@Controller('billboard-locations')
export class BillboardLocationsController {
  constructor(
    private readonly billboardLocationsService: BillboardLocationsService,
  ) {}

  @Get('/search')
  locationSearch(
    @Query() searchBillboardLocationDto: SearchBillboardLocationDto,
  ) {
    return this.billboardLocationsService.locationSearch(
      searchBillboardLocationDto.search,
    );
  }
}
