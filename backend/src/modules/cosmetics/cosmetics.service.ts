/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';
import {
  CosmeticsApiResponse,
  NewCosmeticsApiResponse,
  ShopApiResponse,
  ApiBRItem,
  ApiTrack,
  ApiInstrument,
  ApiCar,
  ApiLegoItem,
  ApiLegoKit,
  ApiBean,
  ApiShopEntry,
} from './interfaces/api-responses.interface';

@Injectable()
export class CosmeticsService {
  private readonly logger = new Logger(CosmeticsService.name);
  private readonly API_BASE = 'https://fortnite-api.com/v2';
  private readonly LANGUAGE = 'pt-BR';

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 🔄 Sincroniza dados completos da Fortnite API:
   * - Todos os cosméticos (/cosmetics)
   * - Novos cosméticos (/cosmetics/new)
   * - Itens da loja atual (/shop)
   */
  async syncAll() {
    this.logger.log('🚀 Iniciando sincronização com a Fortnite API...');

    const [cosmeticsRes, newCosmeticsRes, shopRes] = await Promise.all([
      axios.get<CosmeticsApiResponse>(
        `${this.API_BASE}/cosmetics?language=${this.LANGUAGE}`,
      ),
      axios.get<NewCosmeticsApiResponse>(
        `${this.API_BASE}/cosmetics/new?language=${this.LANGUAGE}`,
      ),
      axios.get<ShopApiResponse>(
        `${this.API_BASE}/shop?language=${this.LANGUAGE}`,
      ),
    ]);

    const cosmeticsData = cosmeticsRes.data?.data ?? {};
    const newCosmeticsData = newCosmeticsRes.data?.data ?? {};
    const shopData = shopRes.data?.data ?? {};

    // Processar na ordem: cosmetics → new → shop
    await this.syncCosmetics(cosmeticsData);
    await this.syncNewCosmetics(newCosmeticsData);
    await this.syncShop(shopData);

    this.logger.log('✅ Sincronização completa com sucesso.');
  }

  /**
   * 🕘 Sincroniza apenas a loja atual (/shop)
   */
  async syncShopOnly() {
    this.logger.log('🕘 Iniciando sincronização da loja com a Fortnite API...');

    const shopRes = await axios.get<ShopApiResponse>(
      `${this.API_BASE}/shop?language=${this.LANGUAGE}`,
    );

    const shopData = shopRes.data?.data ?? {};

    await this.syncShop(shopData);

    this.logger.log('✅ Loja sincronizada com sucesso.');
  }

  /**
   * 🧩 Sincroniza cosméticos gerais (endpoint /cosmetics)
   */
  private async syncCosmetics(data: any) {
    this.logger.log('📦 Sincronizando cosméticos de todas as categorias...');

    // Processar cada categoria
    if (data.br) await this.syncBRItems(data.br, 'BR');
    if (data.tracks) await this.syncTracks(data.tracks, 'TRACK');
    if (data.instruments) await this.syncInstruments(data.instruments, 'INSTRUMENT');
    if (data.cars) await this.syncCars(data.cars, 'CAR');
    if (data.lego) await this.syncLegoItems(data.lego, 'LEGO');
    if (data.legoKits) await this.syncLegoKits(data.legoKits, 'LEGOKIT');
    if (data.beans) await this.syncBeans(data.beans, 'BEAN');
  }

  /**
   * 🆕 Sincroniza cosméticos recém-lançados (/cosmetics/new)
   */
  private async syncNewCosmetics(data: any) {
    if (!data?.items) return;

    this.logger.log('✨ Sincronizando cosméticos novos...');

    const items = data.items;

    if (items.br) await this.syncBRItems(items.br, 'BR', true);
    if (items.tracks) await this.syncTracks(items.tracks, 'TRACK', true);
    if (items.instruments) await this.syncInstruments(items.instruments, 'INSTRUMENT', true);
    if (items.cars) await this.syncCars(items.cars, 'CAR', true);
    if (items.lego) await this.syncLegoItems(items.lego, 'LEGO', true);
    if (items.legoKits) await this.syncLegoKits(items.legoKits, 'LEGOKIT', true);
    if (items.beans) await this.syncBeans(items.beans, 'BEAN', true);
  }

