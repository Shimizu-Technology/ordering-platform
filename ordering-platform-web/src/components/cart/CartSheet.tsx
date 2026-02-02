import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { formatPrice, calculateItemTotal } from '../../utils/price';
import { Button } from '../ui/Button';

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartSheet({ open, onClose, onCheckout }: CartSheetProps) {
  const { items, removeItem, updateQuantity, clearCart, cartTotal } = useCartStore();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          <motion.div
            key="cart-sheet"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface-card flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-default">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand" />
                <h2 className="text-lg font-semibold">Your Order</h2>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-text-muted hover:text-error transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 -m-2 rounded-full hover:bg-surface-elevated transition-colors touch-target"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <ShoppingBag className="w-12 h-12 text-text-muted mb-3" />
                  <p className="text-text-secondary font-medium">Your order is empty</p>
                  <p className="text-sm text-text-muted mt-1">
                    Browse the menu and add items to get started
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border-default">
                  <AnimatePresence>
                    {items.map((cartItem) => {
                      const itemTotal = calculateItemTotal(
                        cartItem.menuItem.base_price,
                        cartItem.selectedModifiers.map((sm) => sm.modifier),
                        cartItem.quantity
                      );

                      return (
                        <motion.div
                          key={cartItem.id}
                          layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm text-text-primary">
                                {cartItem.menuItem.name}
                              </h3>
                              {cartItem.selectedModifiers.length > 0 && (
                                <p className="text-xs text-text-muted mt-0.5">
                                  {cartItem.selectedModifiers
                                    .map((sm) => sm.modifier.name)
                                    .join(', ')}
                                </p>
                              )}
                              {cartItem.specialInstructions && (
                                <p className="text-xs text-text-muted mt-0.5 italic">
                                  Note: {cartItem.specialInstructions}
                                </p>
                              )}
                            </div>
                            <span className="text-sm font-medium text-text-primary ml-2">
                              {formatPrice(itemTotal)}
                            </span>
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                                className="p-1.5 rounded-[var(--radius-sm)] hover:bg-surface-elevated transition-colors touch-target"
                                aria-label="Decrease"
                              >
                                {cartItem.quantity === 1 ? (
                                  <Trash2 className="w-4 h-4 text-error" />
                                ) : (
                                  <Minus className="w-4 h-4 text-text-secondary" />
                                )}
                              </button>
                              <span className="w-6 text-center text-sm font-medium">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                                className="p-1.5 rounded-[var(--radius-sm)] hover:bg-surface-elevated transition-colors touch-target"
                                aria-label="Increase"
                              >
                                <Plus className="w-4 h-4 text-text-secondary" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(cartItem.id)}
                              className="text-xs text-text-muted hover:text-error transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border-default p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">Subtotal</span>
                  <span className="text-lg font-semibold text-text-primary">
                    {formatPrice(cartTotal())}
                  </span>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={onCheckout}
                >
                  Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
