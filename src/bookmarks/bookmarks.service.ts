import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { FindBookmarksDto } from './dto/find-bookmarks.dto';
import { RemoveBookmarkDto } from './dto/remove-bookmark.dto';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBookmarkDto: CreateBookmarkDto) {
    const bookmark = await this.prisma.bookmark.create({
      data: {
        billboardId: Number(createBookmarkDto.billboardId),
        ownerId: Number(userId),
      },
      select: {
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
    });

    if (!bookmark) {
      throw new NotFoundException('Error occurred while adding bookmark');
    }

    return bookmark;
  }

  orderBy(
    sort: 'DATE_ASC' | 'DATE_DESC' | 'PRICE_ASC' | 'PRICE_DESC',
  ): Prisma.BookmarkOrderByWithRelationInput {
    switch (sort) {
      case 'DATE_ASC':
        return { createdAt: 'asc' };
      case 'DATE_DESC':
        return { createdAt: 'desc' };
      case 'PRICE_ASC':
        return { billboard: { price: 'asc' } };
      case 'PRICE_DESC':
        return { billboard: { price: 'desc' } };
      default:
        return { createdAt: 'desc' };
    }
  }

  async findAll(userId: string, data: FindBookmarksDto) {
    const filter: Prisma.BookmarkWhereInput = {
      ownerId: Number(userId),
    };

    const bookmarks = await this.prisma.bookmark.findMany({
      skip: data.offset,
      take: data.limit,
      where: filter,
      select: {
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
      orderBy: this.orderBy(data?.sort),
    });

    if (!bookmarks) {
      throw new NotFoundException('No bookmarks found');
    }

    // get the count using the smae filter as the findAll
    const aggregations = await this.prisma.bookmark.aggregate({
      _count: true,
      where: filter,
    });

    return {
      data: bookmarks.map((bookmark) => {
        const billboard = bookmark.billboard;
        return { ...billboard, bookmarked: true };
      }),
      count: aggregations._count,
    };
  }

  async remove(userId: string, removeBookmarkDto: RemoveBookmarkDto) {
    const bookmark = await this.prisma.bookmark.delete({
      where: {
        billboardId_ownerId: {
          ownerId: Number(userId),
          billboardId: Number(removeBookmarkDto.billboardId),
        },
      },
    });

    if (!bookmark) {
      throw new NotFoundException('Could not find billboard');
    }
  }
}
