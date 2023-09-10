import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BillboardLocationsService {
  constructor(private prisma: PrismaService) {}

  async locationSearch(search: string) {
    const trimmedSearch = search?.trim();

    if (!trimmedSearch) return [];

    return await this.prisma.billboardLocation
      .findMany({
        where: {
          OR: [
            {
              address: {
                contains: trimmedSearch,
                mode: 'insensitive',
              },
            },
            {
              administrativeAreaLevel1: {
                contains: trimmedSearch,
                mode: 'insensitive',
              },
            },
            {
              administrativeAreaLevel2: {
                contains: trimmedSearch,
                mode: 'insensitive',
              },
            },
            {
              administrativeAreaLevel3: {
                contains: trimmedSearch,
                mode: 'insensitive',
              },
            },
            {
              locality: {
                contains: trimmedSearch,
                mode: 'insensitive',
              },
            },
            {
              sublocality: {
                contains: trimmedSearch,
                mode: 'insensitive',
              },
            },
            {
              country: {
                contains: trimmedSearch,
                mode: 'insensitive',
              },
            },
            {
              route: {
                contains: trimmedSearch,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          country: true,
          administrativeAreaLevel1: true,
          administrativeAreaLevel2: true,
          administrativeAreaLevel3: true,
          sublocality: true,
          locality: true,
          neighbourhood: true,
          route: true,
          address: true,
        },
      })
      .then((res) => {
        const locationsList = [];

        const searchRegex = new RegExp(trimmedSearch, 'i');

        res.forEach((location) => {
          for (const key in location) {
            if (location[key]) {
              if (location[key].search(searchRegex) !== -1)
                locationsList.push(location[key]);
            }
          }
        });

        const locaationsSet = new Set(locationsList);
        return Array.from(locaationsSet.values());
      });
  }
}
