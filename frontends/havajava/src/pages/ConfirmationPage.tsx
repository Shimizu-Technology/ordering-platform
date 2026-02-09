import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Clock, MapPin, Phone as PhoneIcon,
  ArrowLeft, AlertCircle, Loader2, ExternalLink,
} from 'lucide-react';
import { api } from '../api/client';
import { useRestaurantStore } from '../stores/restaurantStore';
import { formatPrice } from '../utils/price';
import { Button } from '../components/ui/Button';
import { pageTransition, pageTransitionConfig } from '../utils/motion';
import type { Order } from '../types';

interface ConfirmationPageProps {
  slug: string;
  orderId: number;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'text-warning', label: 'Pending' },
  confirmed: { color: 'text-brand', label: 'Confirmed' },
  preparing: { color: 'text-brand', label: 'Preparing' },
  ready: { color: 'text-success', label: 'Ready' },
  completed: { color: 'text-success', label: 'Completed' },
  cancelled: { color: 'text-error', label: 'Cancelled' },
};

export function ConfirmationPage({ slug, orderId }: ConfirmationPageProps) {
  const navigate = useNavigate();
  const { restaurant, loadRestaurant } = useRestaurantStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRestaurant(slug);
  }, [slug, loadRestaurant]);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await api.getOrder(slug, orderId);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order');
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [slug, orderId]);

  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-surface flex items-center justify-center"
        {...pageTransition}
        transition={pageTransitionConfig}
      >
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </motion.div>
    );
  }

  if (error || !order) {
    return (
      <motion.div
        className="min-h-screen bg-surface flex items-center justify-center px-6"
        {...pageTransition}
        transition={pageTransitionConfig}
      >
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary mb-2">
            Order Not Found
          </h1>
          <p className="text-text-secondary text-sm">
            {error || 'We couldn\'t find this order.'}
          </p>
          <Button
            variant="secondary"
            size="md"
            className="mt-6"
            onClick={() => navigate(`/${slug}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Button>
        </div>
      </motion.div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <motion.div
      className="min-h-screen bg-surface flex flex-col items-center px-4 py-12"
      {...pageTransition}
      transition={pageTransitionConfig}
    >
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', delay: 0.15, stiffness: 200, damping: 12 }}
      >
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-success" strokeWidth={1.5} />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 text-2xl font-bold text-text-primary"
      >
        Order Placed!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 text-text-secondary text-center leading-relaxed"
      >
        Thank you, {order.customer_name}.<br />
        Your order #{order.id} has been received.
      </motion.p>

      {/* Order Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 w-full max-w-md bg-surface-card rounded-[var(--radius-xl)] border border-border-default p-5 space-y-4"
      >
        {/* Status */}
        <div className="flex items-center gap-2 text-sm">
          <Clock className={`w-4 h-4 ${status.color}`} />
          <span className={`font-semibold ${status.color}`}>{status.label}</span>
          <span className="text-text-muted">·</span>
          <span className="text-text-muted capitalize">
            {order.order_type.replace('_', ' ')}
          </span>
        </div>

        {/* Items */}
        <div className="divide-y divide-border-subtle">
          {order.items.map((item) => (
            <div key={item.id} className="py-2.5 first:pt-0 last:pb-0">
              <div className="flex justify-between text-sm gap-3">
                <span className="flex-1">
                  <span className="font-semibold">{item.quantity}x</span>{' '}
                  <span className="text-text-primary">{item.menu_item_name}</span>
                </span>
                <span className="font-medium tabular-nums">{formatPrice(item.subtotal)}</span>
              </div>
              {item.modifiers.length > 0 && (
                <p className="text-xs text-text-muted mt-0.5 ml-6">
                  {item.modifiers.map((m) => m.name).join(' · ')}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t border-border-default pt-3 flex justify-between items-center">
          <span className="font-bold text-text-primary">Total</span>
          <span className="font-bold text-lg text-text-primary tabular-nums">
            {formatPrice(order.total)}
          </span>
        </div>

        {/* Special Instructions */}
        {order.special_instructions && (
          <div className="pt-1">
            <p className="text-xs text-text-muted italic">
              &ldquo;{order.special_instructions}&rdquo;
            </p>
          </div>
        )}

        {/* Restaurant Contact */}
        {restaurant && (
          <div className="pt-2 space-y-2 text-sm text-text-secondary border-t border-border-subtle">
            <div className="flex items-center gap-2 pt-2">
              <MapPin className="w-4 h-4 shrink-0 text-text-muted" />
              <span>{restaurant.name}</span>
            </div>
            <a
              href={`tel:${restaurant.phone}`}
              className="flex items-center gap-2 text-brand hover:underline transition-colors"
              aria-label={`Call ${restaurant.name}`}
            >
              <PhoneIcon className="w-4 h-4 shrink-0" />
              <span>{restaurant.phone}</span>
            </a>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.3 }}
        className="mt-8 flex flex-col sm:flex-row gap-3"
      >
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate(`/${slug}/track/${orderId}`)}
        >
          <ExternalLink className="w-4 h-4" />
          Track Order
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate(`/${slug}`)}
        >
          <ArrowLeft className="w-4 h-4" />
          Start New Order
        </Button>
      </motion.div>
    </motion.div>
  );
}
