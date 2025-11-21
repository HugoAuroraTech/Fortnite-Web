import { useState } from 'react';
import type { ShopItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useShop } from '@/hooks/useShop';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Coins, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

interface PurchaseModalProps {
  item: ShopItem;
  open: boolean;
  onClose: () => void;
}

export const PurchaseModal = ({ item, open, onClose }: PurchaseModalProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { buy, isBuying } = useShop();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isBundle = item.type === 'bundle';
  const hasEnoughVBucks = user ? user.vbucks >= item.price : false;
  const newBalance = user ? user.vbucks - item.price : 0;

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (!hasEnoughVBucks) {
      setError('V-Bucks insuficientes');
      return;
    }

    try {
      setError('');
      const purchaseData = isBundle
        ? { bundleId: item.id }
        : { cosmeticId: item.id };

      buy(purchaseData, {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 2000);
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || 'Erro ao comprar item');
        },
      });
    } catch (err) {
      setError('Erro ao processar compra');
    }
  };

  const handleClose = () => {
    if (!isBuying) {
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  if (success) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Compra Realizada!</h3>
            <p className="text-muted-foreground text-center">
              {item.name} foi adicionado à sua coleção
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Confirmar Compra
          </DialogTitle>
          <DialogDescription>
            Revise os detalhes antes de finalizar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Item Details */}
          <div className="flex gap-4">
            {item.image && (
              <div className="w-20 h-20 rounded-md overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-bold">{item.name}</h3>
              {!isBundle && (
                <p className="text-sm text-muted-foreground">
                  {item.itemType} • {item.rarity}
                </p>
              )}
              {isBundle && item.items && (
                <p className="text-sm text-muted-foreground">
                  {item.items.length} itens incluídos
                </p>
              )}
            </div>
          </div>

          {/* Bundle Items */}
          {isBundle && item.items && item.items.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Itens no pacote:</p>
              <div className="space-y-1">
                {item.items.map((bundleItem) => (
                  <div key={bundleItem.id} className="flex items-center justify-between text-sm">
                    <span>{bundleItem.name}</span>
                    {bundleItem.owned && (
                      <Badge variant="secondary" className="text-xs">
                        Possui
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Price Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Preço:</span>
              <span className="font-bold">{(item.price || 0).toLocaleString()} V-Bucks</span>
            </div>

            {isAuthenticated && user && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Saldo Atual:</span>
                  <span className="flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    {(user.vbucks || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm font-medium">
                  <span>Novo Saldo:</span>
                  <span className={hasEnoughVBucks ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    <Coins className="w-3 h-3 inline mr-1" />
                    {(newBalance || 0).toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Errors */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Insufficient Funds Warning */}
          {isAuthenticated && !hasEnoughVBucks && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>V-Bucks insuficientes para esta compra</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isBuying}>
            Cancelar
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={isBuying || !hasEnoughVBucks || !isAuthenticated}
            className="gap-2"
          >
            {isBuying ? (
              'Processando...'
            ) : !isAuthenticated ? (
              'Faça Login'
            ) : !hasEnoughVBucks ? (
              'Saldo Insuficiente'
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                Confirmar Compra
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
