import { Module } from '@nestjs/common';
import { CosmeticsService } from './cosmetics.service';
import { CosmeticsController } from './cosmetics.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ShopSchedulerService } from './shop.scheduler';

@Module({
  imports: [PrismaModule],
  controllers: [CosmeticsController],
  providers: [CosmeticsService, ShopSchedulerService],
  exports: [CosmeticsService],
})
export class CosmeticsModule {}
