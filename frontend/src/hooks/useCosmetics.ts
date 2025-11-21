import { useQuery } from '@tanstack/react-query';
import { cosmeticsApi } from '@/lib/api';
import { QUERY_KEYS, PAGINATION } from '@/constants';
import type { QueryCosmeticsDto } from '@/types';

export const useCosmetics = (params?: QueryCosmeticsDto) => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.COSMETICS, params],
    queryFn: () => cosmeticsApi.getAll(params),
  });

  return {
    cosmetics: data?.items || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    error,
    refetch,
  };
};

export const useCosmetic = (id: string) => {
  const {
    data: cosmetic,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [QUERY_KEYS.COSMETIC, id],
    queryFn: () => cosmeticsApi.getById(id),
    enabled: !!id,
  });

  return {
    cosmetic,
    isLoading,
    error,
    refetch,
  };
};

export const useNewCosmetics = (limit: number = PAGINATION.DEFAULT_LIMIT) => {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.COSMETICS, 'new', limit],
    queryFn: () => cosmeticsApi.getNew({ limit }),
  });

  return {
    cosmetics: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error,
  };
};

export const useOnSaleCosmetics = (limit: number = PAGINATION.DEFAULT_LIMIT) => {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.COSMETICS, 'on-sale', limit],
    queryFn: () => cosmeticsApi.getOnSale({ limit }),
  });

  return {
    cosmetics: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error,
  };
};

export const useStats = () => {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.STATS],
    queryFn: () => cosmeticsApi.getStats(),
  });

  return {
    stats,
    isLoading,
    error,
  };
};
