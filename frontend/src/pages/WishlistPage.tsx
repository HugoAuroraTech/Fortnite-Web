import { useWishlistStore } from '@/stores/wishlistStore';
import { useQuery } from '@tanstack/react-query';
import { cosmeticsApi } from '@/lib/api';
import { CosmeticGrid } from '@/components/cosmetics/CosmeticGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Heart, Trash2 } from 'lucide-react';

export const WishlistPage = () => {
  const { wishlist, clearWishlist } = useWishlistStore();

  const { data: cosmetics, isLoading } = useQuery({
    queryKey: ['wishlist', Array.from(wishlist)],
    queryFn: async () => {
      if (wishlist.size === 0) return [];
      // Buscar cada cosmético individualmente
      const promises = Array.from(wishlist).map((id) =>
        cosmeticsApi.getById(id).catch(() => null)
      );
      const results = await Promise.all(promises);
      return results.filter((c) => c !== null);
    },
    enabled: wishlist.size > 0,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-4xl font-bold">Lista de Desejos</h1>
          </div>
          {wishlist.size > 0 && (
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Tudo
            </Button>
          )}
        </div>
        <p className="text-muted-foreground">
          {wishlist.size} {wishlist.size === 1 ? 'item' : 'itens'} na sua lista
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : wishlist.size === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground mb-2">
            Sua lista de desejos está vazia
          </p>
          <p className="text-sm text-muted-foreground">
            Adicione itens clicando no ícone de coração nos cosméticos
          </p>
        </div>
      ) : cosmetics && cosmetics.length > 0 ? (
        <CosmeticGrid cosmetics={cosmetics} />
      ) : null}
    </div>
  );
};
