import { Link } from 'react-router-dom';
import type { Cosmetic } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWishlistStore } from '@/stores/wishlistStore';
import { RARITY_COLORS } from '@/constants';
import { Heart, Sparkles } from 'lucide-react';

interface CosmeticCardProps {
  cosmetic: Cosmetic;
}

export const CosmeticCard = ({ cosmetic }: CosmeticCardProps) => {
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const inWishlist = isInWishlist(cosmetic.id);

  const getRarityColor = (rarity?: string) => {
    if (!rarity) return 'bg-gray-500';
    return RARITY_COLORS[rarity] || 'bg-gray-500';
  };

  const getImage = () => {
    if (cosmetic.brCosmetic?.imageIcon) return cosmetic.brCosmetic.imageIcon;
    if (cosmetic.track?.albumArt) return cosmetic.track.albumArt;
    if (cosmetic.instrument?.imageSmall) return cosmetic.instrument.imageSmall;
    if (cosmetic.car?.imageSmall) return cosmetic.car.imageSmall;
    if (cosmetic.legoKit?.imageSmall) return cosmetic.legoKit.imageSmall;
    if (cosmetic.bean?.imageSmall) return cosmetic.bean.imageSmall;
    return null;
  };

  const getPrice = () => {
    if (cosmetic.brCosmetic?.price) return cosmetic.brCosmetic.price;
    if (cosmetic.track?.price) return cosmetic.track.price;
    if (cosmetic.instrument?.price) return cosmetic.instrument.price;
    if (cosmetic.car?.price) return cosmetic.car.price;
    if (cosmetic.legoKit?.price) return cosmetic.legoKit.price;
    if (cosmetic.bean?.price) return cosmetic.bean.price;
    return null;
  };

  const isNew = () => {
    if (cosmetic.brCosmetic?.isNew) return true;
    if (cosmetic.track?.isNew) return true;
    if (cosmetic.instrument?.isNew) return true;
    if (cosmetic.car?.isNew) return true;
    if (cosmetic.legoKit?.isNew) return true;
    if (cosmetic.bean?.isNew) return true;
    return false;
  };

  const isOnSale = () => {
    if (cosmetic.brCosmetic?.isOnSale) return true;
    if (cosmetic.track?.isOnSale) return true;
    if (cosmetic.instrument?.isOnSale) return true;
    if (cosmetic.car?.isOnSale) return true;
    if (cosmetic.legoKit?.isOnSale) return true;
    if (cosmetic.bean?.isOnSale) return true;
    return false;
  };

  const image = getImage();
  const price = getPrice();
  const showNew = isNew();
  const showOnSale = isOnSale();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group relative">
      <Link to={`/cosmetics/${cosmetic.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
          {/* Image */}
          {image ? (
            <img
              src={image}
              alt={cosmetic.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Sparkles className="w-20 h-20 text-muted-foreground" />
            </div>
          )}

          {/* Rarity Strip */}
          {cosmetic.rarity && (
            <div className={`absolute top-0 left-0 right-0 h-2 ${getRarityColor(cosmetic.rarity)}`} />
          )}

          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            {showNew && (
              <Badge className="bg-green-500 hover:bg-green-600">NOVO</Badge>
            )}
            {showOnSale && (
              <Badge className="bg-orange-500 hover:bg-orange-600">PROMOÇÃO</Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          {/* Category Badge */}
          <Badge variant="outline" className="mb-2">
            {cosmetic.category}
          </Badge>

          {/* Name */}
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{cosmetic.name}</h3>

          {/* Type & Rarity */}
          <p className="text-sm text-muted-foreground mb-2">
            {cosmetic.type} {cosmetic.rarity && `• ${cosmetic.rarity}`}
          </p>

          {/* Series */}
          {cosmetic.series && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {cosmetic.series}
            </p>
          )}

          {/* Price */}
          {price && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-lg font-bold text-primary">
                {price.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">V-Bucks</span>
            </div>
          )}
        </CardContent>
      </Link>

      {/* Wishlist Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 left-2 z-10"
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(cosmetic.id);
        }}
      >
        <Heart
          className={`w-5 h-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`}
        />
      </Button>
    </Card>
  );
};
