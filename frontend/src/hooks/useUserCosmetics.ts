import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from './useAuth';
import { QUERY_KEYS } from '@/constants';

interface UserCosmetic {
  acquiredAt: string;
  Cosmetic: {
    id: string;
    name: string;
    type: string;
    rarity: string;
    category: string;
    description?: string;
    brCosmetic?: {
      imageIcon?: string;
      imageFeatured?: string;
      isNew?: boolean;
    };
    track?: {
      albumArt?: string;
      artist?: string;
      title?: string;
      isNew?: boolean;
    };
    instrument?: {
      imageLarge?: string;
      isNew?: boolean;
    };
    car?: {
      imageLarge?: string;
      isNew?: boolean;
    };
    legoItem?: {
      imageLarge?: string;
      isNew?: boolean;
    };
    legoKit?: {
      imageLarge?: string;
      isNew?: boolean;
    };
    bean?: {
      imageLarge?: string;
      isNew?: boolean;
    };
  };
}

interface UserCosmeticsResponse {
  userId: string;
  email: string;
  cosmetics: UserCosmetic[];
  count: number;
}

export const useUserCosmetics = () => {
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [QUERY_KEYS.USER_COSMETICS, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await api.get<UserCosmeticsResponse>(`/users/${user.id}/cosmetics`);
      return response.data;
    },
    enabled: isAuthenticated && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    cosmetics: data?.cosmetics || [],
    count: data?.count || 0,
    isLoading,
    error,
    refetch,
  };
};
