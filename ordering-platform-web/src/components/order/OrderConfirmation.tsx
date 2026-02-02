import { motion } from 'framer-motion';
import { CheckCircle, Clock, MapPin, Phone as PhoneIcon, ArrowLeft } from 'lucide-react';
import type { Order } from '../../types';
import { formatPrice } from '../../utils/price';
import { Button } from '../ui/Button';

interface OrderConfirmationProps {
  order: Order;
  restaurantName: string;
  restaurantPhone: string;
  onNewOrder: () => void;
}

export function OrderConfirmation({
  order,
  restaurantName,
  restaurantPhone,
  onNewOrder,
}: OrderConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-surface flex flex-col items-center px-4 py-12"
    >
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2, stiffness: 200, damping: 15 }}
      >
        <CheckCircle className="w-16 h-16 text-success" strokeWidth={1.5} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-2xl font-bold text-text-primary"
      >
        Order Placed!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-2 text-text-secondary text-center"
      >
        Thank you, {order.customer_name}. Your order #{order.id} has been received.
      </motion.p>

      {/* Order Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 w-full max-w-md bg-surface-card rounded-[var(--radius-xl)] border border-border-default p-5 space-y-4"
      >
        {/* Status */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-warning" />
          <span className="font-medium capitalize">{order.status}</span>
          <span className="text-text-muted">&middot;</span>
          <span className="text-text-muted capitalize">{order.order_type.replace('_', ' ')}</span>
        </div>

        {/* Items */}
        <div className="divide-y divide-border-default/50">
          {order.items.map((item) => (
            <div key={item.id} className="py-2 first:pt-0 last:pb-0">
              <div className="flex justify-between text-sm">
                <span>
                  <span className="font-medium">{item.quantity}x</span>{' '}
                  {item.menu_item_name}
                </span>
                <span className="font-medium">{formatPrice(item.subtotal)}</span>
              </div>
              {item.modifiers.length > 0 && (
                <p className="text-xs text-text-muted mt-0.5 ml-6">
                  {item.modifiers.map((m) => m.name).join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-border-default pt-3 flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="font-semibold text-lg">{formatPrice(order.total)}</span>
        </div>

        {/* Restaurant Contact */}
        <div className="pt-2 space-y-2 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 shrink-0" />
            <span>{restaurantName}</span>
          </div>
          <a
            href={`tel:${restaurantPhone}`}
            className="flex items-center gap-2 text-brand hover:underline"
          >
            <PhoneIcon className="w-4 h-4 shrink-0" />
            <span>{restaurantPhone}</span>
          </a>
        </div>
      </motion.div>

      {/* New Order Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8"
      >
        <Button variant="secondary" size="lg" onClick={onNewOrder}>
          <ArrowLeft className="w-4 h-4" />
          Start New Order
        </Button>
      </motion.div>
    </motion.div>
  );
}
