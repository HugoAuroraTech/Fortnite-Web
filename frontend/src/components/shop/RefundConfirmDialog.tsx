import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, Package2, Coins } from 'lucide-react';

interface RefundConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  itemName: string;
  amount: number;
  isBundle?: boolean;
  isLoading?: boolean;
}

export const RefundConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  amount,
  isBundle = false,
  isLoading = false,
}: RefundConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30">
              <RotateCcw className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <DialogTitle className="text-2xl">Confirmar Devolução</DialogTitle>
          </div>
          <DialogDescription className="text-base pt-2">
            Tem certeza que deseja devolver {isBundle ? 'o bundle' : 'o item'}?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {/* Informações do Item */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
            {isBundle ? (
              <Package2 className="w-8 h-8 text-primary flex-shrink-0" />
            ) : (
              <Package2 className="w-8 h-8 text-primary flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-muted-foreground">Item</p>
              <p className="font-bold text-lg truncate">{itemName}</p>
            </div>
          </div>

          {/* Valor do Reembolso */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
              <Coins className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-green-700 dark:text-green-300">Você receberá</p>
              <p className="font-bold text-2xl text-green-700 dark:text-green-300">
                {amount.toLocaleString()} V-Bucks
              </p>
            </div>
          </div>

          {/* Aviso */}
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Esta ação não pode ser desfeita. O item será removido da sua coleção.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? (
              <>
                <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                Devolvendo...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Confirmar Devolução
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

