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

  @Get('/popular-places')
  popularPlaces() {
    return this.billboardLocationsService.popularPlaces();
  }

  @Get('/billboards')
  locationBillboards(@Query('location') location: string) {
    return this.billboardLocationsService.locationBillboards(location);
  }
}
