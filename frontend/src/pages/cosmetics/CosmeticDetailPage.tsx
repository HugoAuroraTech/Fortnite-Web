import { useParams, Link } from 'react-router-dom';
import { useCosmetic } from '@/hooks/useCosmetics';
import { useWishlistStore } from '@/stores/wishlistStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { RARITY_COLORS, ROUTES } from '@/constants';
import { Heart, ArrowLeft, Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CosmeticDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { cosmetic, isLoading } = useCosmetic(id!);
  const { isInWishlist, toggleWishlist } = useWishlistStore();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!cosmetic) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Cosmético não encontrado</h2>
        <Link to={ROUTES.COSMETICS}>
          <Button>Voltar ao Catálogo</Button>
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(cosmetic.id);
  const getRarityColor = (rarity?: string) => {
    if (!rarity) return 'bg-gray-500';
    return RARITY_COLORS[rarity] || 'bg-gray-500';
  };

  const getImage = () => {
    if (cosmetic.brCosmetic?.imageFeatured) return cosmetic.brCosmetic.imageFeatured;
    if (cosmetic.brCosmetic?.imageIcon) return cosmetic.brCosmetic.imageIcon;
    if (cosmetic.track?.albumArt) return cosmetic.track.albumArt;
    if (cosmetic.instrument?.imageLarge) return cosmetic.instrument.imageLarge;
    if (cosmetic.car?.imageLarge) return cosmetic.car.imageLarge;
    return null;
  };

  const getPrice = () => {
    if (cosmetic.brCosmetic?.price) return cosmetic.brCosmetic.price;
    if (cosmetic.track?.price) return cosmetic.track.price;
    if (cosmetic.instrument?.price) return cosmetic.instrument.price;
    if (cosmetic.car?.price) return cosmetic.car.price;
    return null;
  };

  const image = getImage();
  const price = getPrice();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link to={ROUTES.COSMETICS}>
        <Button variant="ghost" className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Catálogo
        </Button>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Image */}
        <div className="relative">
          <Card className="overflow-hidden">
            <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              {image ? (
                <img
                  src={image}
                  alt={cosmetic.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-32 h-32 text-muted-foreground" />
                </div>
              )}
              {cosmetic.rarity && (
                <div className={`absolute top-0 left-0 right-0 h-3 ${getRarityColor(cosmetic.rarity)}`} />
              )}
            </div>
          </Card>

          {/* Wishlist Button */}
          <Button
            size="lg"
            variant={inWishlist ? 'default' : 'outline'}
            className="w-full mt-4 gap-2"
            onClick={() => toggleWishlist(cosmetic.id)}
          >
            <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
            {inWishlist ? 'Remover da Lista' : 'Adicionar à Lista'}
          </Button>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge>{cosmetic.category}</Badge>
              {cosmetic.rarity && <Badge variant="outline">{cosmetic.rarity}</Badge>}
            </div>
            <h1 className="text-4xl font-bold mb-2">{cosmetic.name}</h1>
            {cosmetic.type && (
              <p className="text-lg text-muted-foreground">{cosmetic.type}</p>
            )}
          </div>

          {/* Description */}
          {cosmetic.description && (
            <div>
              <h3 className="font-semibold mb-2">Descrição</h3>
              <p className="text-muted-foreground">{cosmetic.description}</p>
            </div>
          )}

          {/* Price */}
          {price && (
            <div>
              <h3 className="font-semibold mb-2">Preço</h3>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-primary">
                  {price.toLocaleString()}
                </span>
                <span className="text-muted-foreground">V-Bucks</span>
              </div>
            </div>
          )}

          {/* Series */}
          {cosmetic.series && (
            <div>
              <h3 className="font-semibold mb-2">Série</h3>
              <Badge variant="secondary">{cosmetic.series}</Badge>
            </div>
          )}

          {/* Set */}
          {cosmetic.setName && (
            <div>
              <h3 className="font-semibold mb-2">Set</h3>
              <Badge variant="secondary">{cosmetic.setName}</Badge>
            </div>
          )}

          {/* Added Date */}
          {cosmetic.addedAt && (
            <div>
              <h3 className="font-semibold mb-2">Adicionado em</h3>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {format(new Date(cosmetic.addedAt), "d 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info for BR Cosmetics */}
      {cosmetic.brCosmetic && (
        <>
          <Separator className="my-8" />

          {/* Introduction */}
          {cosmetic.brCosmetic.introduction && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Introdução</h2>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-lg">
                    {cosmetic.brCosmetic.introduction.text}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {cosmetic.brCosmetic.introduction.chapter} - {cosmetic.brCosmetic.introduction.season}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Variants */}
          {cosmetic.brCosmetic.variants && cosmetic.brCosmetic.variants.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Variantes</h2>
              <div className="space-y-4">
                {cosmetic.brCosmetic.variants.map((variant, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">{variant.channel}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {variant.options.map((option, optIndex) => (
                          <div key={optIndex} className="text-center">
                            {option.image && (
                              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-md mb-2">
                                <img
                                  src={option.image}
                                  alt={option.name}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              </div>
                            )}
                            <p className="text-sm font-medium">{option.name}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Video Showcase */}
          {cosmetic.brCosmetic.showcaseVideo && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Vídeo Showcase</h2>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={cosmetic.brCosmetic.showcaseVideo}
                  controls
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Track Info */}
      {cosmetic.track && (
        <>
          <Separator className="my-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cosmetic.track.artist && (
              <div>
                <h3 className="font-semibold mb-2">Artista</h3>
                <p className="text-muted-foreground">{cosmetic.track.artist}</p>
              </div>
            )}
            {cosmetic.track.album && (
              <div>
                <h3 className="font-semibold mb-2">Álbum</h3>
                <p className="text-muted-foreground">{cosmetic.track.album}</p>
              </div>
            )}
            {cosmetic.track.bpm && (
              <div>
                <h3 className="font-semibold mb-2">BPM</h3>
                <p className="text-muted-foreground">{cosmetic.track.bpm}</p>
              </div>
            )}
            {cosmetic.track.duration && (
              <div>
                <h3 className="font-semibold mb-2">Duração</h3>
                <p className="text-muted-foreground">
                  {Math.floor(cosmetic.track.duration / 60)}:{(cosmetic.track.duration % 60).toString().padStart(2, '0')}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Shop History */}
      {cosmetic.shopHistory && cosmetic.shopHistory.length > 0 && (
        <>
          <Separator className="my-8" />
          <div>
            <h2 className="text-2xl font-bold mb-4">Histórico na Loja</h2>
            <p className="text-muted-foreground mb-4">
              Apareceu {cosmetic.shopHistory.length} vezes na loja
            </p>
            <div className="flex flex-wrap gap-2">
              {cosmetic.shopHistory.slice(0, 10).map((date, index) => (
                <Badge key={index} variant="outline">
                  {format(new Date(date), 'd/MM/yyyy')}
                </Badge>
              ))}
              {cosmetic.shopHistory.length > 10 && (
                <Badge variant="secondary">+{cosmetic.shopHistory.length - 10} mais</Badge>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
