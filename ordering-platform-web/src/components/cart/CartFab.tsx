import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { formatPrice } from '../../utils/price';

interface CartFabProps {
  onClick: () => void;
}

export function CartFab({ onClick }: CartFabProps) {
  const itemCount = useCartStore((s) => s.itemCount());
  const total = useCartStore((s) => s.cartTotal());

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          onClick={onClick}
          className="fixed bottom-6 left-4 right-4 z-30 bg-brand text-white rounded-[var(--radius-xl)] p-4 flex items-center justify-between shadow-lg shadow-brand/20 touch-target"
          whileTap={{ scale: 0.97 }}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <motion.span
                key={itemCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white text-brand text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {itemCount}
              </motion.span>
            </div>
            <span className="font-medium">View Order</span>
          </div>
          <span className="font-semibold">{formatPrice(total)}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
