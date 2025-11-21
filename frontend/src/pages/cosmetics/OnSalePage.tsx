import { useOnSaleCosmetics } from '@/hooks/useCosmetics';
import { CosmeticGrid } from '@/components/cosmetics/CosmeticGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag } from 'lucide-react';

export const OnSalePage = () => {
  const { cosmetics, total, isLoading } = useOnSaleCosmetics(50);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-8 h-8 text-orange-500" />
          <h1 className="text-4xl font-bold">Em Promoção</h1>
        </div>
        <p className="text-muted-foreground">
          {total} cosméticos em promoção especial
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : cosmetics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Nenhum item em promoção no momento
          </p>
        </div>
      ) : (
        <CosmeticGrid cosmetics={cosmetics} />
      )}
    </div>
  );
};
