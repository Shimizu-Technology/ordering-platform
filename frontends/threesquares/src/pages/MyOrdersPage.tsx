import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mail,
  Search,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  ChefHat,
  Bell,
  RotateCcw,
  Package,
  Loader2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { api } from '../api/client';
import { useCustomerStore } from '../stores/customerStore';
import { toast } from '../components/ui/Toast';
import { formatPrice } from '../utils/price';
import { pageTransition, pageTransitionConfig, staggerContainer, staggerItem } from '../utils/motion';
import type { CustomerOrder, CustomerOrdersResponse } from '../types/customer';

interface MyOrdersPageProps {
  slug: string;
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; step: number }> = {
  pending: { icon: Clock, label: 'Pending', color: 'text-warning', step: 1 },
  confirmed: { icon: CheckCircle2, label: 'Confirmed', color: 'text-brand', step: 2 },
  preparing: { icon: ChefHat, label: 'Preparing', color: 'text-brand', step: 3 },
  ready: { icon: Bell, label: 'Ready', color: 'text-success', step: 4 },
  completed: { icon: Package, label: 'Completed', color: 'text-text-muted', step: 5 },
  cancelled: { icon: XCircle, label: 'Cancelled', color: 'text-error', step: 0 },
};

const PROGRESS_STEPS = [
  { key: 'pending', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'completed', label: 'Done' },
];

function OrderProgressBar({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 text-sm text-error">
        <XCircle className="w-4 h-4" />
        Order Cancelled
      </div>
    );
  }

  const currentStep = STATUS_CONFIG[status]?.step ?? 0;

  return (
    <div className="flex items-center gap-1 w-full">
      {PROGRESS_STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum <= currentStep;
        const isCurrent = stepNum === currentStep;
        return (
          <div key={step.key} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-center">
              <div
                className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
                  isActive ? 'bg-brand' : 'bg-border-default'
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-medium transition-colors ${
                isCurrent ? 'text-brand' : isActive ? 'text-text-secondary' : 'text-text-muted'
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({
  order,
  onReorder,
}: {
  order: CustomerOrder;
  onReorder: (orderId: number) => void;
}) {
  const config = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = config.icon;
  const date = new Date(order.created_at);

  return (
    <motion.div
      variants={staggerItem}
      className="bg-surface-card border border-border-default rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface-elevated rounded-md">
            <ShoppingBag className="w-4 h-4 text-text-secondary" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">Order #{order.id}</p>
            <p className="text-xs text-text-muted">
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {' '}
              {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-sm font-medium ${config.color}`}>
          <StatusIcon className="w-4 h-4" />
          {config.label}
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 pt-3 pb-2">
        <OrderProgressBar status={order.status} />
      </div>

      {/* Items */}
      <div className="px-4 py-3 space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1 min-w-0">
              <span className="text-text-primary">{item.quantity}x {item.menu_item_name}</span>
              {item.modifiers.length > 0 && (
                <p className="text-xs text-text-muted truncate">
                  {item.modifiers.map((m) => m.name).join(', ')}
                </p>
              )}
            </div>
            <span className="text-text-primary font-medium tabular-nums shrink-0 ml-3">
              {formatPrice(item.subtotal)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border-subtle bg-surface-elevated">
        <span className="text-sm font-bold text-text-primary tabular-nums">
          Total: {formatPrice(order.total)}
        </span>
        {(order.status === 'completed' || order.status === 'cancelled') && (
          <button
            onClick={() => onReorder(order.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand hover:bg-brand/10 rounded-md transition-colors touch-target"
          >
            <RotateCcw className="w-4 h-4" />
            Reorder
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function MyOrdersPage({ slug }: MyOrdersPageProps) {
  const navigate = useNavigate();
  const { savedInfo } = useCustomerStore();

  const [email, setEmail] = useState(savedInfo?.email ?? '');
  const [data, setData] = useState<CustomerOrdersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [reordering, setReordering] = useState<number | null>(null);

  // Auto-search if saved info exists
  useEffect(() => {
    if (savedInfo?.email && savedInfo?.customerId) {
      setEmail(savedInfo.email);
      lookupOrders(savedInfo.customerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookupOrders(customerId: number) {
    setLoading(true);
    setSearched(true);
    try {
      const result = await api.getCustomerOrders(slug, customerId);
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      // Create/lookup customer to get ID
      const customer = await api.createCustomer(slug, {
        name: savedInfo?.name || 'Guest',
        email: email.trim(),
      });
      const result = await api.getCustomerOrders(slug, customer.id);
      setData(result);
    } catch {
      setData(null);
      toast.error('Could not find orders for this email');
    } finally {
      setLoading(false);
    }
  }

  async function handleReorder(orderId: number) {
    setReordering(orderId);
    try {
      const newOrder = await api.reorder(slug, orderId);
      // Add items to cart from the new order
      // Actually, the reorder endpoint creates a new order directly
      toast.success('Order placed! Redirecting...');
      navigate(`/${slug}/confirmation/${newOrder.id}`, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reorder');
    } finally {
      setReordering(null);
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-surface"
      {...pageTransition}
      transition={pageTransitionConfig}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-sm border-b border-border-default">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(`/${slug}`)}
            className="p-2 -ml-2 rounded-full hover:bg-surface-elevated transition-colors touch-target"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="text-lg font-bold text-text-primary">My Orders</h1>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
        {/* Email Lookup */}
        <form onSubmit={handleLookup} className="space-y-3">
          <label htmlFor="order-email" className="block text-sm font-semibold text-text-primary">
            Look up your orders
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                id="order-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full pl-10 pr-3 py-3 text-sm border border-border-default rounded-md bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              />
            </div>
            <Button type="submit" loading={loading} className="shrink-0">
              <Search className="w-4 h-4" />
              Find
            </Button>
          </div>
        </form>

        {/* Results */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-12"
            >
              <Loader2 className="w-6 h-6 text-brand animate-spin" />
            </motion.div>
          )}

          {!loading && searched && data && data.orders.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <ShoppingBag className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary font-medium">No orders found</p>
              <p className="text-sm text-text-muted mt-1">
                Orders placed with this email will appear here
              </p>
            </motion.div>
          )}

          {!loading && data && data.orders.length > 0 && (
            <motion.div
              key="orders"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <p className="text-sm text-text-secondary">
                {data.orders.length} order{data.orders.length !== 1 ? 's' : ''} found
              </p>
              {data.orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onReorder={handleReorder}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reorder overlay */}
        <AnimatePresence>
          {reordering !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
            >
              <div className="bg-surface-card rounded-lg p-6 flex flex-col items-center gap-3 shadow-xl">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
                <p className="text-sm font-medium text-text-primary">Placing your order...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
