import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShopService {
  constructor(private prisma: PrismaService) {}

  /**
   * 🛒 Comprar um cosmético individual
   */
  async buyCosmetic(userId: string, cosmeticId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const cosmetic = await this.prisma.cosmetic.findUnique({
      where: { id: cosmeticId },
      include: {
        brCosmetic: true,
        track: true,
        instrument: true,
        car: true,
        legoItem: true,
        legoKit: true,
        bean: true,
      } as any,
    });

    if (!cosmetic) throw new NotFoundException('Cosmético não encontrado.');
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    const alreadyOwned = await this.prisma.userCosmetic.findFirst({
      where: { userId, cosmeticId, isActive: true },
    });
    if (alreadyOwned)
      throw new BadRequestException('Você já possui esse cosmético.');

    // Buscar preço no modelo especializado
    const specialized: any =
      (cosmetic as any).brCosmetic ||
      (cosmetic as any).track ||
      (cosmetic as any).instrument ||
      (cosmetic as any).car ||
      (cosmetic as any).legoItem ||
      (cosmetic as any).legoKit ||
      (cosmetic as any).bean;

    const price = specialized?.price ?? 500; // fallback caso não tenha preço definido
    if (user.vbucks < price)
      throw new ForbiddenException(
        'Saldo insuficiente para comprar este item.',
      );

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { vbucks: { decrement: price } },
      });

      await tx.userCosmetic.create({
        data: { userId, cosmeticId },
      });

      await tx.transaction.create({
        data: {
          userId,
          cosmeticId,
          amount: price,
          type: 'PURCHASE',
        },
      });
    });

    // Buscar usuário atualizado
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, vbucks: true, createdAt: true },
    });

    return {
      success: true,
      user: updatedUser,
    };
  }

  /**
   * 📦 Comprar um bundle completo
   */
  async buyBundle(userId: string, bundleId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const bundle = await this.prisma.bundle.findUnique({
      where: { id: bundleId },
      include: {
        cosmetics: {
          include: {
            Cosmetic: {
              include: {
                brCosmetic: true,
                track: true,
                instrument: true,
                car: true,
                legoItem: true,
                legoKit: true,
                bean: true,
              } as any,
            },
          },
        },
      },
    });

    if (!bundle) throw new NotFoundException('Bundle não encontrado.');
    if (!user) throw new NotFoundException('Usuário não encontrado.');

    // Verificar quais itens do bundle o usuário já possui
    const cosmeticIds = bundle.cosmetics.map((bc) => bc.cosmeticId);
    const ownedCosmetics = await this.prisma.userCosmetic.findMany({
      where: {
        userId,
        cosmeticId: { in: cosmeticIds },
        isActive: true,
      },
    });

    const ownedIds = new Set(ownedCosmetics.map((uc) => uc.cosmeticId));
    const itemsToBuy = bundle.cosmetics.filter(
      (bc) => !ownedIds.has(bc.cosmeticId),
    );

    if (itemsToBuy.length === 0) {
      throw new BadRequestException(
        'Você já possui todos os itens deste bundle.',
      );
    }

    const price = bundle.price ?? 1000; // fallback
    if (user.vbucks < price)
      throw new ForbiddenException(
        'Saldo insuficiente para comprar este bundle.',
      );

    // Executar transação
    await this.prisma.$transaction(async (tx) => {
      // Deduzir V-Bucks
      await tx.user.update({
        where: { id: userId },
        data: { vbucks: { decrement: price } },
      });

      // Adicionar todos os itens do bundle que o usuário não possui
      for (const item of itemsToBuy) {
        await tx.userCosmetic.create({
          data: {
            userId,
            cosmeticId: item.cosmeticId,
            bundleId, // Rastrear que foi comprado em um bundle
          },
        });
      }

      // Registrar transação do bundle
      await tx.transaction.create({
        data: {
          userId,
          bundleId,
          amount: price,
          type: 'PURCHASE',
        },
      });
    });

    // Buscar usuário atualizado
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, vbucks: true, createdAt: true },
    });

    return {
      success: true,
      user: updatedUser,
    };
  }

  /**
   * ♻️ Reembolsar um cosmético individual
   */
  async refundCosmetic(userId: string, cosmeticId: string) {
    const owned = await this.prisma.userCosmetic.findFirst({
      where: { userId, cosmeticId, isActive: true },
      include: {
        Cosmetic: {
          include: {
            brCosmetic: true,
            track: true,
            instrument: true,
            car: true,
            legoItem: true,
            legoKit: true,
            bean: true,
          } as any,
        },
        Bundle: true,
      },
    });

    if (!owned)
      throw new NotFoundException(
        'Você não possui este item ou já foi devolvido.',
      );

    // Verificar se foi comprado como parte de um bundle
    if (owned.bundleId) {
      throw new BadRequestException(
        'Este item foi comprado em um bundle. Para reembolsar, você deve devolver o bundle completo.',
      );
    }

    // Buscar preço no modelo especializado
    const specialized: any =
      (owned.Cosmetic as any).brCosmetic ||
      (owned.Cosmetic as any).track ||
      (owned.Cosmetic as any).instrument ||
      (owned.Cosmetic as any).car ||
      (owned.Cosmetic as any).legoItem ||
      (owned.Cosmetic as any).legoKit ||
      (owned.Cosmetic as any).bean;

    const price = specialized?.price ?? 500;

    await this.prisma.$transaction(async (tx) => {
      await tx.userCosmetic.update({
        where: { id: owned.id },
        data: { isActive: false, refundedAt: new Date() },
      });

      await tx.user.update({
        where: { id: userId },
        data: { vbucks: { increment: price } },
      });

      await tx.transaction.create({
        data: {
          userId,
          cosmeticId,
          amount: price,
          type: 'REFUND',
        },
      });
    });

    // Buscar usuário atualizado
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, vbucks: true, createdAt: true },
    });

    return {
      success: true,
      user: updatedUser,
    };
  }

  /**
   * 📦♻️ Reembolsar um bundle completo
   */
  async refundBundle(userId: string, bundleId: string) {
    // Buscar a transação de compra do bundle
    const bundleTransaction = await this.prisma.transaction.findFirst({
      where: {
        userId,
        bundleId,
        type: 'PURCHASE',
      },
      include: {
        Bundle: {
          include: {
            cosmetics: {
              include: {
                Cosmetic: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!bundleTransaction)
      throw new NotFoundException(
        'Você não comprou este bundle ou já foi reembolsado.',
      );

    const bundle = bundleTransaction.Bundle;
    if (!bundle) throw new NotFoundException('Bundle não encontrado.');

    // Buscar todos os itens do bundle que o usuário possui
    const cosmeticIds = bundle.cosmetics.map((bc) => bc.cosmeticId);
    const ownedCosmetics = await this.prisma.userCosmetic.findMany({
      where: {
        userId,
        cosmeticId: { in: cosmeticIds },
        isActive: true,
      },
      include: {
        Cosmetic: true,
      },
    });

    if (ownedCosmetics.length === 0) {
      throw new BadRequestException(
        'Você não possui mais nenhum item deste bundle.',
      );
    }

    const refundAmount = bundleTransaction.amount;

    // Executar transação de reembolso
    await this.prisma.$transaction(async (tx) => {
      // Devolver todos os itens do bundle
      for (const owned of ownedCosmetics) {
        await tx.userCosmetic.update({
          where: { id: owned.id },
          data: { isActive: false, refundedAt: new Date() },
        });
      }

      // Devolver V-Bucks
      await tx.user.update({
        where: { id: userId },
        data: { vbucks: { increment: refundAmount } },
      });

      // Registrar transação de reembolso
      await tx.transaction.create({
        data: {
          userId,
          bundleId,
          amount: refundAmount,
          type: 'REFUND',
        },
      });
    });

    // Buscar usuário atualizado
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, vbucks: true, createdAt: true },
    });

    return {
      success: true,
      user: updatedUser,
    };
  }

  /**
   * 📜 Histórico de transações (compras e reembolsos)
   */
  async getHistory(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: {
        Cosmetic: {
          include: {
            brCosmetic: true,
            track: true,
            instrument: true,
            car: true,
            legoItem: true,
            legoKit: true,
            bean: true,
          } as any,
        },
        Bundle: {
          include: {
            cosmetics: {
              include: {
                Cosmetic: {
                  include: {
                    brCosmetic: true,
                    track: true,
                    instrument: true,
                    car: true,
                    legoItem: true,
                    legoKit: true,
                    bean: true,
                  } as any,
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * 🛍️ Retorna a loja atual do Fortnite com bundles e itens individuais
   * @param userId - ID do usuário (opcional). Se fornecido, mostra quais itens o usuário já possui
   */
  async getCurrentShop(userId?: string) {
    // Buscar todas as entradas da loja ativas (dentro do período)
    const now = new Date();
    const shopEntries = await this.prisma.shopEntry.findMany({
      where: {
        OR: [
          { inDate: null, outDate: null }, // sem período definido
          {
            AND: [
              { inDate: { lte: now } },
              { outDate: { gte: now } },
            ],
          },
        ],
      },
      include: {
        Bundle: {
          include: {
            cosmetics: {
              include: {
                Cosmetic: {
                  include: {
                    brCosmetic: true,
                    track: true,
                    instrument: true,
                    car: true,
                    legoItem: true,
                    legoKit: true,
                    bean: true,
                  } as any,
                },
              },
            },
          },
        },
        Cosmetic: {
          include: {
            brCosmetic: true,
            track: true,
            instrument: true,
            car: true,
            legoItem: true,
            legoKit: true,
            bean: true,
          } as any,
        },
        Track: true,
        Instrument: true,
        Car: true,
        LegoKit: true,
      } as any,
      orderBy: { sortPriority: 'asc' },
    });

    // Buscar cosméticos que o usuário já possui (se userId foi fornecido)
    let ownedIds = new Set<string>();
    const ownedBundleMap = new Map<string, string | null>(); // cosmeticId -> bundleId

    if (userId) {
      const ownedCosmetics = await this.prisma.userCosmetic.findMany({
        where: { userId, isActive: true },
        select: { cosmeticId: true, bundleId: true },
      });
      ownedIds = new Set(ownedCosmetics.map((uc) => uc.cosmeticId));
      ownedCosmetics.forEach((uc) => {
        ownedBundleMap.set(uc.cosmeticId, uc.bundleId);
      });
    }

    // Organizar por bundles e itens individuais, agrupando por set/série
    const allItems: any[] = [];

    for (const entry of shopEntries) {
      const itemData = this.formatShopEntry(entry, ownedIds, ownedBundleMap);

      // Pular entradas inválidas
      if (!itemData) {
        continue;
      }

      const entryBundle = (entry as any).Bundle;

      if (entryBundle) {
        // É um bundle
        // Verificar se todos os itens do bundle foram comprados juntos
        const bundleItemIds = entryBundle.cosmetics.map((bc: any) => bc.Cosmetic.id);
        const allItemsOwnedFromBundle = bundleItemIds.every(
          (id: string) => ownedBundleMap.get(id) === entryBundle.id
        );

        allItems.push({
          ...itemData,
          type: 'bundle',
          setName: entryBundle.name, // Nome do bundle como set
          series: null,
          layoutCategory: this.categorizeLayout(entry),
          // Bundle só é reembolsável se todos os itens ainda estão ativos e foram comprados juntos
          isRefundable: (itemData.isRefundable || false) && allItemsOwnedFromBundle,
          // Dados de layout da API (sem cores - serão definidas no frontend)
          layoutId: (entry as any).layout?.id ?? (entry as any).layoutId,
          layoutName: (entry as any).layoutName,
          sortPriority: (entry as any).sortPriority,
          layoutBackground: (entry as any).layoutBackground,
          layoutForeground: (entry as any).layoutForeground,
          layoutBanner: (entry as any).layoutBanner,
          layoutBodyImage: (entry as any).layoutBodyImage,
          layoutAlignment: (entry as any).layoutAlignment,
          layoutTitle: (entry as any).layoutTitle,
          layoutSubtitle: (entry as any).layoutSubtitle,
          layoutCta: (entry as any).layoutCta,
          displayType: (entry as any).displayType,
          tileSize: (entry as any).tileSize,
          items: entryBundle.cosmetics.map((bc: any) => ({
            id: bc.Cosmetic.id,
            name: bc.Cosmetic.name,
            type: bc.Cosmetic.type,
            rarity: bc.Cosmetic.rarity,
            category: bc.Cosmetic.category,
            image: this.getCosmeticImage(bc.Cosmetic as any),
            owned: ownedIds.has(bc.Cosmetic.id),
          })),
        });
      } else {
        // É um item individual
        const entryCosmetic = (entry as any).Cosmetic;
        const entryTrack = (entry as any).Track?.Cosmetic;
        const entryInstrument = (entry as any).Instrument?.Cosmetic;
        const entryCar = (entry as any).Car?.Cosmetic;
        const entryLegoKit = (entry as any).LegoKit?.Cosmetic;

        const cosmetic = entryCosmetic || entryTrack || entryInstrument || entryCar || entryLegoKit;

        allItems.push({
          ...itemData,
          type: 'item',
          setName: cosmetic?.setName || null,
          series: cosmetic?.series || null,
          layoutCategory: this.categorizeLayout(entry),
          // Dados de layout da API (sem cores - serão definidas no frontend)
          layoutId: (entry as any).layout?.id ?? (entry as any).layoutId,
          layoutName: (entry as any).layoutName,
          sortPriority: (entry as any).sortPriority,
          layoutBackground: (entry as any).layoutBackground,
          layoutForeground: (entry as any).layoutForeground,
          layoutBanner: (entry as any).layoutBanner,
          layoutBodyImage: (entry as any).layoutBodyImage,
          layoutAlignment: (entry as any).layoutAlignment,
          layoutTitle: (entry as any).layoutTitle,
          layoutSubtitle: (entry as any).layoutSubtitle,
          layoutCta: (entry as any).layoutCta,
          displayType: (entry as any).displayType,
          tileSize: (entry as any).tileSize,
        });
      }
    }

    // Agrupar itens por set/série/categoria
    const groupedSections = this.groupItemsByTheme(allItems);

    return {
      refreshDate: this.getNextShopRefresh(),
      sections: groupedSections,
      totalItems: allItems.length,
    };
  }

  /**
   * Formata uma entrada da loja
   */
  private formatShopEntry(
    entry: any,
    ownedIds: Set<string>,
    ownedBundleMap: Map<string, string | null> = new Map()
  ) {
    // Se for um bundle
    if (entry.Bundle) {
      const bundle = entry.Bundle;

      // Validar se o bundle tem dados mínimos necessários
      if (!bundle.id || !bundle.name) {
        return null;
      }

      const bundlePrice = entry.finalPrice || bundle.price || 0;
      const bundleRegularPrice = entry.regularPrice || bundle.price || 0;

      // Verificar se todos os itens do bundle foram comprados juntos
      const bundleItemIds = bundle.cosmetics.map((bc: any) => bc.Cosmetic.id);
      const allItemsOwnedFromBundle = bundleItemIds.length > 0 && bundleItemIds.every(
        (id: string) => ownedBundleMap.get(id) === bundle.id
      );

      // 🆕 DETECTAR SE É BUNDLE IMPLÍCITO (nome começa com [VIRTUAL] ou Bundle_)
      const isImplicitBundle = bundle.name.startsWith('[VIRTUAL]') ||
                              bundle.name.startsWith('Bundle_');

      // 🆕 Para bundles implícitos, usar dados do primeiro item
      let displayName = bundle.name;
      let displayImage = bundle.imageUrl;
      let displayDescription = bundle.info;

      if (isImplicitBundle && bundle.cosmetics.length > 0) {
        const firstItem = bundle.cosmetics[0].Cosmetic;

        displayName = firstItem.name; // "A Rainha Outonal"
        displayImage = this.getCosmeticImage(firstItem); // Imagem do primeiro item
        displayDescription = firstItem.description || bundle.info;
      }

      return {
        offerId: entry.offerId,
        id: bundle.id,
        name: displayName, // ✅ Nome do primeiro item (se implícito)
        description: displayDescription,
        image: displayImage, // ✅ Imagem do primeiro item (se implícito)
        price: bundlePrice,
        regularPrice: bundleRegularPrice,
        isOnSale: bundleRegularPrice > 0 && bundlePrice < bundleRegularPrice,
        discount: bundleRegularPrice > 0
          ? Math.round(((bundleRegularPrice - bundlePrice) / bundleRegularPrice) * 100)
          : 0,
        banner: entry.bannerText
          ? {
              text: entry.bannerText,
              value: entry.bannerValue,
              intensity: entry.bannerIntensity,
            }
          : null,
        tag: entry.offerTagText
          ? {
              id: entry.offerTagId,
              text: entry.offerTagText,
            }
          : null,
        isNew: false,
        owned: allItemsOwnedFromBundle,
        isGiftable: entry.isGiftable || false,
        isRefundable: entry.isRefundable || false,
        expiresAt: entry.outDate,
      };
    }

    // Para itens individuais
    const cosmetic = entry.Cosmetic || entry.Track?.Cosmetic || entry.Instrument?.Cosmetic ||
                     entry.Car?.Cosmetic || entry.LegoKit?.Cosmetic;

    // Validar se o cosmético existe e tem dados mínimos
    if (!cosmetic || !cosmetic.id || !cosmetic.name) {
      return null;
    }

    const specialized = this.getSpecializedCosmetic(cosmetic);
    const image = this.getCosmeticImage(cosmetic);
    const itemPrice = entry.finalPrice || specialized?.price || 0;
    const itemRegularPrice = entry.regularPrice || specialized?.price || 0;

    return {
      offerId: entry.offerId,
      id: cosmetic.id,
      name: cosmetic.name,
      description: cosmetic.description,
      itemType: cosmetic.type, // Mapeado para itemType para o frontend
      type: cosmetic.type,
      rarity: cosmetic.rarity,
      series: cosmetic.series,
      category: cosmetic.category,
      image: image,
      price: itemPrice,
      regularPrice: itemRegularPrice,
      isOnSale: itemRegularPrice > 0 && itemPrice < itemRegularPrice,
      discount: itemRegularPrice > 0
        ? Math.round(((itemRegularPrice - itemPrice) / itemRegularPrice) * 100)
        : 0,
      banner: entry.bannerText
        ? {
            text: entry.bannerText,
            value: entry.bannerValue,
            intensity: entry.bannerIntensity,
          }
        : null,
      tag: entry.offerTagText
        ? {
            id: entry.offerTagId,
            text: entry.offerTagText,
          }
        : null,
      isNew: specialized?.isNew || false,
      owned: ownedIds.has(cosmetic.id),
      isGiftable: entry.isGiftable || false,
      // Item só é reembolsável se não foi comprado em um bundle
      isRefundable: (entry.isRefundable || false) &&
                    ownedIds.has(cosmetic.id) &&
                    !ownedBundleMap.get(cosmetic.id),
      expiresAt: entry.outDate,
    };
  }

  /**
   * Busca o modelo especializado de um cosmético
   */
  private getSpecializedCosmetic(cosmetic: any) {
    return (
      cosmetic.brCosmetic ||
      cosmetic.track ||
      cosmetic.instrument ||
      cosmetic.car ||
      cosmetic.legoItem ||
      cosmetic.legoKit ||
      cosmetic.bean ||
      null
    );
  }

  /**
   * Retorna a imagem apropriada de um cosmético baseado no tipo
   */
  private getCosmeticImage(cosmetic: any): string | null {
    if (cosmetic.brCosmetic?.imageFeatured) return cosmetic.brCosmetic.imageFeatured;
    if (cosmetic.brCosmetic?.imageIcon) return cosmetic.brCosmetic.imageIcon;
    if (cosmetic.track?.albumArt) return cosmetic.track.albumArt;
    if (cosmetic.instrument?.imageLarge) return cosmetic.instrument.imageLarge;
    if (cosmetic.car?.imageLarge) return cosmetic.car.imageLarge;
    if (cosmetic.legoKit?.imageLarge) return cosmetic.legoKit.imageLarge;
    if (cosmetic.legoItem?.imageLarge) return cosmetic.legoItem.imageLarge;
    if (cosmetic.bean?.imageLarge) return cosmetic.bean.imageLarge;
    return null;
  }

  /**
   * Categoriza uma entrada de loja baseada no layout
   */
  private categorizeLayout(entry: any): string {
    if (entry.layoutName?.toLowerCase().includes('featured')) {
      return 'featured';
    } else if (entry.layoutName?.toLowerCase().includes('daily')) {
      return 'daily';
    } else if (entry.bannerText || entry.offerTagText) {
      return 'special';
    }
    return 'daily';
  }

  /**
   * Agrupa itens por layout.id da API do Fortnite, criando seções temáticas
   */
  private groupItemsByTheme(items: any[]) {
    const layoutGroups = new Map<string, any[]>();
    const ungroupedItems: any[] = [];

    // Agrupar por layout.id (extrair base sem sufixo numérico se existir)
    for (const item of items) {
      // Extrair o base layout.id (sem sufixo numérico se houver)
      // Ex: "SimpsonsBart.99" -> "SimpsonsBart" ou simplesmente "SimpsonsBart"
      const layoutId = item.layoutId?.split('.')[0];

      if (layoutId) {
        if (!layoutGroups.has(layoutId)) {
          layoutGroups.set(layoutId, []);
        }
        layoutGroups.get(layoutId)!.push(item);
      } else {
        ungroupedItems.push(item);
      }
    }

    const sections: any = {};
    let sectionIndex = 0;

    // Criar seções temáticas por layoutId
    for (const [layoutId, groupItems] of layoutGroups.entries()) {
      // Se grupo tem apenas 1 item, colocar nos não agrupados
      if (groupItems.length === 1) {
        ungroupedItems.push(...groupItems);
        continue;
      }

      // Ordenar por sortPriority (menor primeiro = mais importante)
      groupItems.sort((a, b) => (a.sortPriority ?? 999) - (b.sortPriority ?? 999));

      const firstItem = groupItems[0];
      const bundle = groupItems.find(item => item.type === 'bundle');

      const sectionKey = `layout_${sectionIndex++}`;
      sections[sectionKey] = {
        title: (firstItem.layoutTitle?.trim()) || bundle?.name || firstItem.layoutName || layoutId,
        subtitle: firstItem.layoutSubtitle?.trim() || null,
        cta: firstItem.layoutCta?.trim() || null,
        theme: firstItem.layoutName,
        layoutId: layoutId,

        // Imagens do layout
        backgroundImage: firstItem.layoutBackground,
        foregroundImage: firstItem.layoutForeground,
        bannerLogo: firstItem.layoutBanner,
        bodyImage: firstItem.layoutBodyImage,

        // Configurações
        alignment: firstItem.layoutAlignment || 'center',
        displayType: firstItem.displayType || 'billboard',
        tileSize: firstItem.tileSize,

        // Itens e metadados
        featuredImage: bundle?.image || firstItem.image,
        discount: bundle?.discount > 0 ? bundle.discount : null,
        type: 'themed',
        items: groupItems,
        count: groupItems.length,
      };
    }

    // Organizar itens não agrupados por categoria de layout
    const featured = ungroupedItems.filter(item => item.layoutCategory === 'featured');
    const daily = ungroupedItems.filter(item => item.layoutCategory === 'daily');
    const special = ungroupedItems.filter(item => item.layoutCategory === 'special');

    // Adicionar seções padrão apenas se tiverem itens
    if (featured.length > 0) {
      sections.featured = {
        title: 'Em Destaque',
        type: 'standard',
        items: featured,
        count: featured.length,
      };
    }

    if (daily.length > 0) {
      sections.daily = {
        title: 'Itens Diários',
        type: 'standard',
        items: daily,
        count: daily.length,
      };
    }

    if (special.length > 0) {
      sections.special = {
        title: 'Ofertas Especiais',
        type: 'standard',
        items: special,
        count: special.length,
      };
    }

    return sections;
  }

  /**
   * Calcula a próxima data de refresh da loja (diariamente às 00:00 UTC)
   */
  private getNextShopRefresh(): Date {
    const now = new Date();
    const BRT_OFFSET_MINUTES = -3 * 60; // Horário de Brasília (UTC-3)
    const offsetMs = BRT_OFFSET_MINUTES * 60 * 1000;

    const nowInBrt = new Date(now.getTime() + offsetMs);
    const nextRefreshInBrt = new Date(nowInBrt);
    nextRefreshInBrt.setHours(21, 0, 0, 0);

    if (nowInBrt >= nextRefreshInBrt) {
      nextRefreshInBrt.setDate(nextRefreshInBrt.getDate() + 1);
    }

    return new Date(nextRefreshInBrt.getTime() - offsetMs);
  }
}
