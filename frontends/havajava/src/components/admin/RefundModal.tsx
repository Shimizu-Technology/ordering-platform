import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  AlertTriangle,
  DollarSign,
  Loader2,
  Check,
  RotateCcw,
} from 'lucide-react';
import type { AdminOrderWithRefunds, RefundRequest, RefundReason } from '../../types/admin';
import { adminApi } from '../../api/adminClient';
import { formatPrice } from '../../utils/price';

const REFUND_REASONS: { value: RefundReason; label: string }[] = [
  { value: 'customer_request', label: 'Customer Request' },
  { value: 'item_unavailable', label: 'Item Unavailable' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'wrong_item', label: 'Wrong Item' },
  { value: 'never_picked_up', label: 'Never Picked Up' },
  { value: 'duplicate_charge', label: 'Duplicate Charge' },
  { value: 'other', label: 'Other' },
];

interface RefundModalProps {
  order: AdminOrderWithRefunds;
  onClose: () => void;
  onRefundComplete: (updatedOrder: AdminOrderWithRefunds) => void;
}

export function RefundModal({ order, onClose, onRefundComplete }: RefundModalProps) {
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState<RefundReason>('customer_request');
  const [notes, setNotes] = useState('');
  const [restoreInventory, setRestoreInventory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingAmount = order.total - (order.refunded_amount || 0);
  const refundAmount = refundType === 'full' ? remainingAmount : parseFloat(amount) || 0;
  const isValidAmount = refundType === 'full' || (refundAmount > 0 && refundAmount <= remainingAmount);

  const handleSubmit = async () => {
    if (!isValidAmount) return;
    if (reason === 'other' && !notes.trim()) {
      setError('Please provide notes when selecting "Other" as the reason');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const request: RefundRequest = {
        refund_type: refundType,
        reason,
        notes: notes.trim() || undefined,
        restore_inventory: restoreInventory,
      };

      if (refundType === 'partial') {
        request.amount = refundAmount;
      }

      const response = await adminApi.processRefund(order.id, request);
      
      // Update the order with new refund info
      const updatedOrder: AdminOrderWithRefunds = {
        ...order,
        refunded_amount: response.order.refunded_amount,
        refund_status: response.order.refund_status,
        refunds: [...(order.refunds || []), response.refund],
      };

      onRefundComplete(updatedOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process refund');
    } finally {
      setSubmitting(false);
    }
  };

  const canRefund = order.stripe_payment_intent_id && remainingAmount > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-surface-card rounded-lg shadow-xl z-50 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-default">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            Process Refund
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Order Summary */}
          <div className="bg-surface-elevated rounded-md p-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Order #{order.id}</span>
              <span className="font-medium text-text-primary">{formatPrice(order.total)}</span>
            </div>
            {order.refunded_amount > 0 && (
              <div className="flex justify-between text-sm mt-1">
                <span className="text-text-secondary">Already Refunded</span>
                <span className="font-medium text-error">-{formatPrice(order.refunded_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm mt-1 pt-1 border-t border-border-default">
              <span className="text-text-secondary">Refundable</span>
              <span className="font-semibold text-text-primary">{formatPrice(remainingAmount)}</span>
            </div>
          </div>

          {!canRefund ? (
            <div className="bg-warning/10 rounded-md p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-warning">Cannot Process Refund</p>
                <p className="text-sm text-text-secondary mt-1">
                  {!order.stripe_payment_intent_id
                    ? 'This order was not paid via Stripe.'
                    : 'This order has been fully refunded.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Refund Type */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Refund Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRefundType('full')}
                    className={`flex-1 px-4 py-3 rounded-md font-medium text-sm transition-colors ${
                      refundType === 'full'
                        ? 'bg-brand text-white'
                        : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Full ({formatPrice(remainingAmount)})
                  </button>
                  <button
                    onClick={() => setRefundType('partial')}
                    className={`flex-1 px-4 py-3 rounded-md font-medium text-sm transition-colors ${
                      refundType === 'partial'
                        ? 'bg-brand text-white'
                        : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Partial
                  </button>
                </div>
              </div>

              {/* Partial Amount Input */}
              {refundType === 'partial' && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Refund Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={remainingAmount}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 bg-surface-elevated border border-border-default rounded-md text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  {parseFloat(amount) > remainingAmount && (
                    <p className="text-xs text-error mt-1">
                      Amount exceeds refundable amount
                    </p>
                  )}
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Reason
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as RefundReason)}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-md text-sm focus:outline-none focus:border-brand"
                >
                  {REFUND_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Notes {reason === 'other' && <span className="text-error">*</span>}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any details about this refund..."
                  rows={2}
                  className="w-full px-3 py-2.5 bg-surface-elevated border border-border-default rounded-md text-sm placeholder:text-text-muted focus:outline-none focus:border-brand resize-none"
                />
              </div>

              {/* Restore Inventory Toggle */}
              <label className="flex items-center gap-3 p-3 bg-surface-elevated rounded-md cursor-pointer">
                <input
                  type="checkbox"
                  checked={restoreInventory}
                  onChange={(e) => setRestoreInventory(e.target.checked)}
                  className="w-4 h-4 text-brand bg-surface border-border-default rounded focus:ring-brand"
                />
                <div>
                  <p className="text-sm font-medium text-text-primary">Restore Inventory</p>
                  <p className="text-xs text-text-muted">Add items back to stock</p>
                </div>
              </label>

              {/* Error */}
              {error && (
                <div className="bg-error/10 text-error text-sm p-3 rounded-md flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-default flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-text-secondary bg-surface-elevated rounded-md font-medium text-sm hover:bg-surface-card transition-colors"
          >
            Cancel
          </button>
          {canRefund && (
            <button
              onClick={handleSubmit}
              disabled={!isValidAmount || submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-error text-white rounded-md font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Refund {formatPrice(refundAmount)}
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
