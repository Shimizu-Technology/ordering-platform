import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { formatPrice, calculateItemTotal } from '../../utils/price';
import { Button } from '../ui/Button';
import { springs, backdropVariants, drawerVariants } from '../../utils/motion';

interface CartSheetProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartSheet({ open, onClose, onCheckout }: CartSheetProps) {
  const { items, removeItem, updateQuantity, clearCart, cartTotal } = useCartStore();

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="cart-sheet"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={springs.sheet}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface-card flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Your order"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border-default">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-brand" />
                <h2 className="text-lg font-bold text-text-primary">Your Order</h2>
              </div>
              <div className="flex items-center gap-3">
                {items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-text-muted hover:text-error transition-colors font-medium touch-target flex items-center"
                    aria-label="Clear all items"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 -m-1 rounded-full hover:bg-surface-elevated transition-colors touch-target"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-text-muted" />
                  </div>
                  <p className="text-text-primary font-semibold">Your order is empty</p>
                  <p className="text-sm text-text-muted mt-1.5 leading-relaxed">
                    Browse the menu and add items to get started
                  </p>
                  <Button variant="secondary" size="md" className="mt-5" onClick={onClose}>
                    Browse Menu
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border-subtle">
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
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          className="px-4 py-3.5"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-sm text-text-primary leading-tight">
                                {cartItem.menuItem.name}
                              </h3>
                              {cartItem.selectedModifiers.length > 0 && (
                                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                                  {cartItem.selectedModifiers
                                    .map((sm) => sm.modifier.name)
                                    .join(' · ')}
                                </p>
                              )}
                              {cartItem.specialInstructions && (
                                <p className="text-xs text-text-muted mt-1 italic">
                                  &ldquo;{cartItem.specialInstructions}&rdquo;
                                </p>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-text-primary tabular-nums">
                              {formatPrice(itemTotal)}
                            </span>
                          </div>

                          {/* Quantity controls */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1 bg-surface-elevated rounded-[var(--radius-md)] p-0.5">
                              <button
                                onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                                className="p-2 rounded-[var(--radius-sm)] hover:bg-surface-card transition-colors touch-target"
                                aria-label={cartItem.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                              >
                                {cartItem.quantity === 1 ? (
                                  <Trash2 className="w-3.5 h-3.5 text-error" />
                                ) : (
                                  <Minus className="w-3.5 h-3.5 text-text-secondary" />
                                )}
                              </button>
                              <span className="w-7 text-center text-sm font-semibold tabular-nums">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                                className="p-2 rounded-[var(--radius-sm)] hover:bg-surface-card transition-colors touch-target"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5 text-text-secondary" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(cartItem.id)}
                              className="text-xs text-text-muted hover:text-error transition-colors font-medium touch-target flex items-center"
                              aria-label={`Remove ${cartItem.menuItem.name}`}
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
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-border-default px-4 py-4 space-y-4 bg-surface-card"
              >
                {/* Subtotal */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary">
                    Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                  <motion.span
                    key={cartTotal()}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="text-lg font-bold text-text-primary tabular-nums"
                  >
                    {formatPrice(cartTotal())}
                  </motion.span>
                </div>

                {/* Checkout Button */}
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={onCheckout}
                >
                  Continue to Checkout
                </Button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
