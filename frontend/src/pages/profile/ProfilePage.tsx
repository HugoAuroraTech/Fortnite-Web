import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useShop } from '@/hooks/useShop';
import { useUserCosmetics } from '@/hooks/useUserCosmetics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefundConfirmDialog } from '@/components/shop/RefundConfirmDialog';
import { Coins, ShoppingBag, User, TrendingUp, TrendingDown, Package2, History, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RARITY_COLORS } from '@/constants';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { history, isLoadingHistory, refund, isRefunding } = useShop();
  const { cosmetics, count: cosmeticsCount, isLoading: isLoadingCosmetics } = useUserCosmetics();
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  if (!user) return null;

  // Verificar se uma transação pode ser reembolsada
  const canRefund = (transaction: any) => {
    if (transaction.type !== 'PURCHASE') return false;

    // Obter IDs do cosmetic ou bundle
    const cosmetic = transaction.cosmetic || (transaction as any).Cosmetic;
    const bundle = transaction.bundle || (transaction as any).Bundle;
    const cosmeticId = cosmetic?.id;
    const bundleId = bundle?.id;

    // Verificar se já existe uma transação de reembolso para este item
    const hasRefund = history?.some((t) => {
      if (t.type !== 'REFUND') return false;
      const refundCosmetic = t.cosmetic || (t as any).Cosmetic;
      const refundBundle = t.bundle || (t as any).Bundle;
      const refundCosmeticId = refundCosmetic?.id;
      const refundBundleId = refundBundle?.id;

      return (cosmeticId && refundCosmeticId === cosmeticId) || (bundleId && refundBundleId === bundleId);
    });

    return !hasRefund && (cosmeticId || bundleId);
  };

  const handleRefundClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setRefundDialogOpen(true);
  };

  const handleRefundConfirm = () => {
    if (!selectedTransaction) return;

    const cosmetic = selectedTransaction.cosmetic || (selectedTransaction as any).Cosmetic;
    const bundle = selectedTransaction.bundle || (selectedTransaction as any).Bundle;
    const cosmeticId = cosmetic?.id;
    const bundleId = bundle?.id;

    if (!cosmeticId && !bundleId) {
      console.error('Não foi possível identificar o item para reembolso');
      setRefundDialogOpen(false);
      return;
    }

    setRefundingId(selectedTransaction.id);

    // O hook já tem onSuccess configurado que invalida as queries
    refund({
      cosmeticId,
      bundleId,
    });

    // Fechar o modal após um breve delay
    setTimeout(() => {
      setRefundDialogOpen(false);
      setSelectedTransaction(null);
      setRefundingId(null);
    }, 2000);
  };

  const purchases = history?.filter((t) => t.type === 'PURCHASE') || [];
  const refunds = history?.filter((t) => t.type === 'REFUND') || [];
  const totalSpent = purchases.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalRefunded = refunds.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const getRarityColor = (rarity?: string) => {
    if (!rarity) return 'bg-gray-500';
    return RARITY_COLORS[rarity] || 'bg-gray-500';
  };

  const getCosmeticImage = (cosmetic: any) => {
    if (!cosmetic) return null;
    if (cosmetic.brCosmetic?.imageFeatured) return cosmetic.brCosmetic.imageFeatured;
    if (cosmetic.brCosmetic?.imageIcon) return cosmetic.brCosmetic.imageIcon;
    if (cosmetic.track?.albumArt) return cosmetic.track.albumArt;
    if (cosmetic.instrument?.imageLarge) return cosmetic.instrument.imageLarge;
    if (cosmetic.car?.imageLarge) return cosmetic.car.imageLarge;
    if (cosmetic.legoKit?.imageLarge) return cosmetic.legoKit.imageLarge;
    if (cosmetic.legoItem?.imageLarge) return cosmetic.legoItem.imageLarge;
    if (cosmetic.bean?.imageLarge) return cosmetic.bean.imageLarge;
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-8 h-8" />
          <h1 className="text-4xl font-bold">Perfil</h1>
        </div>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <Coins className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.vbucks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">V-Bucks disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Itens Possuídos</CardTitle>
            <Package2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cosmeticsCount}</div>
            <p className="text-xs text-muted-foreground">Cosméticos na sua coleção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
            <TrendingDown className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">V-Bucks gastos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Reembolsos</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRefunded.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">V-Bucks reembolsados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Meus Itens e Histórico */}
      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="items" className="gap-2">
            <Package2 className="w-4 h-4" />
            Meus Itens
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Aba: Meus Itens */}
        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Minha Coleção</CardTitle>
              <CardDescription>
                Todos os cosméticos que você possui ({cosmeticsCount} itens)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCosmetics ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square" />
                  ))}
                </div>
              ) : cosmetics.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  Você ainda não possui nenhum cosmético.
                  <br />
                  Visite a loja para começar sua coleção!
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {cosmetics
                    .filter((item) => item?.Cosmetic) // Filtrar itens sem Cosmetic
                    .map((item) => {
                      const cosmetic = item.Cosmetic;
                      if (!cosmetic) return null; // Verificação adicional de segurança

                      const image = getCosmeticImage(cosmetic);
                      const rarityColor = getRarityColor(cosmetic?.rarity);

                      return (
                        <div
                          key={cosmetic?.id || Math.random()}
                          className="group relative aspect-square rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                        >
                          {/* Imagem */}
                          {image ? (
                            <img
                              src={image}
                              alt={cosmetic?.name || 'Cosmético'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                              <Package2 className="w-12 h-12 text-gray-600" />
                            </div>
                          )}

                          {/* Overlay com informações */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                                {cosmetic?.name || 'Cosmético'}
                              </h3>
                              <div className="flex items-center gap-2">
                                {cosmetic?.rarity && (
                                  <Badge
                                    className={`${rarityColor} text-white text-xs`}
                                    variant="secondary"
                                  >
                                    {cosmetic.rarity}
                                  </Badge>
                                )}
                                {cosmetic?.type && (
                                  <Badge variant="outline" className="text-xs">
                                    {cosmetic.type}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Badge de raridade sempre visível */}
                          {cosmetic?.rarity && (
                            <div className="absolute top-2 right-2">
                              <div
                                className={`w-3 h-3 rounded-full ${rarityColor} shadow-lg`}
                              />
                            </div>
                          )}

                          {/* Data de aquisição */}
                          {item.acquiredAt && (
                            <div className="absolute top-2 left-2 bg-black/80 rounded px-2 py-1 text-xs text-white">
                              {format(new Date(item.acquiredAt), 'dd/MM/yy')}
                            </div>
                          )}
                        </div>
                      );
                    })
                    .filter(Boolean) // Remover nulls do map
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba: Histórico */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Todas as suas compras e reembolsos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))}
                </div>
              ) : !history || history.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  Nenhuma transação ainda
                </p>
              ) : (
                <div className="space-y-4">
                  {history.map((transaction) => {
                    // Verificar se existe cosmetic ou Cosmetic (dependendo da estrutura)
                    const cosmetic = transaction.cosmetic || (transaction as any).Cosmetic;
                    const bundle = transaction.bundle || (transaction as any).Bundle;
                    const item = cosmetic || bundle;
                    const isBundle = !!bundle;
                    const image = cosmetic
                      ? getCosmeticImage(cosmetic)
                      : bundle?.imageUrl;

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-all"
                      >
                        {/* Imagem do item */}
                        {image ? (
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-border">
                            <img
                              src={image}
                              alt={item?.name || 'Item'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center flex-shrink-0">
                            {isBundle ? (
                              <Package2 className="w-8 h-8 text-gray-600" />
                            ) : (
                              <ShoppingBag className="w-8 h-8 text-gray-600" />
                            )}
                          </div>
                        )}

                        {/* Informações da transação */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-lg truncate">
                              {item?.name || 'Item'}
                            </p>
                            {isBundle && (
                              <Badge variant="secondary" className="text-xs">
                                Bundle
                              </Badge>
                            )}
                          </div>

                          {cosmetic && (
                            <div className="flex items-center gap-2 mb-1">
                              {cosmetic.rarity && (
                                <Badge
                                  className={`${getRarityColor(cosmetic.rarity)} text-white text-xs`}
                                  variant="secondary"
                                >
                                  {cosmetic.rarity}
                                </Badge>
                              )}
                              {cosmetic.type && (
                                <Badge variant="outline" className="text-xs">
                                  {cosmetic.type}
                                </Badge>
                              )}
                              {cosmetic.category && (
                                <Badge variant="outline" className="text-xs">
                                  {cosmetic.category}
                                </Badge>
                              )}
                            </div>
                          )}

                          <p className="text-sm text-muted-foreground">
                            {format(new Date(transaction.createdAt), "d 'de' MMMM 'de' yyyy 'às' HH:mm", {
                              locale: ptBR,
                            })}
                          </p>
                        </div>

                        {/* Valor e tipo */}
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <Badge
                            variant={transaction.type === 'PURCHASE' ? 'destructive' : 'default'}
                            className="text-base font-bold px-4 py-2"
                          >
                            {transaction.type === 'PURCHASE' ? '-' : '+'}
                            {Math.abs(transaction.amount).toLocaleString()}
                          </Badge>
                          <div className={`flex items-center gap-1 text-xs ${
                            transaction.type === 'PURCHASE'
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {transaction.type === 'PURCHASE' ? (
                              <>
                                <ShoppingBag className="w-3 h-3" />
                                Compra
                              </>
                            ) : (
                              <>
                                <TrendingUp className="w-3 h-3" />
                                Reembolso
                              </>
                            )}
                          </div>

                          {/* Botão de Devolver */}
                          {canRefund(transaction) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRefundClick(transaction)}
                              disabled={isRefunding || refundingId === transaction.id}
                              className="gap-2 mt-2"
                            >
                              {refundingId === transaction.id ? (
                                <>
                                  <RotateCcw className="w-4 h-4 animate-spin" />
                                  Devolvendo...
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-4 h-4" />
                                  Devolver
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Confirmação de Reembolso */}
      {selectedTransaction && (
        <RefundConfirmDialog
          open={refundDialogOpen}
          onOpenChange={setRefundDialogOpen}
          onConfirm={handleRefundConfirm}
          itemName={
            selectedTransaction.cosmetic?.name ||
            (selectedTransaction as any).Cosmetic?.name ||
            selectedTransaction.bundle?.name ||
            (selectedTransaction as any).Bundle?.name ||
            'Item'
          }
          amount={Math.abs(selectedTransaction.amount)}
          isBundle={!!(selectedTransaction.bundle || (selectedTransaction as any).Bundle)}
          isLoading={isRefunding || refundingId === selectedTransaction.id}
        />
      )}
    </div>
  );
};
