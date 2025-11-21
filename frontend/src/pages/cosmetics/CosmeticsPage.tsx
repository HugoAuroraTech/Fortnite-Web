import { useState } from 'react';
import { useCosmetics } from '@/hooks/useCosmetics';
import { CosmeticGrid } from '@/components/cosmetics/CosmeticGrid';
import { FilterBar } from '@/components/cosmetics/FilterBar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { QueryCosmeticsDto } from '@/types';
import { PAGINATION } from '@/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CosmeticsPage = () => {
  const [filters, setFilters] = useState<QueryCosmeticsDto>({
    limit: PAGINATION.DEFAULT_LIMIT,
    offset: 0,
    category: 'BR',
  });

  const { cosmetics, total, isLoading, hasMore } = useCosmetics(filters);

  const currentPage = Math.floor((filters.offset || 0) / (filters.limit || PAGINATION.DEFAULT_LIMIT)) + 1;
  const totalPages = Math.ceil(total / (filters.limit || PAGINATION.DEFAULT_LIMIT));

  const handleFilterChange = (newFilters: Partial<QueryCosmeticsDto>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      offset: 0, // Reset offset quando mudar filtros
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      offset: (page - 1) * (prev.limit || PAGINATION.DEFAULT_LIMIT),
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Catálogo de Cosméticos</h1>
        <p className="text-muted-foreground">
          Explore {total.toLocaleString()} cosméticos disponíveis
        </p>
      </div>

      {/* Filters */}
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : cosmetics.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Nenhum cosmético encontrado com os filtros aplicados
          </p>
        </div>
      ) : (
        <>
          <CosmeticGrid cosmetics={cosmetics} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasMore}
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
