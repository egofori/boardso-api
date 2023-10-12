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
        take: 10,
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

  async popularPlaces() {
    // list of popular localities and sublocalities
    const popularSublocalities = await this.prisma.billboardLocation.groupBy({
      by: ['sublocality', 'locality', 'administrativeAreaLevel2'],
      where: {
        OR: [
          {
            sublocality: {
              not: null,
            },
          },
          {
            sublocality: {
              equals: null,
            },
          },
        ],
        administrativeAreaLevel2: {
          not: null,
        },
      },
      _count: true,
      orderBy: [
        {
          _count: {
            id: 'desc',
          },
        },
        {
          sublocality: 'asc',
        },
        {
          locality: 'asc',
        },
      ],
      take: 6,
    });

    return popularSublocalities;
  }

  async locationBillboards(search: string) {
    const trimmedSearch = search?.trim();

    if (!trimmedSearch) return [];

    const billboards = await this.prisma.billboardLocation.findMany({
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
        id: true,
        lat: true,
        lng: true,
        billboard: {
          select: {
            updateAt: true,
            currency: true,
            id: true,
            slug: true,
            title: true,
            description: true,
            height: true,
            width: true,
            price: true,
            rate: true,
            type: true,
            status: true,
            thumbnailId: true,
            images: true,
            billboardLocation: {
              select: {
                address: true,
                lat: true,
                lng: true,
              },
            },
            owner: {
              select: {
                firstName: true,
                lastName: true,
                username: true,
                userProfile: {
                  select: {
                    profileImage: true,
                  },
                },
              },
            },
          },
        },
      },
      take: 10,
    });

    return billboards;
  }
}