  /**
   * 🛒 Sincroniza loja atual (/shop)
   */
  private async syncShop(shopData: any) {
    const entries: ApiShopEntry[] = shopData.entries ?? [];
    this.logger.log(`🛍️ Entradas de loja encontradas: ${entries.length}`);

    for (const entry of entries) {
      // Processar bundle se existir
      let bundle = entry.bundle?.name
        ? await this.prisma.bundle.upsert({
            where: { name: entry.bundle.name },
            update: {
              info: entry.bundle.info ?? null,
              imageUrl: entry.bundle.image ?? null,
              price: entry.finalPrice ?? null,
            },
            create: {
              name: entry.bundle.name,
              info: entry.bundle.info ?? null,
              imageUrl: entry.bundle.image ?? null,
              price: entry.finalPrice ?? null,
            },
          })
        : null;

      // Processar todos os tipos de itens
      const itemIds = {
        cosmeticId: null as string | null,
        trackId: null as string | null,
        instrumentId: null as string | null,
        carId: null as string | null,
        legoKitId: null as string | null,
      };

      // BR Items
      if (entry.brItems && entry.brItems.length > 0) {
        // Se há múltiplos itens, é um bundle implícito
        const isImplicitBundle = entry.brItems.length > 1 && !bundle;

        for (const item of entry.brItems) {
          await this.upsertBRCosmetic(item, 'BR', entry.finalPrice, true);

          // Vincular ao bundle (explícito ou implícito)
          if (bundle || isImplicitBundle) {
            // Criar bundle implícito se necessário
            const actualBundle = bundle ?? await this.prisma.bundle.upsert({
              where: { name: entry.devName ?? `Bundle_${entry.offerId}` },
              update: {
                price: entry.finalPrice ?? null,
              },
              create: {
                name: entry.devName ?? `Bundle_${entry.offerId}`,
                info: `Bundle com ${entry.brItems.length} itens`,
                price: entry.finalPrice ?? null,
              },
            });

            await this.prisma.bundleCosmetic.upsert({
              where: {
                bundleId_cosmeticId: {
                  bundleId: actualBundle.id,
                  cosmeticId: item.id,
                },
              },
              update: {},
              create: {
                bundleId: actualBundle.id,
                cosmeticId: item.id,
              },
            });

            // Guardar bundleId para o ShopEntry
            itemIds.cosmeticId = null; // Bundle não tem cosmeticId direto
            bundle = actualBundle; // Atualizar referência
          } else {
            // Item individual
            itemIds.cosmeticId = item.id;
          }
        }
      }

      // Tracks
      if (entry.tracks && entry.tracks.length > 0) {
        for (const track of entry.tracks) {
          await this.upsertTrack(track, 'TRACK', entry.finalPrice, true);
          itemIds.trackId = track.id;
        }
      }

      // Instruments
      if (entry.instruments && entry.instruments.length > 0) {
        for (const instrument of entry.instruments) {
          await this.upsertInstrument(instrument, 'INSTRUMENT', entry.finalPrice, true);
          itemIds.instrumentId = instrument.id;
        }
      }

      // Cars
      if (entry.cars && entry.cars.length > 0) {
        for (const car of entry.cars) {
          await this.upsertCar(car, 'CAR', entry.finalPrice, true);
          itemIds.carId = car.id;
        }
      }

      // Lego Kits
      if (entry.legoKits && entry.legoKits.length > 0) {
        for (const kit of entry.legoKits) {
          await this.upsertLegoKit(kit, 'LEGOKIT', entry.finalPrice, true);
          itemIds.legoKitId = kit.id;
        }
      }

      // Criar ShopEntry
      await (this.prisma.shopEntry as any).upsert({
        where: { offerId: entry.offerId ?? `entry_${Date.now()}` },
          update: {
          devName: entry.devName ?? null,
          finalPrice: entry.finalPrice ?? null,
          regularPrice: entry.regularPrice ?? null,
            inDate: entry.inDate ? new Date(entry.inDate) : null,
            outDate: entry.outDate ? new Date(entry.outDate) : null,
            bannerText: entry.banner?.value ?? null,
          bannerValue: entry.banner?.value ?? null,
          bannerIntensity: entry.banner?.intensity ?? null,
          bannerBackendValue: entry.banner?.backendValue ?? null,
          offerTagId: entry.offerTag?.id ?? null,
          offerTagText: entry.offerTag?.text ?? null,
          layoutId: entry.layout?.id ?? entry.layoutId ?? null,
          layoutName: entry.layout?.name ?? null,
          sortPriority: entry.sortPriority ?? null,
          isGiftable: entry.giftable ?? false,
          isRefundable: entry.refundable ?? false,
            bundleId: bundle?.id ?? null,
          cosmeticId: itemIds.cosmeticId,
          trackId: itemIds.trackId,
          instrumentId: itemIds.instrumentId,
          carId: itemIds.carId,
          legoKitId: itemIds.legoKitId,
          rawData: entry as any,
          // Layout design properties
          layoutBackground: entry.layout?.textureMetadata?.find((t: any) => t.key === 'background')?.value ?? null,
          layoutForeground: entry.layout?.textureMetadata?.find((t: any) => t.key === 'foreground')?.value ?? null,
          layoutBanner: entry.layout?.textureMetadata?.find((t: any) => t.key === 'banner')?.value ?? null,
          layoutBodyImage: entry.layout?.textureMetadata?.find((t: any) => t.key === 'bodyImage')?.value ?? null,
          layoutColor1: entry.colors?.color1 ?? null,
          layoutColor3: entry.colors?.color3 ?? null,
          layoutTextBgColor: entry.colors?.textBackgroundColor ?? null,
          layoutAlignment: entry.layout?.stringMetadata?.find((s: any) => s.key === 'alignment')?.value ?? null,
          layoutTitleColorA: entry.layout?.stringMetadata?.find((s: any) => s.key === 'titleColorA')?.value ?? null,
          layoutTitleColorB: entry.layout?.stringMetadata?.find((s: any) => s.key === 'titleColorB')?.value ?? null,
          layoutTitle: entry.layout?.textMetadata?.find((t: any) => t.key === 'title')?.value ?? null,
          layoutSubtitle: entry.layout?.textMetadata?.find((t: any) => t.key === 'subtitle')?.value ?? null,
          layoutCta: entry.layout?.textMetadata?.find((t: any) => t.key === 'cta')?.value ?? null,
          displayType: entry.layout?.displayType ?? null,
          tileSize: entry.tileSize ?? null,
          },
          create: {
          offerId: entry.offerId ?? `entry_${Date.now()}`,
          devName: entry.devName ?? null,
          finalPrice: entry.finalPrice ?? null,
          regularPrice: entry.regularPrice ?? null,
            inDate: entry.inDate ? new Date(entry.inDate) : null,
            outDate: entry.outDate ? new Date(entry.outDate) : null,
            bannerText: entry.banner?.value ?? null,
          bannerValue: entry.banner?.value ?? null,
          bannerIntensity: entry.banner?.intensity ?? null,
          bannerBackendValue: entry.banner?.backendValue ?? null,
          offerTagId: entry.offerTag?.id ?? null,
          offerTagText: entry.offerTag?.text ?? null,
          layoutId: entry.layout?.id ?? entry.layoutId ?? null,
          layoutName: entry.layout?.name ?? null,
          sortPriority: entry.sortPriority ?? null,
          isGiftable: entry.giftable ?? false,
          isRefundable: entry.refundable ?? false,
            bundleId: bundle?.id ?? null,
          cosmeticId: itemIds.cosmeticId,
          trackId: itemIds.trackId,
          instrumentId: itemIds.instrumentId,
          carId: itemIds.carId,
          legoKitId: itemIds.legoKitId,
          rawData: entry as any,
          // Layout design properties
          layoutBackground: entry.layout?.textureMetadata?.find((t: any) => t.key === 'background')?.value ?? null,
          layoutForeground: entry.layout?.textureMetadata?.find((t: any) => t.key === 'foreground')?.value ?? null,
          layoutBanner: entry.layout?.textureMetadata?.find((t: any) => t.key === 'banner')?.value ?? null,
          layoutBodyImage: entry.layout?.textureMetadata?.find((t: any) => t.key === 'bodyImage')?.value ?? null,
          layoutColor1: entry.colors?.color1 ?? null,
          layoutColor3: entry.colors?.color3 ?? null,
          layoutTextBgColor: entry.colors?.textBackgroundColor ?? null,
          layoutAlignment: entry.layout?.stringMetadata?.find((s: any) => s.key === 'alignment')?.value ?? null,
          layoutTitleColorA: entry.layout?.stringMetadata?.find((s: any) => s.key === 'titleColorA')?.value ?? null,
          layoutTitleColorB: entry.layout?.stringMetadata?.find((s: any) => s.key === 'titleColorB')?.value ?? null,
          layoutTitle: entry.layout?.textMetadata?.find((t: any) => t.key === 'title')?.value ?? null,
          layoutSubtitle: entry.layout?.textMetadata?.find((t: any) => t.key === 'subtitle')?.value ?? null,
          layoutCta: entry.layout?.textMetadata?.find((t: any) => t.key === 'cta')?.value ?? null,
          displayType: entry.layout?.displayType ?? null,
          tileSize: entry.tileSize ?? null,
          },
        });
      }
  }

