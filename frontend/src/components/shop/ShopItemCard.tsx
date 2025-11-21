import { useState } from 'react';
import type { ShopItem } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PurchaseModal } from '@/components/shared/PurchaseModal';
import { RefundModal } from '@/components/shared/RefundModal';
import { RARITY_COLORS } from '@/constants';
import { ShoppingCart, Package, CheckCircle2, Undo2, Gift, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShopItemCardProps {
  item: ShopItem;
  isHero?: boolean;
}

export const ShopItemCard = ({ item, isHero = false }: ShopItemCardProps) => {
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getRarityColor = (rarity?: string) => {
    if (!rarity) return 'bg-gray-500';
    return RARITY_COLORS[rarity] || 'bg-gray-500';
  };

  const getRarityGradient = (rarity?: string) => {
    const gradients: Record<string, string> = {
      'Common': 'from-gray-500/20 to-gray-600/20',
      'Uncommon': 'from-green-500/20 to-green-600/20',
      'Rare': 'from-blue-500/20 to-blue-600/20',
      'Epic': 'from-purple-500/20 to-purple-600/20',
      'Legendary': 'from-orange-500/20 to-yellow-500/20',
      'Mythic': 'from-yellow-400/20 to-yellow-600/20',
      'Icon Series': 'from-cyan-400/20 to-blue-500/20',
      'Marvel Series': 'from-red-500/20 to-red-700/20',
      'DC Series': 'from-blue-600/20 to-blue-800/20',
      'Gaming Legends': 'from-purple-600/20 to-indigo-600/20',
      'Star Wars': 'from-yellow-400/20 to-red-500/20',
    };
    return gradients[rarity || ''] || 'from-gray-500/20 to-gray-600/20';
  };

  const isBundle = item.type === 'bundle';

  return (
    <>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-500 ease-out h-full",
          "hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2",
          "border-2 border-border hover:border-primary/50",
          "bg-gradient-to-br from-card via-card to-card/95",
          isHero && "border-4 border-primary/50 shadow-xl shadow-primary/30"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Gradient baseado na raridade */}
        {!isBundle && item.rarity && (
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            `bg-gradient-to-br ${getRarityGradient(item.rarity)}`
          )} />
        )}

        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/50 to-muted">
          {/* Image */}
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className={cn(
                "w-full h-full object-cover transition-all duration-700",
                isHovered ? "scale-125 rotate-3" : "scale-110"
              )}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              {isBundle ? (
                <Package className="w-24 h-24 text-muted-foreground/50" />
              ) : (
                <ShoppingCart className="w-24 h-24 text-muted-foreground/50" />
              )}
            </div>
          )}

          {/* Overlay gradient na parte inferior */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Rarity Strip - Mais proeminente */}
          {!isBundle && item.rarity && (
            <div className={cn(
              "absolute top-0 left-0 right-0 h-1.5 shadow-lg",
              getRarityColor(item.rarity)
            )} />
          )}

          {/* Badges superiores */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
            {/* Badge de Possui */}
            {item.owned && (
              <Badge className="bg-green-600 hover:bg-green-700 shadow-lg backdrop-blur-sm border border-green-400/30 gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                POSSUI
              </Badge>
            )}

            <div className="flex flex-col gap-2 ml-auto">
              {/* Banner */}
              {item.banner && (
                <Badge className="bg-red-600 hover:bg-red-700 shadow-lg backdrop-blur-sm border border-red-400/30 font-black text-xs">
                  {item.banner.text}
                </Badge>
              )}

              {/* New Badge */}
              {item.isNew && !item.banner && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-lg backdrop-blur-sm border border-emerald-300/30 font-black animate-pulse">
                  ✨ NOVO
                </Badge>
              )}
            </div>
          </div>

          {/* Badges inferiores */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
            {/* Giftable Badge */}
            {item.isGiftable && (
              <Badge variant="secondary" className="backdrop-blur-sm bg-background/80 border border-border/50 shadow-md gap-1">
                <Gift className="w-3 h-3" />
                <span className="text-xs font-semibold">Presenteável</span>
              </Badge>
            )}

            {/* Discount Badge */}
            {item.isOnSale && item.discount > 0 && (
              <Badge className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg backdrop-blur-sm border border-orange-300/30 font-black text-base px-3 py-1 gap-1">
                <TrendingDown className="w-4 h-4" />
                -{item.discount}%
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="relative p-5 space-y-3">
          {/* Type Tag */}
          {item.tag && (
            <Badge variant="outline" className="font-semibold border-primary/50 text-primary">
              {item.tag.text}
            </Badge>
          )}

          {/* Name */}
          <h3 className="font-black text-xl mb-1 line-clamp-2 leading-tight tracking-tight">
            {item.name}
          </h3>

          {/* Type & Rarity para itens individuais */}
          {!isBundle && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground/80">
                {item.itemType}
              </span>
              {item.rarity && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className={cn(
                    "text-sm font-bold",
                    item.rarity.includes('Legendary') && "text-orange-500",
                    item.rarity.includes('Epic') && "text-purple-500",
                    item.rarity.includes('Rare') && "text-blue-500",
                    item.rarity.includes('Uncommon') && "text-green-500"
                  )}>
                    {item.rarity}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Bundle Items Info */}
          {isBundle && item.items && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {item.items.length} {item.items.length === 1 ? 'item incluído' : 'itens incluídos'}
              </span>
            </div>
          )}

          {/* Price Section */}
          {item.price !== undefined && item.price !== null && (
            <div className="pt-2 border-t border-border/50">
              <div className="flex items-baseline gap-2 flex-wrap">
                {item.isOnSale && item.regularPrice && item.regularPrice > item.price ? (
                  <>
                    <span className="text-2xl font-black text-primary">
                      {item.price.toLocaleString()}
                    </span>
                    <span className="text-base text-muted-foreground line-through font-medium">
                      {item.regularPrice.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl font-black text-primary">
                    {item.price.toLocaleString()}
                  </span>
                )}
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  V-Bucks
                </span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="relative p-5 pt-0">
          {item.owned ? (
            <Button
              variant="outline"
              className={cn(
                "w-full gap-2 font-bold transition-all duration-300",
                "hover:bg-destructive hover:text-destructive-foreground hover:border-destructive",
                !item.isRefundable && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => setShowRefundModal(true)}
              disabled={!item.isRefundable}
              size="lg"
            >
              <Undo2 className="w-5 h-5" />
              {item.isRefundable ? 'Reembolsar' : 'Não Reembolsável'}
            </Button>
          ) : (
            <Button
              className={cn(
                "w-full gap-2 font-black text-base transition-all duration-300",
                "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
                "shadow-lg hover:shadow-xl hover:shadow-primary/50"
              )}
              onClick={() => setShowPurchaseModal(true)}
              size="lg"
            >
              <ShoppingCart className="w-5 h-5" />
              Comprar Agora
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Modals */}
      <PurchaseModal
        item={item}
        open={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
      <RefundModal
        item={item}
        open={showRefundModal}
        onClose={() => setShowRefundModal(false)}
      />
    </>
  );
};
