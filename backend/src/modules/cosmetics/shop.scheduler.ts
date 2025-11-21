import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CosmeticsService } from './cosmetics.service';

@Injectable()
export class ShopSchedulerService {
  private readonly logger = new Logger(ShopSchedulerService.name);

  constructor(private readonly cosmeticsService: CosmeticsService) {}

  @Cron('0 21 * * *', {
    timeZone: 'America/Sao_Paulo',
  })
  async handleDailyShopSync() {
    this.logger.log('🗓️ Iniciando sincronização agendada da loja (21h BRT)...');

    try {
      await this.cosmeticsService.syncShopOnly();
      this.logger.log('✅ Sincronização agendada da loja concluída com sucesso.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro desconhecido ao sincronizar a loja';
      const stack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `❌ Falha ao sincronizar a loja automaticamente: ${message}`,
        stack,
      );
    }
  }
}
