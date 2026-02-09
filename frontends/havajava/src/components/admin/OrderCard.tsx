import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Phone,
  FileText,
  ArrowRight,
  MessageSquare,
  Loader2,
  Check,
  RotateCcw,
} from 'lucide-react';
import type { AdminOrder, AdminOrderWithRefunds, OrderStatus } from '../../types/admin';
import { StatusBadge } from './StatusBadge';
import { formatPrice } from '../../utils/price';
import { RefundModal } from './RefundModal';
import { adminApi } from '../../api/adminClient';

const nextStatus: Partial<Record<OrderStatus, { label: string; status: OrderStatus }>> = {
  pending: { label: 'Start Preparing', status: 'preparing' },
  confirmed: { label: 'Start Preparing', status: 'preparing' },
  preparing: { label: 'Mark Ready', status: 'ready' },
  ready: { label: 'Complete', status: 'completed' },
};

interface OrderCardProps {
  order: AdminOrder;
  isNew?: boolean;
  onStatusUpdate: (orderId: number, status: OrderStatus) => void;
  onNotifyReady?: (orderId: number) => Promise<void>;
  onOrderUpdate?: (updatedOrder: AdminOrder) => void;
  updating?: boolean;
  smsConfigured?: boolean;
}

export function OrderCard({ order, isNew, onStatusUpdate, onNotifyReady, onOrderUpdate, updating, smsConfigured }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notified, setNotified] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [orderWithRefunds, setOrderWithRefunds] = useState<AdminOrderWithRefunds | null>(null);
  const [loadingRefundData, setLoadingRefundData] = useState(false);
  const next = nextStatus[order.status];

  const timeAgo = getTimeAgo(order.created_at);

  // Check if order has refund info from extended type
  const hasRefundInfo = 'refunded_amount' in order;
  const refundedAmount = hasRefundInfo ? (order as AdminOrderWithRefunds).refunded_amount : 0;
  const refundStatus = hasRefundInfo ? (order as AdminOrderWithRefunds).refund_status : null;

  const openRefundModal = async () => {
    setLoadingRefundData(true);
    try {
      const fullOrder = await adminApi.getOrder(order.id);
      setOrderWithRefunds(fullOrder);
      setShowRefundModal(true);
    } catch (err) {
      console.error('Failed to load order details:', err);
    } finally {
      setLoadingRefundData(false);
    }
  };

  const handleRefundComplete = (updatedOrder: AdminOrderWithRefunds) => {
    setShowRefundModal(false);
    setOrderWithRefunds(null);
    // Notify parent of the update
    if (onOrderUpdate) {
      onOrderUpdate(updatedOrder);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-surface-card rounded-[var(--radius-lg)] border transition-colors ${
        isNew
          ? 'border-warning shadow-md shadow-warning/10 animate-pulse-once'
          : 'border-border-default'
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-3 p-4 text-left touch-target"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-text-primary">#{order.id}</span>
            <StatusBadge status={order.status} />
            {isNew && (
              <span className="text-xs font-semibold text-warning uppercase tracking-wider">
                New
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-sm text-text-secondary">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {order.customer_name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {timeAgo}
            </span>
          </div>
          {/* Items summary (collapsed view) */}
          <p className="mt-2 text-sm text-text-secondary line-clamp-1">
            {order.items.map((i) => `${i.quantity}x ${i.menu_item_name}`).join(', ')}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="font-semibold text-text-primary">{formatPrice(order.total)}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          )}
        </div>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border-default/50 pt-3">
              {/* Contact info */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                {order.phone && (
                  <a href={`tel:${order.phone}`} className="flex items-center gap-1 hover:text-brand">
                    <Phone className="w-3.5 h-3.5" />
                    {order.phone}
                  </a>
                )}
                <span className="capitalize text-xs bg-surface-elevated px-2 py-0.5 rounded">
                  {order.order_type.replace('_', ' ')}
                </span>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-text-primary">
                        {item.quantity}x {item.menu_item_name}
                      </span>
                      <span className="text-text-secondary">{formatPrice(item.subtotal)}</span>
                    </div>
                    {item.modifiers.length > 0 && (
                      <p className="text-xs text-text-muted mt-0.5 pl-4">
                        {item.modifiers.map((m) => m.name).join(', ')}
                      </p>
                    )}
                    {item.special_instructions && (
                      <p className="text-xs text-warning mt-0.5 pl-4 flex items-start gap-1">
                        <FileText className="w-3 h-3 mt-0.5 shrink-0" />
                        {item.special_instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Special instructions */}
              {order.special_instructions && (
                <div className="bg-warning/10 rounded-[var(--radius-sm)] p-3 text-sm text-warning flex items-start gap-2">
                  <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{order.special_instructions}</span>
                </div>
              )}

              {/* Refund info */}
              {refundedAmount > 0 && (
                <div className="bg-error/5 border border-error/20 rounded-[var(--radius-sm)] p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Refunded</span>
                    <span className="font-medium text-error">-{formatPrice(refundedAmount)}</span>
                  </div>
                  {refundStatus === 'partial' && (
                    <p className="text-xs text-text-muted mt-1">Partial refund applied</p>
                  )}
                  {refundStatus === 'full' && (
                    <p className="text-xs text-text-muted mt-1">Fully refunded</p>
                  )}
                </div>
              )}

              {/* Action buttons */}
              {(next || order.status === 'ready' || order.status === 'completed') && (
                <div className="flex gap-2 pt-1 flex-wrap">
                  {next && (
                    <button
                      onClick={() => onStatusUpdate(order.id, next.status)}
                      disabled={updating}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand text-white rounded-[var(--radius-md)] font-medium text-sm transition-all hover:opacity-90 active:opacity-80 disabled:opacity-50 touch-target"
                    >
                      {updating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {next.label}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                  {order.status === 'ready' && onNotifyReady && (
                    <div className="relative group">
                      <button
                        onClick={async () => {
                          const hasContact = order.email || order.phone;
                          if (!hasContact || notified || notifying) return;
                          setNotifying(true);
                          try {
                            await onNotifyReady(order.id);
                            setNotified(true);
                            setTimeout(() => setNotified(false), 5000);
                          } catch {
                            // error handled by parent
                          } finally {
                            setNotifying(false);
                          }
                        }}
                        disabled={(!order.email && !order.phone) || notifying || notified}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-600 rounded-[var(--radius-md)] font-medium text-sm transition-all hover:bg-blue-500/20 active:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                      >
                        {notifying ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : notified ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                        {notified ? 'Sent' : 'Notify Customer'}
                      </button>
                      {!order.email && !order.phone && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          No contact info available
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                        </div>
                      )}
                    </div>
                  )}
                  {/* Refund button - available for completed orders or orders with payments */}
                  {(order.status === 'completed' || order.status === 'ready') && refundStatus !== 'full' && (
                    <button
                      onClick={openRefundModal}
                      disabled={loadingRefundData}
                      className="flex items-center gap-2 px-4 py-2.5 bg-orange-500/10 text-orange-600 rounded-[var(--radius-md)] font-medium text-sm transition-all hover:bg-orange-500/20 active:bg-orange-500/30 disabled:opacity-50 touch-target"
                    >
                      {loadingRefundData ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RotateCcw className="w-4 h-4" />
                      )}
                      Refund
                    </button>
                  )}
                  {order.status !== 'completed' && order.status !== 'cancelled' && (
                    <button
                      onClick={() => onStatusUpdate(order.id, 'cancelled')}
                      disabled={updating}
                      className="px-4 py-2.5 text-error bg-error/10 rounded-[var(--radius-md)] font-medium text-sm transition-all hover:bg-error/20 active:bg-error/30 disabled:opacity-50 touch-target"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refund Modal */}
      <AnimatePresence>
        {showRefundModal && orderWithRefunds && (
          <RefundModal
            order={orderWithRefunds}
            onClose={() => {
              setShowRefundModal(false);
              setOrderWithRefunds(null);
            }}
            onRefundComplete={handleRefundComplete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function getTimeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
