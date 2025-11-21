/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Body, Controller, Get, Post, Req, UseGuards, Query } from '@nestjs/common';
import { ShopService } from './shop.service';
import { PurchaseDto } from './dto/purchase.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('buy')
  @UseGuards(AuthGuard('jwt'))
  async buy(@Req() req, @Body() body: PurchaseDto) {
    if (body.bundleId) {
      return this.shopService.buyBundle(req.user.userId, body.bundleId);
    } else if (body.cosmeticId) {
      return this.shopService.buyCosmetic(req.user.userId, body.cosmeticId);
    }
    throw new Error('É necessário fornecer cosmeticId ou bundleId');
  }

  @Post('refund')
  @UseGuards(AuthGuard('jwt'))
  async refund(@Req() req, @Body() body: PurchaseDto) {
    if (body.bundleId) {
      return this.shopService.refundBundle(req.user.userId, body.bundleId);
    } else if (body.cosmeticId) {
      return this.shopService.refundCosmetic(req.user.userId, body.cosmeticId);
    }
    throw new Error('É necessário fornecer cosmeticId ou bundleId');
  }

  @Get('history')
  @UseGuards(AuthGuard('jwt'))
  async history(@Req() req) {
    return this.shopService.getHistory(req.user.userId);
  }

  @Get('current')
  async getCurrentShop(@Query('userId') userId?: string) {
    return this.shopService.getCurrentShop(userId);
  }
}
