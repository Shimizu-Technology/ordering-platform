import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Clock,
  ChefHat,
  CheckCircle2,
  Package,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Phone,
  MapPin,
  Timer,
} from 'lucide-react';
import { api } from '../api/client';
import { useRestaurantStore } from '../stores/restaurantStore';

interface OrderItem {
  id: number;
  menu_item_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  modifiers: { name: string; price_adjustment: number }[];
}

interface Order {
  id: number;
  customer_name: string;
  phone: string | null;
  email: string | null;
  order_type: string;
  status: string;
  total: number;
  special_instructions: string | null;
  created_at: string;
  items: OrderItem[];
}

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Received', icon: Clock, description: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, description: 'Your order has been confirmed' },
  { key: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Your order is being prepared' },
  { key: 'ready', label: 'Ready!', icon: Package, description: 'Your order is ready for pickup' },
];

export function OrderTrackingPage({ slug }: { slug: string }) {
  const { orderId: paramOrderId } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const initialOrderId = paramOrderId || searchParams.get('id') || '';

  const { restaurant, loadRestaurant } = useRestaurantStore();
  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Load restaurant data for prep time
  useEffect(() => {
    loadRestaurant(slug);
  }, [slug, loadRestaurant]);

  // Calculate estimated ready time
  const getEstimatedReadyTime = useCallback(() => {
    if (!order || !restaurant?.default_prep_time_minutes) return null;
    if (order.status === 'ready' || order.status === 'completed' || order.status === 'cancelled') return null;
    
    const orderTime = new Date(order.created_at);
    const readyTime = new Date(orderTime.getTime() + restaurant.default_prep_time_minutes * 60 * 1000);
    return readyTime;
  }, [order, restaurant]);

  const fetchOrder = useCallback(async (id: string) => {
    if (!id.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.getOrder(slug, parseInt(id, 10));
      setOrder(data);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Auto-fetch if order ID provided in URL
  useEffect(() => {
    if (initialOrderId) {
      fetchOrder(initialOrderId);
    }
  }, [initialOrderId, fetchOrder]);

  // Auto-refresh every 30 seconds if order is not completed
  useEffect(() => {
    if (!order || order.status === 'completed' || order.status === 'cancelled') return;

    const interval = setInterval(() => {
      fetchOrder(String(order.id));
    }, 30000);

    return () => clearInterval(interval);
  }, [order, fetchOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderIdInput);
  };

  const handleRefresh = () => {
    if (order) {
      fetchOrder(String(order.id));
    }
  };

  const currentStepIndex = order
    ? STATUS_STEPS.findIndex(s => s.key === order.status)
    : -1;

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-brand text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link
            to={`/${slug}/home`}
            className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold">Track Your Order</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="block text-sm font-medium text-text-secondary">
            Enter your order number
          </label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                inputMode="numeric"
                value={orderIdInput}
                onChange={e => setOrderIdInput(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g., 123"
                className="w-full px-4 py-3 bg-surface-elevated border border-border-default rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderIdInput.trim()}
              className="px-6 py-3 bg-brand text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Details */}
        <AnimatePresence mode="wait">
          {order && (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Order Header */}
              <div className="bg-surface-elevated rounded-2xl p-4 border border-border-default">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-text-secondary">Order</p>
                    <p className="text-2xl font-bold text-text-primary">#{order.id}</p>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-2 text-text-secondary hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm text-text-secondary">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="capitalize">{order.order_type}</span>
                </div>
                
                {/* Estimated Ready Time */}
                {getEstimatedReadyTime() && (
                  <div className="mt-3 flex items-center gap-2 text-brand bg-brand/10 px-3 py-2 rounded-lg">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Estimated ready: ~{getEstimatedReadyTime()!.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
                
                {lastRefresh && (
                  <p className="text-xs text-text-muted mt-2">
                    Last updated: {lastRefresh.toLocaleTimeString()}
                  </p>
                )}
              </div>

              {/* Status Progress */}
              {order.status !== 'cancelled' ? (
                <div className="bg-surface-elevated rounded-2xl p-4 border border-border-default">
                  <h3 className="font-semibold text-text-primary mb-4">Order Status</h3>
                  
                  {/* Current Status Banner */}
                  {currentStepIndex >= 0 && currentStepIndex < STATUS_STEPS.length && (
                    <motion.div
                      key={order.status}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-4 rounded-xl mb-6 ${
                        order.status === 'ready'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-brand/10 text-brand'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {(() => {
                          const StepIcon = STATUS_STEPS[currentStepIndex].icon;
                          return <StepIcon className="w-8 h-8" />;
                        })()}
                        <div>
                          <p className="font-bold text-lg">{STATUS_STEPS[currentStepIndex].label}</p>
                          <p className="text-sm opacity-80">{STATUS_STEPS[currentStepIndex].description}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Progress Steps */}
                  <div className="relative">
                    {STATUS_STEPS.map((step, index) => {
                      const isComplete = index < currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      const StepIcon = step.icon;

                      return (
                        <div key={step.key} className="flex items-start gap-3 relative">
                          {/* Vertical line */}
                          {index < STATUS_STEPS.length - 1 && (
                            <div
                              className={`absolute left-4 top-8 w-0.5 h-8 ${
                                isComplete ? 'bg-brand' : 'bg-border-default'
                              }`}
                            />
                          )}

                          {/* Icon */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              isComplete || isCurrent
                                ? 'bg-brand text-white'
                                : 'bg-surface border-2 border-border-default text-text-muted'
                            }`}
                          >
                            <StepIcon className="w-4 h-4" />
                          </div>

                          {/* Label */}
                          <div className={`pb-8 ${isCurrent ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>
                            <p className="text-sm">{step.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
                  <p className="font-semibold text-red-800">Order Cancelled</p>
                  <p className="text-sm text-red-600 mt-1">This order has been cancelled.</p>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-surface-elevated rounded-2xl p-4 border border-border-default">
                <h3 className="font-semibold text-text-primary mb-3">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">
                          {item.quantity}× {item.menu_item_name}
                        </p>
                        {item.modifiers.length > 0 && (
                          <p className="text-sm text-text-secondary">
                            {item.modifiers.map(m => m.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <p className="font-medium text-text-primary">${item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border-default mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-text-primary">Total</p>
                    <p className="text-xl font-bold text-brand">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Pickup Info */}
              {order.status === 'ready' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 rounded-2xl p-4 border border-green-200"
                >
                  <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Ready for Pickup!
                  </h3>
                  <p className="text-green-700 text-sm">
                    Your order is ready. Please pick it up at the counter.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-green-700 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>Three Squares - 416 Chalan San Antonio, Tamuning</span>
                  </div>
                </motion.div>
              )}

              {/* Contact Info */}
              <div className="text-center text-sm text-text-secondary">
                <p>Questions about your order?</p>
                <a
                  href="tel:671-646-2652"
                  className="inline-flex items-center gap-1 text-brand font-medium mt-1"
                >
                  <Phone className="w-4 h-4" />
                  Call 671-646-2652
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!order && !error && !loading && (
          <div className="text-center py-12 text-text-secondary">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Enter your order number to track your order</p>
            <p className="text-sm mt-2">You can find this on your receipt or confirmation email</p>
          </div>
        )}
      </main>
    </div>
  );
}
