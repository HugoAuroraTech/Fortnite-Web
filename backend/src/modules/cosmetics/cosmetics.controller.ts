import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { CosmeticsService } from './cosmetics.service';
import { QueryCosmeticsDto, PaginationDto } from './dto';

@Controller('cosmetics')
export class CosmeticsController {
  constructor(private readonly cosmeticsService: CosmeticsService) {}

  /**
   * 🔄 Sincroniza todos os dados da Fortnite API
   * POST /cosmetics/sync
   */
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncAll() {
    await this.cosmeticsService.syncAll();
    return {
      success: true,
      message: 'Sincronização completa realizada com sucesso',
    };
  }

  /**
   * 📊 Estatísticas dos cosméticos
   * GET /cosmetics/stats/summary
   */
  @Get('stats/summary')
  async getStats() {
    return this.cosmeticsService.getStats();
  }

  /**
   * 🆕 Lista apenas cosméticos novos
   * GET /cosmetics/new
   */
  @Get('new')
  async findNew(@Query() query: PaginationDto) {
    return this.cosmeticsService.findNew(query);
  }

  /**
   * 🛍️ Lista cosméticos em promoção
   * GET /cosmetics/on-sale
   */
  @Get('on-sale')
  async findOnSale(@Query() query: PaginationDto) {
    return this.cosmeticsService.findOnSale(query);
  }

  /**
   * ⭐ Lista cosméticos em destaque (alias para on-sale)
   * GET /cosmetics/featured
   */
  @Get('featured')
  async findFeatured(@Query() query: PaginationDto) {
    return this.cosmeticsService.findOnSale(query);
  }

  /**
   * 🔍 Busca cosmético por ID
   * GET /cosmetics/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.cosmeticsService.findOne(id);
    } catch (error) {
      throw new NotFoundException(`Cosmético com ID ${id} não encontrado`);
    }
  }

  /**
   * 📋 Lista todos os cosméticos com filtros
   * GET /cosmetics?category=BR&rarity=Legendary&isNew=true&isOnSale=true&limit=50&offset=0
   */
  @Get()
  async findAll(@Query() query: QueryCosmeticsDto) {
    return this.cosmeticsService.findAll(query);
  }
}
