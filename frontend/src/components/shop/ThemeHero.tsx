import { Badge } from '@/components/ui/badge';
import { TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeHeroProps {
  title: string;
  subtitle?: string;
  cta?: string;
  theme: string;
  featuredImage?: string | null;
  discount?: number | null;
  itemCount: number;
  // Layout design properties
  backgroundImage?: string;
  foregroundImage?: string;
  bannerLogo?: string;
  bodyImage?: string;
  alignment?: 'left' | 'center' | 'right';
}

export const ThemeHero = ({
  title,
  subtitle,
  cta,
  theme,
  featuredImage,
  discount,
  itemCount,
  backgroundImage,
  foregroundImage,
  bannerLogo,
  bodyImage,
  alignment = 'left',
}: ThemeHeroProps) => {
  // Determinar alinhamento
  const alignmentClass = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right',
  }[alignment];
  return (
    <div className="relative group">
      {/* Banner Principal com Design Customizado da API */}
      <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden border-4 border-border shadow-2xl">
        {/* Imagem de Fundo da API */}
        {backgroundImage ? (
          <div className="absolute inset-0">
            <img
              src={backgroundImage}
              alt={title}
              className="w-full h-full object-cover object-center"
            />
            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </div>
        ) : featuredImage ? (
          <div className="absolute inset-0">
            <img
              src={featuredImage}
              alt={title}
              className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-pink-600/30" />
        )}

        {/* Personagem/Foreground da API */}
        {foregroundImage && (
          <div className="absolute inset-0 flex items-end justify-center md:justify-end pointer-events-none">
            <img
              src={foregroundImage}
              alt="Character"
              className="h-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-500"
              style={{ maxWidth: '50%' }}
            />
          </div>
        )}

        {/* Conteúdo do Banner */}
        <div className={cn("relative h-full flex flex-col justify-end p-8 md:p-12 z-10", alignmentClass)}>
          {/* Badge de Desconto (canto superior direito) */}
          {discount && discount > 0 && (
            <div className="absolute top-6 right-6 md:top-8 md:right-8">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-2xl md:text-3xl px-6 py-3 shadow-2xl border-2 border-white/30 gap-2 animate-pulse">
                <TrendingDown className="w-7 h-7" />
                {discount}% OFF
              </Badge>
            </div>
          )}

          {/* Logo/Banner da API (canto superior esquerdo) */}
          {bannerLogo && (
            <div className="absolute top-6 left-6 md:top-8 md:left-8">
              <img
                src={bannerLogo}
                alt="Logo"
                className="h-16 md:h-24 w-auto object-contain drop-shadow-2xl"
              />
            </div>
          )}

          {/* Tag do Tema */}
          <div className="mb-3">
            <Badge
              variant="secondary"
              className="bg-white/90 text-foreground backdrop-blur-sm font-bold text-sm px-4 py-1.5 shadow-lg uppercase tracking-wider"
            >
              {theme}
            </Badge>
          </div>

          {/* Título com gradiente estático */}
          {title && title.trim() && (
            <h2
              className={cn(
                "text-5xl md:text-7xl font-black tracking-tighter mb-3",
                "drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]",
                "transform transition-transform duration-300 group-hover:scale-105",
                "bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
              )}
            >
              {title}
            </h2>
          )}

          {/* Subtítulo da API */}
          {subtitle && (
            <p className="text-white/90 text-xl md:text-2xl font-bold drop-shadow-lg mb-2">
              {subtitle}
            </p>
          )}

          {/* Contador de Itens */}
          <p className="text-white/80 text-base md:text-lg font-semibold drop-shadow-lg">
            {itemCount} {itemCount === 1 ? 'item disponível' : 'itens disponíveis'}
          </p>

          {/* CTA da API */}
          {cta && (
            <div className="mt-4">
              <Badge className="bg-white text-foreground font-bold px-6 py-2 text-base shadow-xl">
                {cta}
              </Badge>
            </div>
          )}
        </div>

        {/* Stack de Itens (bodyImage) da API */}
        {bodyImage && (
          <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 pointer-events-none">
            <img
              src={bodyImage}
              alt="Items"
              className="h-32 md:h-48 w-auto object-contain drop-shadow-2xl"
            />
          </div>
        )}

        {/* Efeito de brilho no hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20" />
        </div>
      </div>
    </div>
  );
};
