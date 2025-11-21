import type { Cosmetic } from '@/types';
import { CosmeticCard } from './CosmeticCard';

interface CosmeticGridProps {
  cosmetics: Cosmetic[];
}

export const CosmeticGrid = ({ cosmetics }: CosmeticGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cosmetics.map((cosmetic) => (
        <CosmeticCard key={cosmetic.id} cosmetic={cosmetic} />
      ))}
    </div>
  );
};
