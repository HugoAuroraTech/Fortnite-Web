import { useState } from 'react';
import type { QueryCosmeticsDto, CosmeticCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { RARITIES, COSMETIC_TYPES } from '@/constants';
import { Search, X, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FilterBarProps {
  filters: QueryCosmeticsDto;
  onFilterChange: (filters: Partial<QueryCosmeticsDto>) => void;
}

export const FilterBar = ({ filters, onFilterChange }: FilterBarProps) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchInput || undefined });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFilterChange({
      category: 'BR',
      rarity: undefined,
      type: undefined,
      isNew: undefined,
      isOnSale: undefined,
      search: undefined,
    });
  };

  const activeFiltersCount = [
    filters.category,
    filters.rarity,
    filters.type,
    filters.isNew,
    filters.isOnSale,
    filters.search,
  ].filter(Boolean).length;

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar cosméticos por nome ou descrição..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Buscar</Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </form>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              Categoria: {filters.category}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFilterChange({ category: undefined })}
              />
            </Badge>
          )}
          {filters.rarity && (
            <Badge variant="secondary" className="gap-1">
              Raridade: {filters.rarity}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFilterChange({ rarity: undefined })}
              />
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary" className="gap-1">
              Tipo: {filters.type}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFilterChange({ type: undefined })}
              />
            </Badge>
          )}
          {filters.isNew && (
            <Badge variant="secondary" className="gap-1">
              Novos
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFilterChange({ isNew: undefined })}
              />
            </Badge>
          )}
          {filters.isOnSale && (
            <Badge variant="secondary" className="gap-1">
              Em Promoção
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => onFilterChange({ isOnSale: undefined })}
              />
            </Badge>
          )}
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Busca: {filters.search}
              <X
                className="w-3 h-3 cursor-pointer"
                onClick={() => {
                  setSearchInput('');
                  onFilterChange({ search: undefined });
                }}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Limpar Todos
          </Button>
        </div>
      )}

      {/* Filter Options */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={filters.category || "ALL"}
                  onValueChange={(value) =>
                    onFilterChange({ category: value === "ALL" ? undefined : value as CosmeticCategory })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas</SelectItem>
                    <SelectItem value="BR">BR</SelectItem>
                    <SelectItem value="TRACK">TRACK</SelectItem>
                    <SelectItem value="INSTRUMENT">INSTRUMENT</SelectItem>
                    <SelectItem value="CAR">CAR</SelectItem>
                    <SelectItem value="LEGO">LEGO</SelectItem>
                    <SelectItem value="LEGOKIT">LEGOKIT</SelectItem>
                    <SelectItem value="BEAN">BEAN</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rarity */}
              <div className="space-y-2">
                <Label>Raridade</Label>
                <Select
                  value={filters.rarity || "ALL"}
                  onValueChange={(value) => onFilterChange({ rarity: value === "ALL" ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas</SelectItem>
                    {RARITIES.map((rarity) => (
                      <SelectItem key={rarity} value={rarity}>
                        {rarity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={filters.type || "ALL"}
                  onValueChange={(value) => onFilterChange({ type: value === "ALL" ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    {COSMETIC_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quick Filters */}
              <div className="space-y-2">
                <Label>Filtros Rápidos</Label>
                <div className="flex gap-2">
                  <Button
                    variant={filters.isNew ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onFilterChange({ isNew: !filters.isNew || undefined })}
                  >
                    Novos
                  </Button>
                  <Button
                    variant={filters.isOnSale ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onFilterChange({ isOnSale: !filters.isOnSale || undefined })}
                  >
                    Promoção
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
