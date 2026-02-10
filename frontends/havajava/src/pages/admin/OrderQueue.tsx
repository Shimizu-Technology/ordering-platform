import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  RefreshCw,
  Bell,
  BellOff,
  Inbox,
} from 'lucide-react';
import type { AdminOrder, AdminRestaurant, OrderStatus } from '../../types/admin';
import { adminApi } from '../../api/adminClient';
import { OrderCard } from '../../components/admin/OrderCard';
import { playOrderChime } from '../../utils/sound';
import { Skeleton } from '../../components/ui/Skeleton';

const STATUS_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'ready', label: 'Ready' },
  { id: 'completed', label: 'Completed' },
];

const POLL_INTERVAL = 8000; // 8 seconds

interface OrderQueueProps {
  restaurant?: AdminRestaurant | null;
}

export function OrderQueue({ restaurant }: OrderQueueProps) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderIds, setNewOrderIds] = useState<Set<number>>(new Set());

  const knownIdsRef = useRef<Set<number>>(new Set());
  const initialLoadRef = useRef(true);
  const pollRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchOrders = useCallback(async () => {
    try {
      const params: { status?: string; search?: string } = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await adminApi.getOrders(params);
      setOrders(data.orders);

      // Detect new orders
      const currentIds = new Set(data.orders.map((o) => o.id));

      if (!initialLoadRef.current) {
        const freshIds = new Set<number>();
        for (const id of currentIds) {
          if (!knownIdsRef.current.has(id)) {
            freshIds.add(id);
          }
        }
        if (freshIds.size > 0) {
          setNewOrderIds((prev) => new Set([...prev, ...freshIds]));
          if (soundEnabled) {
            playOrderChime();
          }
          // Clear "new" indicator after 10 seconds
          setTimeout(() => {
            setNewOrderIds((prev) => {
              const next = new Set(prev);
              freshIds.forEach((id) => next.delete(id));
              return next;
            });
          }, 10000);
        }
      }

      knownIdsRef.current = currentIds;
      initialLoadRef.current = false;
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setLoading(false);
    }
  }, [statusFilter, search, soundEnabled]);

  // Polling
  useEffect(() => {
    fetchOrders();

    pollRef.current = setInterval(fetchOrders, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: number, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const updated = await adminApi.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
    } catch (err) {
      console.error('Failed to update order:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleNotifyReady = async (orderId: number) => {
    try {
      await adminApi.notifyOrderReady(orderId);
    } catch (err) {
      console.error('Failed to notify customer:', err);
      throw err;
    }
  };

  const activeCount = orders.filter((o) => !['completed', 'cancelled'].includes(o.status)).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Order Queue</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {activeCount} active {activeCount === 1 ? 'order' : 'orders'}
            {restaurant?.name ? ` · ${restaurant.name}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-md transition-colors touch-target ${
              soundEnabled
                ? 'text-brand bg-brand/10'
                : 'text-text-muted bg-surface-elevated'
            }`}
            aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
          >
            {soundEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
          </button>
          <button
            onClick={fetchOrders}
            className="p-2 text-text-secondary hover:text-text-primary bg-surface-elevated rounded-md transition-colors touch-target"
            aria-label="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-border-default rounded-md text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors touch-target ${
              statusFilter === tab.id
                ? 'bg-brand text-white'
                : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-4 space-y-3 rounded-lg border border-border-default">
              <div className="flex justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <Inbox className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary font-medium">No orders found</p>
          <p className="text-sm text-text-muted mt-1">
            {statusFilter !== 'all' ? 'Try a different filter' : 'New orders will appear here'}
          </p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isNew={newOrderIds.has(order.id)}
                onStatusUpdate={handleStatusUpdate}
                onNotifyReady={handleNotifyReady}
                updating={updatingId === order.id}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
