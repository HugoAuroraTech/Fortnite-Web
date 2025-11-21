import { useStats } from '@/hooks/useCosmetics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export const StatsPage = () => {
  const { stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const maxByRarity = Math.max(...stats.byRarity.map((r) => r.count));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-8 h-8" />
          <h1 className="text-4xl font-bold">Estatísticas</h1>
        </div>
        <p className="text-muted-foreground">
          Visão geral do catálogo de cosméticos
        </p>
      </div>

      {/* Total */}
      <Card className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-none">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Total de Cosméticos</p>
            <p className="text-5xl font-bold">{stats.total.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* By Type */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Por Tipo</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Battle Royale</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.byType.br.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Músicas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.byType.tracks.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Instrumentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.byType.instruments.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Veículos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.byType.cars.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">LEGO</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.byType.lego.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">LEGO Kits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.byType.legoKits.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Beans</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stats.byType.beans.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* By Rarity */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Por Raridade</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {stats.byRarity.map((item) => {
                const percentage = (item.count / maxByRarity) * 100;
                return (
                  <div key={item.rarity}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.rarity}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.count.toLocaleString()} ({((item.count / stats.total) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recently Added */}
      {stats.recentlyAdded && stats.recentlyAdded.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Adicionados Recentemente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.recentlyAdded.slice(0, 8).map((cosmetic) => {
              const image = cosmetic.brCosmetic?.imageIcon || cosmetic.track?.albumArt;
              return (
                <Card key={cosmetic.id} className="overflow-hidden">
                  {image && (
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                      <img
                        src={image}
                        alt={cosmetic.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <p className="font-medium line-clamp-1">{cosmetic.name}</p>
                    <p className="text-sm text-muted-foreground">{cosmetic.rarity}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
