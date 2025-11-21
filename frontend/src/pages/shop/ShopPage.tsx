import { useEffect, useState } from 'react';
import { useShop } from '@/hooks/useShop';
import { ShopSection } from '@/components/shop/ShopSection';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, RefreshCw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ShopPage = () => {
  const { shop, isLoadingShop, refetchShop } = useShop();
  const [timeUntilRefresh, setTimeUntilRefresh] = useState('');

  useEffect(() => {
    if (!shop?.refreshDate) return;

    const updateTimer = () => {
      try {
        const distance = formatDistanceToNow(new Date(shop.refreshDate), {
          locale: ptBR,
          addSuffix: true,
        });
        setTimeUntilRefresh(distance);
      } catch (error) {
        setTimeUntilRefresh('');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [shop?.refreshDate]);

  if (isLoadingShop) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-12">
            <Skeleton className="h-16 w-80 mb-4" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="space-y-12">
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <Skeleton className="h-10 w-48 mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-96 rounded-xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="mb-6 text-muted-foreground">
              <Sparkles className="w-16 h-16 mx-auto mb-4 opacity-50" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Loja Indisponível</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              A loja está temporariamente indisponível. Estamos trabalhando para trazê-la de volta o mais rápido possível.
            </p>
            <Button onClick={() => refetchShop()} size="lg" className="gap-2">
              <RefreshCw className="w-5 h-5" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
      <div className="container mx-auto px-4 py-6 md:py-10">
        {/* Header Section */}
        <div className="mb-10 md:mb-14">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-black mb-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
                LOJA DE ITENS
              </h1>
              <p className="text-lg text-muted-foreground font-medium">
                Descubra as últimas novidades e ofertas especiais
              </p>
            </div>
            <Button
              onClick={() => refetchShop()}
              variant="outline"
              size="lg"
              className="gap-2 border-2 hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <RefreshCw className="w-5 h-5" />
              <span className="font-semibold">Atualizar</span>
            </Button>
          </div>

          {/* Timer & Stats Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-border/50 backdrop-blur-sm">
            {timeUntilRefresh && (
              <div className="flex items-center gap-2 text-foreground">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Próxima Atualização</p>
                  <p className="text-sm font-bold">{timeUntilRefresh}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Sparkles className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Itens Disponíveis</p>
                <p className="text-sm font-bold">{shop.totalItems} itens</p>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Sections */}
        <div className="space-y-14">
          {Object.entries(shop.sections).map(([key, section]: [string, any]) => {
            if (!section || section.count === 0) return null;

            // Determinar variante baseado no tipo ou chave da seção
            let variant: 'featured' | 'daily' | 'special' | 'default' = 'default';

            if (section.type === 'themed') {
              variant = 'featured'; // Seções temáticas são sempre featured
            } else if (key === 'featured') {
              variant = 'featured';
            } else if (key === 'daily') {
              variant = 'daily';
            } else if (key === 'special') {
              variant = 'special';
            }

            return (
              <ShopSection
                key={key}
                title={section.title}
                items={section.items}
                count={section.count}
                variant={variant}
                theme={section.theme}
                featuredImage={section.featuredImage}
                discount={section.discount}
                isThemed={section.type === 'themed'}
                subtitle={section.subtitle}
                cta={section.cta}
                backgroundImage={section.backgroundImage}
                foregroundImage={section.foregroundImage}
                bannerLogo={section.bannerLogo}
                bodyImage={section.bodyImage}
                alignment={section.alignment}
              />
            );
          })}
        </div>

        {/* Footer Message */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Os itens voltam periodicamente, então fique de olho! 👀
          </p>
        </div>
      </div>
    </div>
  );
};
