import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shopApi } from '@/lib/api';
import { QUERY_KEYS } from '@/constants';
import { useAuth } from './useAuth';
import type { PurchaseDto } from '@/types';

export const useShop = () => {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();

  // Buscar loja atual
  const {
    data: shop,
    isLoading: isLoadingShop,
    error: shopError,
    refetch: refetchShop,
  } = useQuery({
    queryKey: [QUERY_KEYS.SHOP, user?.id],
    queryFn: () => shopApi.getCurrent(user?.id),
  });

  // Comprar item
  const buyMutation = useMutation({
    mutationFn: (data: PurchaseDto) => shopApi.buy(data),
    onSuccess: (response) => {
      // Atualizar usuário com novo saldo
      updateUser(response.user);
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHOP] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HISTORY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_COSMETICS] });
    },
  });

  // Reembolsar item
  const refundMutation = useMutation({
    mutationFn: (data: PurchaseDto) => shopApi.refund(data),
    onSuccess: (response) => {
      // Atualizar usuário com novo saldo
      updateUser(response.user);
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SHOP] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.HISTORY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USER_COSMETICS] });
    },
  });

  // Histórico de compras
  const {
    data: history,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery({
    queryKey: [QUERY_KEYS.HISTORY],
    queryFn: () => shopApi.getHistory(),
    enabled: !!user, // Só buscar se o usuário estiver autenticado
  });

  return {
    shop,
    isLoadingShop,
    shopError,
    refetchShop,
    buy: buyMutation.mutate,
    isBuying: buyMutation.isPending,
    buyError: buyMutation.error,
    refund: refundMutation.mutate,
    isRefunding: refundMutation.isPending,
    refundError: refundMutation.error,
    history,
    isLoadingHistory,
    historyError,
  };
};
