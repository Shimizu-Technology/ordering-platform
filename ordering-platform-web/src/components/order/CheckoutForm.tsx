import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCartStore } from '../../stores/cartStore';
import { formatPrice } from '../../utils/price';
import { api } from '../../api/client';
import type { Order, OrderPayload } from '../../types';

interface CheckoutFormProps {
  restaurantSlug: string;
  onBack: () => void;
  onOrderPlaced: (order: Order) => void;
}

export function CheckoutForm({ restaurantSlug, onBack, onOrderPlaced }: CheckoutFormProps) {
  const { items, cartTotal, clearCart } = useCartStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderType, setOrderType] = useState<'pickup' | 'dine_in'>('pickup');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: OrderPayload = {
        customer_name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        order_type: orderType,
        special_instructions: instructions.trim() || undefined,
        items: items.map((cartItem) => ({
          menu_item_id: cartItem.menuItem.id,
          quantity: cartItem.quantity,
          special_instructions: cartItem.specialInstructions || undefined,
          modifier_ids: cartItem.selectedModifiers.map((sm) => sm.modifier.id),
        })),
      };

      const order = await api.createOrder(restaurantSlug, payload);
      clearCart();
      onOrderPlaced(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="min-h-screen bg-surface"
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-sm border-b border-border-default">
        <div className="flex items-center gap-3 p-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-surface-elevated transition-colors touch-target"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="text-lg font-semibold">Checkout</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-lg mx-auto">
        {/* Order Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Order Type</label>
          <div className="flex gap-2">
            {(['pickup', 'dine_in'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setOrderType(type)}
                className={`
                  flex-1 py-2.5 px-4 text-sm font-medium rounded-[var(--radius-md)] border
                  transition-colors touch-target
                  ${orderType === type
                    ? 'bg-brand text-white border-brand'
                    : 'bg-surface-card text-text-secondary border-border-default hover:border-brand/30'
                  }
                `}
              >
                {type === 'pickup' ? 'Pickup' : 'Dine In'}
              </button>
            ))}
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary">Your Info</label>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name *"
              required
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-border-default rounded-[var(--radius-md)] bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (for order updates)"
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-border-default rounded-[var(--radius-md)] bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (for receipt)"
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-border-default rounded-[var(--radius-md)] bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            />
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Special Instructions
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-text-muted" />
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Any special requests for the restaurant..."
              rows={2}
              className="w-full pl-10 pr-3 py-2.5 text-sm border border-border-default rounded-[var(--radius-md)] bg-surface-card resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-surface-elevated rounded-[var(--radius-lg)] p-4 space-y-2">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Order Summary</h3>
          {items.map((cartItem) => (
            <div key={cartItem.id} className="flex justify-between text-sm">
              <span className="text-text-secondary">
                {cartItem.quantity}x {cartItem.menuItem.name}
              </span>
              <span className="text-text-primary font-medium">
                {formatPrice(
                  (cartItem.menuItem.base_price +
                    cartItem.selectedModifiers.reduce(
                      (sum, sm) => sum + sm.modifier.price_adjustment, 0
                    )) * cartItem.quantity
                )}
              </span>
            </div>
          ))}
          <div className="border-t border-border-default pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-text-primary">Total</span>
            <span className="font-semibold text-text-primary text-lg">
              {formatPrice(cartTotal())}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-error text-center"
          >
            {error}
          </motion.p>
        )}

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
        >
          Place Order &middot; {formatPrice(cartTotal())}
        </Button>
      </form>
    </motion.div>
  );
}
