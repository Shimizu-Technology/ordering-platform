import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  AlertTriangle,
  Plus,
  Minus,
  History,
  RefreshCw,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import type { InventoryItem, StockAdjustment } from '../../types/admin';
import { adminApi } from '../../api/adminClient';
import { formatPrice } from '../../utils/price';
import { Skeleton } from '../../components/ui/Skeleton';

type StatusFilter = 'all' | 'in_stock' | 'low_stock' | 'sold_out';
type TypeFilter = 'all' | 'MenuItem' | 'MerchandiseVariant';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  in_stock: { label: 'In Stock', color: 'text-success bg-success/10' },
  low_stock: { label: 'Low Stock', color: 'text-warning bg-warning/10' },
  sold_out: { label: 'Sold Out', color: 'text-error bg-error/10' },
};

const ADJUSTMENT_REASONS = [
  { value: 'restock', label: 'Restock' },
  { value: 'damage', label: 'Damage/Waste' },
  { value: 'count_correction', label: 'Count Correction' },
  { value: 'return', label: 'Customer Return' },
  { value: 'other', label: 'Other' },
];

export function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [stats, setStats] = useState({ total: 0, tracked: 0, low_stock: 0, sold_out: 0 });
  
  // Adjustment modal
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('restock');
  const [adjustmentNotes, setAdjustmentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // History modal
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);
  const [history, setHistory] = useState<StockAdjustment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      const params: { type?: string; status?: string; search?: string } = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const data = await adminApi.getInventory(params);
      setItems(data.items);
      setStats(data.meta);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setLoading(false);
    }
  }, [typeFilter, statusFilter, search]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleQuickAdjust = async (item: InventoryItem, delta: number) => {
    const newQty = (item.stock_quantity || 0) + delta;
    if (newQty < 0) return;
    
    try {
      const updated = await adminApi.adjustStock(item.type, item.id, {
        adjustment: delta,
        reason: delta > 0 ? 'restock' : 'manual',
      });
      setItems((prev) => prev.map((i) => (i.id === item.id && i.type === item.type ? updated : i)));
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    }
  };

  const handleSubmitAdjustment = async () => {
    if (!adjustingItem || adjustmentValue === 0) return;
    
    setSubmitting(true);
    try {
      const updated = await adminApi.adjustStock(adjustingItem.type, adjustingItem.id, {
        adjustment: adjustmentValue,
        reason: adjustmentReason,
        notes: adjustmentNotes || undefined,
      });
      setItems((prev) => prev.map((i) => (i.id === adjustingItem.id && i.type === adjustingItem.type ? updated : i)));
      setAdjustingItem(null);
      setAdjustmentValue(0);
      setAdjustmentNotes('');
    } catch (err) {
      console.error('Failed to adjust stock:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const openHistory = async (item: InventoryItem) => {
    setHistoryItem(item);
    setHistoryLoading(true);
    try {
      const data = await adminApi.getAuditLog({ type: item.type, id: item.id, per_page: 20 });
      setHistory(data.adjustments);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const toggleTracking = async (item: InventoryItem) => {
    try {
      const updated = await adminApi.updateInventoryItem(item.type, item.id, {
        track_inventory: !item.track_inventory,
        stock_quantity: !item.track_inventory ? 0 : undefined,
      });
      setItems((prev) => prev.map((i) => (i.id === item.id && i.type === item.type ? updated : i)));
    } catch (err) {
      console.error('Failed to toggle tracking:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Inventory</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {stats.tracked} tracked items
          </p>
        </div>
        <button
          onClick={fetchInventory}
          className="p-2 text-text-secondary hover:text-text-primary bg-surface-elevated rounded-[var(--radius-md)] transition-colors touch-target"
          aria-label="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface-card border border-border-default rounded-[var(--radius-md)] p-3">
          <p className="text-xs text-text-muted uppercase tracking-wider">Total Items</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{stats.total}</p>
        </div>
        <div className="bg-surface-card border border-border-default rounded-[var(--radius-md)] p-3">
          <p className="text-xs text-text-muted uppercase tracking-wider">Tracked</p>
          <p className="text-2xl font-bold text-text-primary mt-1">{stats.tracked}</p>
        </div>
        <div className="bg-surface-card border border-warning/30 rounded-[var(--radius-md)] p-3">
          <p className="text-xs text-warning uppercase tracking-wider">Low Stock</p>
          <p className="text-2xl font-bold text-warning mt-1">{stats.low_stock}</p>
        </div>
        <div className="bg-surface-card border border-error/30 rounded-[var(--radius-md)] p-3">
          <p className="text-xs text-error uppercase tracking-wider">Sold Out</p>
          <p className="text-2xl font-bold text-error mt-1">{stats.sold_out}</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-elevated border border-border-default rounded-[var(--radius-md)] text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2.5 bg-surface-elevated border border-border-default rounded-[var(--radius-md)] text-sm text-text-primary focus:outline-none focus:border-brand"
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="sold_out">Sold Out</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="px-3 py-2.5 bg-surface-elevated border border-border-default rounded-[var(--radius-md)] text-sm text-text-primary focus:outline-none focus:border-brand"
          >
            <option value="all">All Types</option>
            <option value="MenuItem">Menu Items</option>
            <option value="MerchandiseVariant">Merchandise</option>
          </select>
        </div>
      </div>

      {/* Items List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 space-y-3 rounded-[var(--radius-lg)] border border-border-default">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary font-medium">No items found</p>
          <p className="text-sm text-text-muted mt-1">
            {search || statusFilter !== 'all' ? 'Try different filters' : 'Add items to track inventory'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className={`bg-surface-card rounded-[var(--radius-lg)] border p-4 transition-colors ${
                item.stock_status === 'sold_out'
                  ? 'border-error/30'
                  : item.stock_status === 'low_stock'
                  ? 'border-warning/30'
                  : 'border-border-default'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium text-text-primary truncate">{item.name}</h3>
                    {item.stock_status && STATUS_LABELS[item.stock_status] && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_LABELS[item.stock_status].color}`}>
                        {STATUS_LABELS[item.stock_status].label}
                      </span>
                    )}
                    {!item.track_inventory && (
                      <span className="text-xs text-text-muted px-2 py-0.5 rounded-full bg-surface-elevated">
                        Not Tracked
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mt-1">
                    {item.category_name} · {formatPrice(item.base_price)}
                  </p>
                </div>

                {item.track_inventory ? (
                  <div className="flex items-center gap-2">
                    {/* Quick adjust buttons */}
                    <button
                      onClick={() => handleQuickAdjust(item, -1)}
                      disabled={(item.stock_quantity || 0) <= 0}
                      className="p-2 text-text-secondary hover:text-error bg-surface-elevated rounded-[var(--radius-sm)] transition-colors disabled:opacity-30 touch-target"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAdjustingItem(item)}
                      className="min-w-[3rem] px-3 py-1.5 text-lg font-semibold text-text-primary bg-surface-elevated rounded-[var(--radius-sm)] hover:bg-surface-card transition-colors"
                    >
                      {item.stock_quantity ?? 0}
                    </button>
                    <button
                      onClick={() => handleQuickAdjust(item, 1)}
                      className="p-2 text-text-secondary hover:text-success bg-surface-elevated rounded-[var(--radius-sm)] transition-colors touch-target"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openHistory(item)}
                      className="p-2 text-text-muted hover:text-text-secondary transition-colors touch-target"
                      title="View history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => toggleTracking(item)}
                    className="px-3 py-1.5 text-sm font-medium text-brand bg-brand/10 rounded-[var(--radius-md)] hover:bg-brand/20 transition-colors"
                  >
                    Enable Tracking
                  </button>
                )}
              </div>

              {item.track_inventory && item.stock_status === 'low_stock' && (
                <div className="flex items-center gap-2 mt-3 text-sm text-warning">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Below threshold ({item.low_stock_threshold})</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Adjustment Modal */}
      <AnimatePresence>
        {adjustingItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setAdjustingItem(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-surface-card rounded-[var(--radius-lg)] shadow-xl z-50 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-border-default">
                <h3 className="font-semibold text-text-primary">Adjust Stock</h3>
                <button
                  onClick={() => setAdjustingItem(null)}
                  className="p-1 text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto">
                <div>
                  <p className="font-medium text-text-primary">{adjustingItem.name}</p>
                  <p className="text-sm text-text-secondary">
                    Current stock: {adjustingItem.stock_quantity ?? 0}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Adjustment
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setAdjustmentValue((v) => v - 1)}
                      className="p-3 bg-surface-elevated rounded-[var(--radius-md)] hover:bg-error/10 hover:text-error transition-colors touch-target"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <input
                      type="number"
                      value={adjustmentValue}
                      onChange={(e) => setAdjustmentValue(parseInt(e.target.value) || 0)}
                      className="flex-1 px-4 py-3 text-center text-xl font-semibold bg-surface-elevated border border-border-default rounded-[var(--radius-md)] focus:outline-none focus:border-brand"
                    />
                    <button
                      onClick={() => setAdjustmentValue((v) => v + 1)}
                      className="p-3 bg-surface-elevated rounded-[var(--radius-md)] hover:bg-success/10 hover:text-success transition-colors touch-target"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-text-muted text-center mt-2">
                    New stock: {(adjustingItem.stock_quantity ?? 0) + adjustmentValue}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Reason
                  </label>
                  <select
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-brand"
                  >
                    {ADJUSTMENT_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={adjustmentNotes}
                    onChange={(e) => setAdjustmentNotes(e.target.value)}
                    placeholder="Add any notes..."
                    rows={2}
                    className="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-[var(--radius-md)] text-sm placeholder:text-text-muted focus:outline-none focus:border-brand resize-none"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-border-default flex gap-3">
                <button
                  onClick={() => setAdjustingItem(null)}
                  className="flex-1 px-4 py-2.5 text-text-secondary bg-surface-elevated rounded-[var(--radius-md)] font-medium text-sm hover:bg-surface-card transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAdjustment}
                  disabled={adjustmentValue === 0 || submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white rounded-[var(--radius-md)] font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Apply
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {historyItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setHistoryItem(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-surface-card rounded-[var(--radius-lg)] shadow-xl z-50 flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-4 border-b border-border-default">
                <div>
                  <h3 className="font-semibold text-text-primary">Stock History</h3>
                  <p className="text-sm text-text-secondary">{historyItem.name}</p>
                </div>
                <button
                  onClick={() => setHistoryItem(null)}
                  className="p-1 text-text-muted hover:text-text-primary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {historyLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-10 h-10 text-text-muted mx-auto mb-2" />
                    <p className="text-text-secondary">No history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((adj) => (
                      <div
                        key={adj.id}
                        className="flex items-start gap-3 p-3 bg-surface-elevated rounded-[var(--radius-md)]"
                      >
                        <div className={`p-2 rounded-full ${
                          adj.adjustment > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                        }`}>
                          {adj.adjustment > 0 ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${
                              adj.adjustment > 0 ? 'text-success' : 'text-error'
                            }`}>
                              {adj.adjustment > 0 ? '+' : ''}{adj.adjustment}
                            </span>
                            <span className="text-sm text-text-secondary">
                              {adj.quantity_before} → {adj.quantity_after}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary capitalize">{adj.reason.replace(/_/g, ' ')}</p>
                          {adj.notes && (
                            <p className="text-xs text-text-muted mt-1">{adj.notes}</p>
                          )}
                          <p className="text-xs text-text-muted mt-1">
                            {new Date(adj.created_at).toLocaleString()}
                            {adj.user_email && ` · ${adj.user_email}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
