import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll({ page, limit }: PaginationDto) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          vbucks: true,
          createdAt: true,
          cosmetics: { select: { Cosmetic: true } },
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        vbucks: true,
        createdAt: true,
        cosmetics: {
          select: {
            Cosmetic: {
              select: {
                id: true,
                name: true,
                type: true,
                rarity: true,
                category: true,
                brCosmetic: {
                  select: {
                    imageIcon: true,
                    isOnSale: true,
                    isNew: true,
                  },
                },
                track: {
                  select: {
                    albumArt: true,
                    isOnSale: true,
                    isNew: true,
                  },
                },
                instrument: {
                  select: {
                    imageLarge: true,
                    isOnSale: true,
                    isNew: true,
                  },
                },
                car: {
                  select: {
                    imageLarge: true,
                    isOnSale: true,
                    isNew: true,
                  },
                },
                legoItem: {
                  select: {
                    imageLarge: true,
                    isOnSale: true,
                    isNew: true,
                  },
                },
                legoKit: {
                  select: {
                    imageLarge: true,
                    isOnSale: true,
                    isNew: true,
                  },
                },
                bean: {
                  select: {
                    imageLarge: true,
                    isOnSale: true,
                    isNew: true,
                  },
                },
              } as any,
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return user;
  }

  /**
   * 🎨 Retorna apenas os cosméticos de um usuário
   */
  async getUserCosmetics(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        cosmetics: {
          where: { isActive: true },
          select: {
            acquiredAt: true,
            Cosmetic: {
              select: {
                id: true,
                name: true,
                type: true,
                rarity: true,
                category: true,
                description: true,
                brCosmetic: {
                  select: {
                    imageIcon: true,
                    imageFeatured: true,
                    isNew: true,
                  },
                },
                track: {
                  select: {
                    albumArt: true,
                    artist: true,
                    title: true,
                    isNew: true,
                  },
                },
                instrument: {
                  select: {
                    imageLarge: true,
                    isNew: true,
                  },
                },
                car: {
                  select: {
                    imageLarge: true,
                    isNew: true,
                  },
                },
                legoItem: {
                  select: {
                    imageLarge: true,
                    isNew: true,
                  },
                },
                legoKit: {
                  select: {
                    imageLarge: true,
                    isNew: true,
                  },
                },
                bean: {
                  select: {
                    imageLarge: true,
                    isNew: true,
                  },
                },
              } as any,
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado.');

    return {
      userId: user.id,
      email: user.email,
      count: user.cosmetics.length,
      cosmetics: user.cosmetics.map((uc) => ({
        acquiredAt: uc.acquiredAt,
        Cosmetic: uc.Cosmetic,
      })),
    };
  }
}
