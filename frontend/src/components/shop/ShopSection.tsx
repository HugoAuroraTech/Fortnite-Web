import type { ShopItem } from '@/types';
import { ShopItemCard } from './ShopItemCard';
import { ThemeHero } from './ThemeHero';
import { Package, Star, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShopSectionProps {
  title: string;
  items: ShopItem[];
  count: number;
  variant?: 'featured' | 'daily' | 'special' | 'default';
  theme?: string;
  featuredImage?: string | null;
  discount?: number | null;
  isThemed?: boolean;
  // Layout design properties
  subtitle?: string;
  cta?: string;
  backgroundImage?: string;
  foregroundImage?: string;
  bannerLogo?: string;
  bodyImage?: string;
  alignment?: 'left' | 'center' | 'right';
}

export const ShopSection = ({
  title,
  items,
  count,
  variant = 'default',
  theme,
  featuredImage,
  discount,
  isThemed = false,
  subtitle,
  cta,
  backgroundImage,
  foregroundImage,
  bannerLogo,
  bodyImage,
  alignment,
}: ShopSectionProps) => {
  // Configurações de estilo por variante
  const variantConfig = {
    featured: {
      icon: Star,
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-500/20',
      gradientFrom: 'from-yellow-500/20',
      gradientTo: 'to-orange-500/20',
      borderColor: 'border-yellow-500/30',
    },
    daily: {
      icon: Clock,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/20',
      gradientFrom: 'from-blue-500/20',
      gradientTo: 'to-cyan-500/20',
      borderColor: 'border-blue-500/30',
    },
    special: {
      icon: Sparkles,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-500/20',
      gradientFrom: 'from-purple-500/20',
      gradientTo: 'to-pink-500/20',
      borderColor: 'border-purple-500/30',
    },
    default: {
      icon: Package,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-500/20',
      gradientFrom: 'from-green-500/20',
      gradientTo: 'to-emerald-500/20',
      borderColor: 'border-green-500/30',
    },
  };

  const config = variantConfig[variant];
  const Icon = config.icon;

  // Separar bundles de itens individuais
  const bundles = items.filter(item => item.type === 'bundle');
  const individualItems = items.filter(item => item.type === 'item');

  return (
    <section className="relative">
      {/* Banner Temático (para seções agrupadas por tema) */}
      {isThemed && theme ? (
        <div className="mb-10">
          <ThemeHero
            title={title}
            subtitle={subtitle}
            cta={cta}
            theme={theme}
            featuredImage={featuredImage}
            discount={discount}
            itemCount={count}
            backgroundImage={backgroundImage}
            foregroundImage={foregroundImage}
            bannerLogo={bannerLogo}
            bodyImage={bodyImage}
            alignment={alignment}
          />
        </div>
      ) : (
        /* Header padrão com gradiente e ícone */
        <div className={cn(
          "relative mb-8 p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300",
          `bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo}`,
          config.borderColor
        )}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl shadow-lg",
                config.iconBg
              )}>
                <Icon className={cn("w-7 h-7", config.iconColor)} />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                  {title}
                </h2>
                <p className="text-sm text-muted-foreground font-medium mt-1">
                  {count} {count === 1 ? 'item disponível' : 'itens disponíveis'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Itens */}
      <div className="space-y-8">
        {isThemed ? (
          /* Layout especial para seções temáticas - todos os itens juntos */
          <>
            {/* Bundles em destaque no topo */}
            {bundles.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5 mb-6">
                {bundles.map((item, index) => {
                  // Bundles sempre têm destaque
                  const isHero = bundles.length === 1 && individualItems.length > 2;

                  return (
                    <div
                      key={item.offerId || item.id || index}
                      className={cn(
                        "animate-in fade-in slide-in-from-bottom-4",
                        isHero && "sm:col-span-2 sm:row-span-2"
                      )}
                      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                    >
                      <ShopItemCard item={item} isHero={isHero} />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Itens individuais do tema */}
            {individualItems.length > 0 && (
              <div>
                {bundles.length > 0 && (
                  <h3 className="text-lg font-bold text-muted-foreground mb-4 uppercase tracking-wide flex items-center gap-2">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                    Itens Disponíveis Separadamente
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                  </h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
                  {individualItems.map((item, index) => (
                    <div
                      key={item.offerId || item.id || index}
                      className="animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${(bundles.length + index) * 50}ms`, animationFillMode: 'backwards' }}
                    >
                      <ShopItemCard item={item} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Layout padrão - separar bundles de itens */
          <>
            {/* Bundles em destaque (se houver) */}
            {bundles.length > 0 && (
              <div>
                {individualItems.length > 0 && (
                  <h3 className="text-lg font-bold text-muted-foreground mb-4 uppercase tracking-wide">
                    Pacotões
                  </h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
                  {bundles.map((item, index) => (
                    <div
                      key={item.offerId || item.id || index}
                      className="animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                    >
                      <ShopItemCard item={item} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itens individuais */}
            {individualItems.length > 0 && (
              <div>
                {bundles.length > 0 && (
                  <h3 className="text-lg font-bold text-muted-foreground mb-4 uppercase tracking-wide">
                    Itens Individuais
                  </h3>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
                  {individualItems.map((item, index) => (
                    <div
                      key={item.offerId || item.id || index}
                      className="animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${(bundles.length + index) * 50}ms`, animationFillMode: 'backwards' }}
                    >
                      <ShopItemCard item={item} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};