  // ==================== Funções auxiliares por tipo ====================

  /**
   * Sincroniza múltiplos itens BR
   */
  private async syncBRItems(items: ApiBRItem[], category: string, isNew = false) {
    if (!Array.isArray(items)) return;
    this.logger.log(`📦 Sincronizando ${items.length} itens BR...`);

    for (const item of items) {
      await this.upsertBRCosmetic(item, category, null, isNew);
    }
  }

  /**
   * Cria/atualiza um cosmético BR e seu modelo especializado
   */
  private async upsertBRCosmetic(
    item: ApiBRItem,
    category: string,
    price: number | null = null,
    isNew = false,
  ) {
    if (!item.name) {
      this.logger.warn(`Item BR ${item.id} sem nome, pulando...`);
      return;
    }

    // Upsert Cosmetic base
    await this.prisma.cosmetic.upsert({
      where: { id: item.id },
      update: {
        name: item.name,
        description: item.description ?? null,
        type: item.type?.displayValue ?? item.type?.value ?? null,
        rarity: item.rarity?.displayValue ?? null,
        series: item.series?.value ?? null,
        setName: item.set?.text ?? null,
        category: category as any,
        addedAt: item.added ? new Date(item.added) : null,
        shopHistory: item.shopHistory ?? [],
      },
      create: {
        id: item.id,
        name: item.name,
        description: item.description ?? null,
        type: item.type?.displayValue ?? item.type?.value ?? null,
        rarity: item.rarity?.displayValue ?? null,
        series: item.series?.value ?? null,
        setName: item.set?.text ?? null,
        category: category as any,
        addedAt: item.added ? new Date(item.added) : null,
        shopHistory: item.shopHistory ?? [],
      },
    });

    // Upsert BRCosmetic especializado
    await (this.prisma as any).bRCosmetic.upsert({
      where: { id: item.id },
      update: {
        exclusiveDescription: item.exclusiveDescription ?? null,
        unlockRequirements: item.unlockRequirements ?? null,
        customExclusiveCallout: item.customExclusiveCallout ?? null,
        imageSmallIcon: item.images?.smallIcon ?? null,
        imageIcon: item.images?.icon ?? null,
        imageFeatured: item.images?.featured ?? null,
        imageLegoSmall: item.images?.lego?.small ?? null,
        imageLegoLarge: item.images?.lego?.large ?? null,
        imageLegoWide: item.images?.lego?.wide ?? null,
        imageBeanSmall: item.images?.bean?.small ?? null,
        imageBeanLarge: item.images?.bean?.large ?? null,
        variants: item.variants ?? null,
        introduction: item.introduction ?? null,
        builtInEmoteIds: item.builtInEmoteIds ?? null,
        searchTags: item.searchTags ?? null,
        gameplayTags: item.gameplayTags ?? null,
        metaTags: item.metaTags ?? null,
        showcaseVideo: item.showcaseVideo ?? null,
        dynamicPakId: item.dynamicPakId ?? null,
        itemPreviewHeroPath: item.itemPreviewHeroPath ?? null,
        displayAssetPath: item.displayAssetPath ?? null,
        definitionPath: item.definitionPath ?? null,
        path: item.path ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
      create: {
        id: item.id,
        exclusiveDescription: item.exclusiveDescription ?? null,
        unlockRequirements: item.unlockRequirements ?? null,
        customExclusiveCallout: item.customExclusiveCallout ?? null,
        imageSmallIcon: item.images?.smallIcon ?? null,
        imageIcon: item.images?.icon ?? null,
        imageFeatured: item.images?.featured ?? null,
        imageLegoSmall: item.images?.lego?.small ?? null,
        imageLegoLarge: item.images?.lego?.large ?? null,
        imageLegoWide: item.images?.lego?.wide ?? null,
        imageBeanSmall: item.images?.bean?.small ?? null,
        imageBeanLarge: item.images?.bean?.large ?? null,
        variants: item.variants ?? null,
        introduction: item.introduction ?? null,
        builtInEmoteIds: item.builtInEmoteIds ?? null,
        searchTags: item.searchTags ?? null,
        gameplayTags: item.gameplayTags ?? null,
        metaTags: item.metaTags ?? null,
        showcaseVideo: item.showcaseVideo ?? null,
        dynamicPakId: item.dynamicPakId ?? null,
        itemPreviewHeroPath: item.itemPreviewHeroPath ?? null,
        displayAssetPath: item.displayAssetPath ?? null,
        definitionPath: item.definitionPath ?? null,
        path: item.path ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
    });
  }

  /**
   * Sincroniza múltiplas tracks
   */
  private async syncTracks(tracks: ApiTrack[], category: string, isNew = false) {
    if (!Array.isArray(tracks)) return;
    this.logger.log(`🎵 Sincronizando ${tracks.length} tracks...`);

    for (const track of tracks) {
      await this.upsertTrack(track, category, null, isNew);
    }
  }

  /**
   * Cria/atualiza uma track
   */
  private async upsertTrack(
    track: ApiTrack,
    category: string,
    price: number | null = null,
    isNew = false,
  ) {
    const name = track.title || track.devName || `Track ${track.id}`;

    // Upsert Cosmetic base
    await this.prisma.cosmetic.upsert({
      where: { id: track.id },
      update: {
        name,
        description: `${track.artist ?? 'Artista desconhecido'} - ${track.album ?? 'Álbum desconhecido'}`,
        type: 'Track',
        category: category as any,
        addedAt: track.added ? new Date(track.added) : null,
        shopHistory: track.shopHistory ?? [],
      },
      create: {
        id: track.id,
        name,
        description: `${track.artist ?? 'Artista desconhecido'} - ${track.album ?? 'Álbum desconhecido'}`,
        type: 'Track',
        category: category as any,
        addedAt: track.added ? new Date(track.added) : null,
        shopHistory: track.shopHistory ?? [],
      },
    });

    // Upsert Track especializado
    await (this.prisma as any).track.upsert({
      where: { id: track.id },
      update: {
        devName: track.devName ?? null,
        title: track.title ?? null,
        artist: track.artist ?? null,
        album: track.album ?? null,
        releaseYear: track.releaseYear ?? null,
        bpm: track.bpm ?? null,
        duration: track.duration ?? null,
        difficulty: track.difficulty ?? null,
        genres: track.genres ?? null,
        albumArt: track.albumArt ?? null,
        gameplayTags: track.gameplayTags ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
      create: {
        id: track.id,
        devName: track.devName ?? null,
        title: track.title ?? null,
        artist: track.artist ?? null,
        album: track.album ?? null,
        releaseYear: track.releaseYear ?? null,
        bpm: track.bpm ?? null,
        duration: track.duration ?? null,
        difficulty: track.difficulty ?? null,
        genres: track.genres ?? null,
        albumArt: track.albumArt ?? null,
        gameplayTags: track.gameplayTags ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
    });
  }

  /**
   * Sincroniza múltiplos instrumentos
   */
  private async syncInstruments(
    instruments: ApiInstrument[],
    category: string,
    isNew = false,
  ) {
    if (!Array.isArray(instruments)) return;
    this.logger.log(`🎸 Sincronizando ${instruments.length} instrumentos...`);

    for (const instrument of instruments) {
      await this.upsertInstrument(instrument, category, null, isNew);
    }
  }

  /**
   * Cria/atualiza um instrumento
   */
  private async upsertInstrument(
    instrument: ApiInstrument,
    category: string,
    price: number | null = null,
    isNew = false,
  ) {
    if (!instrument.name) {
      this.logger.warn(`Instrumento ${instrument.id} sem nome, pulando...`);
      return;
    }

    // Upsert Cosmetic base
    await this.prisma.cosmetic.upsert({
      where: { id: instrument.id },
      update: {
        name: instrument.name,
        description: instrument.description ?? null,
        type: instrument.type?.displayValue ?? instrument.type?.value ?? null,
        rarity: instrument.rarity?.displayValue ?? null,
        series: instrument.series?.value ?? null,
        category: category as any,
        addedAt: instrument.added ? new Date(instrument.added) : null,
        shopHistory: instrument.shopHistory ?? [],
      },
      create: {
        id: instrument.id,
        name: instrument.name,
        description: instrument.description ?? null,
        type: instrument.type?.displayValue ?? instrument.type?.value ?? null,
        rarity: instrument.rarity?.displayValue ?? null,
        series: instrument.series?.value ?? null,
        category: category as any,
        addedAt: instrument.added ? new Date(instrument.added) : null,
        shopHistory: instrument.shopHistory ?? [],
      },
    });

    // Upsert Instrument especializado
    await (this.prisma as any).instrument.upsert({
      where: { id: instrument.id },
      update: {
        imageSmall: instrument.images?.small ?? null,
        imageLarge: instrument.images?.large ?? null,
        gameplayTags: instrument.gameplayTags ?? null,
        path: instrument.path ?? null,
        showcaseVideo: instrument.showcaseVideo ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
      create: {
        id: instrument.id,
        imageSmall: instrument.images?.small ?? null,
        imageLarge: instrument.images?.large ?? null,
        gameplayTags: instrument.gameplayTags ?? null,
        path: instrument.path ?? null,
        showcaseVideo: instrument.showcaseVideo ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
    });
  }

  /**
   * Sincroniza múltiplos carros
   */
  private async syncCars(cars: ApiCar[], category: string, isNew = false) {
    if (!Array.isArray(cars)) return;
    this.logger.log(`🚗 Sincronizando ${cars.length} carros...`);

    for (const car of cars) {
      await this.upsertCar(car, category, null, isNew);
    }
  }

  /**
   * Cria/atualiza um carro
   */
  private async upsertCar(
    car: ApiCar,
    category: string,
    price: number | null = null,
    isNew = false,
  ) {
    if (!car.name) {
      this.logger.warn(`Carro ${car.id} sem nome, pulando...`);
      return;
    }

    // Upsert Cosmetic base
    await this.prisma.cosmetic.upsert({
      where: { id: car.id },
      update: {
        name: car.name,
        description: car.description ?? null,
        type: car.type?.displayValue ?? car.type?.value ?? null,
        rarity: car.rarity?.displayValue ?? null,
        series: car.series?.value ?? null,
        category: category as any,
        addedAt: car.added ? new Date(car.added) : null,
        shopHistory: car.shopHistory ?? [],
      },
      create: {
        id: car.id,
        name: car.name,
        description: car.description ?? null,
        type: car.type?.displayValue ?? car.type?.value ?? null,
        rarity: car.rarity?.displayValue ?? null,
        series: car.series?.value ?? null,
        category: category as any,
        addedAt: car.added ? new Date(car.added) : null,
        shopHistory: car.shopHistory ?? [],
      },
    });

    // Upsert Car especializado
    await (this.prisma as any).car.upsert({
      where: { id: car.id },
      update: {
        vehicleId: car.vehicleId ?? null,
        imageSmall: car.images?.small ?? null,
        imageLarge: car.images?.large ?? null,
        gameplayTags: car.gameplayTags ?? null,
        path: car.path ?? null,
        showcaseVideo: car.showcaseVideo ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
      create: {
        id: car.id,
        vehicleId: car.vehicleId ?? null,
        imageSmall: car.images?.small ?? null,
        imageLarge: car.images?.large ?? null,
        gameplayTags: car.gameplayTags ?? null,
        path: car.path ?? null,
        showcaseVideo: car.showcaseVideo ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
    });
  }

  /**
   * Sincroniza múltiplos itens lego
   */
  private async syncLegoItems(items: ApiLegoItem[], category: string, isNew = false) {
    if (!Array.isArray(items)) return;
    this.logger.log(`🧱 Sincronizando ${items.length} itens lego...`);

    for (const item of items) {
      await this.upsertLegoItem(item, category, null, isNew);
    }
  }

  /**
   * Cria/atualiza um item lego
   */
  private async upsertLegoItem(
    item: ApiLegoItem,
    category: string,
    price: number | null = null,
    isNew = false,
  ) {
    const name = `Lego Item ${item.id}`;

    // Upsert Cosmetic base
    await this.prisma.cosmetic.upsert({
      where: { id: item.id },
      update: {
        name,
        category: category as any,
        addedAt: item.added ? new Date(item.added) : null,
      },
      create: {
        id: item.id,
        name,
        category: category as any,
        addedAt: item.added ? new Date(item.added) : null,
      },
    });

    // Upsert LegoItem especializado
    await (this.prisma as any).legoItem.upsert({
      where: { id: item.id },
      update: {
        cosmeticId: item.cosmeticId ?? null,
        soundLibraryTags: item.soundLibraryTags ?? null,
        imageSmall: item.images?.small ?? null,
        imageLarge: item.images?.large ?? null,
        imageWide: item.images?.wide ?? null,
        path: item.path ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
      create: {
        id: item.id,
        cosmeticId: item.cosmeticId ?? null,
        soundLibraryTags: item.soundLibraryTags ?? null,
        imageSmall: item.images?.small ?? null,
        imageLarge: item.images?.large ?? null,
        imageWide: item.images?.wide ?? null,
        path: item.path ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
    });
  }

  /**
   * Sincroniza múltiplos kits lego
   */
  private async syncLegoKits(kits: ApiLegoKit[], category: string, isNew = false) {
    if (!Array.isArray(kits)) return;
    this.logger.log(`🧱 Sincronizando ${kits.length} kits lego...`);

    for (const kit of kits) {
      await this.upsertLegoKit(kit, category, null, isNew);
    }
  }

  /**
   * Cria/atualiza um kit lego
   */
  private async upsertLegoKit(
    kit: ApiLegoKit,
    category: string,
    price: number | null = null,
    isNew = false,
  ) {
    if (!kit.name) {
      this.logger.warn(`Kit Lego ${kit.id} sem nome, pulando...`);
      return;
    }

    // Upsert Cosmetic base
    await this.prisma.cosmetic.upsert({
      where: { id: kit.id },
      update: {
        name: kit.name,
        type: kit.type?.displayValue ?? kit.type?.value ?? null,
        series: kit.series?.value ?? null,
        category: category as any,
        addedAt: kit.added ? new Date(kit.added) : null,
        shopHistory: kit.shopHistory ?? [],
      },
      create: {
        id: kit.id,
        name: kit.name,
        type: kit.type?.displayValue ?? kit.type?.value ?? null,
        series: kit.series?.value ?? null,
        category: category as any,
        addedAt: kit.added ? new Date(kit.added) : null,
        shopHistory: kit.shopHistory ?? [],
      },
    });

    // Upsert LegoKit especializado
    await (this.prisma as any).legoKit.upsert({
      where: { id: kit.id },
      update: {
        imageSmall: kit.images?.small ?? null,
        imageLarge: kit.images?.large ?? null,
        imageWide: kit.images?.wide ?? null,
        gameplayTags: kit.gameplayTags ?? null,
        path: kit.path ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
      create: {
        id: kit.id,
        imageSmall: kit.images?.small ?? null,
        imageLarge: kit.images?.large ?? null,
        imageWide: kit.images?.wide ?? null,
        gameplayTags: kit.gameplayTags ?? null,
        path: kit.path ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
    });
  }

  /**
   * Sincroniza múltiplos beans
   */
  private async syncBeans(beans: ApiBean[], category: string, isNew = false) {
    if (!Array.isArray(beans)) return;
    this.logger.log(`🫘 Sincronizando ${beans.length} beans...`);

    for (const bean of beans) {
      await this.upsertBean(bean, category, null, isNew);
    }
  }

  /**
   * Cria/atualiza um bean
   */
  private async upsertBean(
    bean: ApiBean,
    category: string,
    price: number | null = null,
    isNew = false,
  ) {
    const name = bean.name || `Bean ${bean.id}`;

    // Upsert Cosmetic base
    await this.prisma.cosmetic.upsert({
      where: { id: bean.id },
      update: {
        name,
        category: category as any,
        addedAt: bean.added ? new Date(bean.added) : null,
      },
      create: {
        id: bean.id,
        name,
        category: category as any,
        addedAt: bean.added ? new Date(bean.added) : null,
      },
    });

    // Upsert Bean especializado
    await (this.prisma as any).bean.upsert({
      where: { id: bean.id },
      update: {
        cosmeticId: bean.cosmeticId ?? null,
        gender: bean.gender ?? null,
        imageSmall: bean.images?.small ?? null,
        imageLarge: bean.images?.large ?? null,
        gameplayTags: bean.gameplayTags ?? null,
        path: bean.path ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
      create: {
        id: bean.id,
        cosmeticId: bean.cosmeticId ?? null,
        gender: bean.gender ?? null,
        imageSmall: bean.images?.small ?? null,
        imageLarge: bean.images?.large ?? null,
        gameplayTags: bean.gameplayTags ?? null,
        path: bean.path ?? null,
        price: price ?? null,
        isNew,
        isOnSale: price !== null && price > 0,
      },
    });
  }

  // ==================== Métodos de Query ====================

  /**
   * 📋 Lista cosméticos com filtros e paginação
   */
  async findAll(params: {
    category?: string;
    rarity?: string;
    type?: string;
    isNew?: boolean;
    isOnSale?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const {
      category,
      rarity,
      type,
      isNew,
      isOnSale,
      search,
      limit = 50,
      offset = 0,
    } = params;

    const where: any = {};

    if (category) where.category = category;
    if (rarity) where.rarity = { contains: rarity, mode: 'insensitive' };
    if (type) where.type = { contains: type, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Nota: filtros isNew e isOnSale serão aplicados após a query
    // pois estão nos modelos especializados

    let items = await this.prisma.cosmetic.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
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

    // Filtrar por isNew ou isOnSale se especificado
    if (isNew !== undefined || isOnSale !== undefined) {
      items = items.filter((item: any) => {
        const specialized =
          item.brCosmetic ||
          item.track ||
          item.instrument ||
          item.car ||
          item.legoItem ||
          item.legoKit ||
          item.bean;

        if (!specialized) return false;

        if (isNew !== undefined && specialized.isNew !== isNew) return false;
        if (isOnSale !== undefined && specialized.isOnSale !== isOnSale)
          return false;

        return true;
      });
    }

    const total = await this.prisma.cosmetic.count({ where });

    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * 🆕 Lista apenas cosméticos novos
   */
  async findNew(params: { limit?: number; offset?: number }) {
    const { limit = 50, offset = 0 } = params;

    const allItems = await this.prisma.cosmetic.findMany({
        orderBy: { addedAt: 'desc' },
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

    // Filtrar apenas os que têm isNew = true
    const filteredItems = allItems.filter((item: any) => {
      const specialized =
        item.brCosmetic ||
        item.track ||
        item.instrument ||
        item.car ||
        item.legoItem ||
        item.legoKit ||
        item.bean;
      return specialized && specialized.isNew === true;
    });

    const total = filteredItems.length;
    const items = filteredItems.slice(offset, offset + limit);

    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * 🛍️ Lista cosméticos em promoção
   */
  async findOnSale(params: { limit?: number; offset?: number }) {
    const { limit = 50, offset = 0 } = params;

    const allItems = await this.prisma.cosmetic.findMany({
        orderBy: { updatedAt: 'desc' },
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

    // Filtrar apenas os que têm isOnSale = true
    const filteredItems = allItems.filter((item: any) => {
      const specialized =
        item.brCosmetic ||
        item.track ||
        item.instrument ||
        item.car ||
        item.legoItem ||
        item.legoKit ||
        item.bean;
      return specialized && specialized.isOnSale === true;
    });

    const total = filteredItems.length;
    const items = filteredItems.slice(offset, offset + limit);

    return {
      items,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  /**
   * 🔍 Busca um cosmético específico por ID
   */
  async findOne(id: string) {
    const cosmetic = await this.prisma.cosmetic.findUnique({
      where: { id },
      include: {
        brCosmetic: true,
        track: true,
        instrument: true,
        car: true,
        legoItem: true,
        legoKit: true,
        bean: true,
        bundles: {
          include: {
            Bundle: true,
          },
        },
        shopEntries: {
          orderBy: { inDate: 'desc' },
          take: 5,
        },
      } as any,
    });

    if (!cosmetic) {
      throw new Error(`Cosmético com ID ${id} não encontrado`);
    }

    return cosmetic;
  }

  /**
   * 📊 Retorna estatísticas gerais dos cosméticos
   */
  async getStats() {
    const [
      total,
      totalBR,
      totalTracks,
      totalInstruments,
      totalCars,
      totalLego,
      totalLegoKits,
      totalBeans,
      byCategory,
      byRarity,
      recentlyAdded,
    ] = await Promise.all([
      this.prisma.cosmetic.count(),
      (this.prisma as any).bRCosmetic.count(),
      (this.prisma as any).track.count(),
      (this.prisma as any).instrument.count(),
      (this.prisma as any).car.count(),
      (this.prisma as any).legoItem.count(),
      (this.prisma as any).legoKit.count(),
      (this.prisma as any).bean.count(),
      this.prisma.cosmetic.groupBy({
        by: ['category'],
        _count: true,
      }),
      this.prisma.cosmetic.groupBy({
        by: ['rarity'],
        _count: true,
        where: { rarity: { not: null } },
      }),
      this.prisma.cosmetic.findMany({
        take: 10,
        orderBy: { addedAt: 'desc' },
        select: {
          id: true,
          name: true,
          rarity: true,
          addedAt: true,
          brCosmetic: {
            select: {
              imageIcon: true,
            },
          },
          track: {
            select: {
              albumArt: true,
            },
          },
        } as any,
      }),
    ]);

    return {
      total,
      byType: {
        br: totalBR,
        tracks: totalTracks,
        instruments: totalInstruments,
        cars: totalCars,
        lego: totalLego,
        legoKits: totalLegoKits,
        beans: totalBeans,
      },
      byCategory: byCategory.map((c) => ({
        category: c.category,
        count: c._count,
      })),
      byRarity: byRarity.map((r) => ({
        rarity: r.rarity,
        count: r._count,
      })),
      recentlyAdded,
    };
  }
}
