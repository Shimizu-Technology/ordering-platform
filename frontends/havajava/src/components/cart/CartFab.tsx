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
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          onClick={onClick}
          className="fixed bottom-6 left-4 right-4 z-30 bg-brand text-white rounded-[var(--radius-xl)] px-5 py-4 flex items-center justify-between shadow-lg shadow-brand/25 touch-target hover:shadow-xl hover:shadow-brand/30 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2"
          whileTap={{ scale: 0.97 }}
          aria-label={`View order, ${itemCount} items, ${formatPrice(total)}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <motion.span
                key={itemCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-white text-brand text-[10px] font-bold rounded-full flex items-center justify-center px-1"
              >
                {itemCount}
              </motion.span>
            </div>
            <span className="font-semibold">View Order</span>
          </div>
          <motion.span
            key={total}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="font-bold tabular-nums"
          >
            {formatPrice(total)}
          </motion.span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
