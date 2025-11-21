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
import { Separator } from '@/components/ui/separator';
import { Undo2, Coins, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RefundModalProps {
  item: ShopItem;
  open: boolean;
  onClose: () => void;
}

export const RefundModal = ({ item, open, onClose }: RefundModalProps) => {
  const { user } = useAuth();
  const { refund, isRefunding } = useShop();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const isBundle = item.type === 'bundle';
  const newBalance = user ? user.vbucks + item.price : 0;

  const handleRefund = async () => {
    try {
      setError('');
      const refundData = isBundle
        ? { bundleId: item.id }
        : { cosmeticId: item.id };

      refund(refundData, {
        onSuccess: () => {
          setSuccess(true);
          setTimeout(() => {
            setSuccess(false);
            onClose();
          }, 2000);
        },
        onError: (err: any) => {
          setError(err.response?.data?.message || 'Erro ao reembolsar item');
        },
      });
    } catch (err) {
      setError('Erro ao processar reembolso');
    }
  };

  const handleClose = () => {
    if (!isRefunding) {
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
            <h3 className="text-2xl font-bold mb-2">Reembolso Realizado!</h3>
            <p className="text-muted-foreground text-center">
              {(item.price || 0).toLocaleString()} V-Bucks devolvidos à sua conta
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
            <Undo2 className="w-5 h-5" />
            Confirmar Reembolso
          </DialogTitle>
          <DialogDescription>
            Você receberá os V-Bucks de volta
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

          <Separator />

          {/* Refund Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Valor do Reembolso:</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                +{(item.price || 0).toLocaleString()} V-Bucks
              </span>
            </div>

            {user && (
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
                  <span className="text-green-600 dark:text-green-400">
                    <Coins className="w-3 h-3 inline mr-1" />
                    {(newBalance || 0).toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Atenção!</p>
              <p className="text-xs mt-1">
                O item será removido da sua coleção e você não poderá utilizá-lo.
              </p>
            </div>
          </div>

          {/* Errors */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isRefunding}>
            Cancelar
          </Button>
          <Button
            onClick={handleRefund}
            disabled={isRefunding}
            variant="destructive"
            className="gap-2"
          >
            {isRefunding ? (
              'Processando...'
            ) : (
              <>
                <Undo2 className="w-4 h-4" />
                Confirmar Reembolso
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
