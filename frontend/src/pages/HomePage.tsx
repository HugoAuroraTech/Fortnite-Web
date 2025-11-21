import { Link } from 'react-router-dom';
import { useStats, useNewCosmetics, useOnSaleCosmetics } from '@/hooks/useCosmetics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants';
import { ShoppingBag, Sparkles, Tag, TrendingUp } from 'lucide-react';

export const HomePage = () => {
  const { stats } = useStats();
  useNewCosmetics(8);
  useOnSaleCosmetics(8);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Bem-vindo à Loja Fortnite
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Explore milhares de cosméticos, skins e itens exclusivos
        </p>
        <div className="flex gap-4 justify-center">
          <Link to={ROUTES.SHOP}>
            <Button size="lg" className="gap-2">
              <ShoppingBag className="w-5 h-5" />
              Ir para a Loja
            </Button>
          </Link>
          <Link to={ROUTES.COSMETICS}>
            <Button size="lg" variant="outline" className="gap-2">
              <Sparkles className="w-5 h-5" />
              Explorar Catálogo
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
              <Sparkles className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cosméticos BR</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType.br.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Músicas</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType.tracks.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Veículos</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byType.cars.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Link to={ROUTES.NEW_ITEMS}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Novos Itens
              </CardTitle>
              <CardDescription>
                Confira os itens recém-adicionados
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link to={ROUTES.ON_SALE}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Em Promoção
              </CardTitle>
              <CardDescription>
                Itens com desconto especial
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link to={ROUTES.SHOP}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                Loja Atual
              </CardTitle>
              <CardDescription>
                Veja o que está disponível hoje
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
};
