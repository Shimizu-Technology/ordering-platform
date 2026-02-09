import type { OrderStatus } from '../../types/admin';

const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pending', bg: 'bg-warning/15', text: 'text-warning' },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-500/15', text: 'text-blue-600' },
  preparing: { label: 'Preparing', bg: 'bg-purple-500/15', text: 'text-purple-600' },
  ready: { label: 'Ready', bg: 'bg-success/15', text: 'text-success' },
  completed: { label: 'Completed', bg: 'bg-surface-elevated', text: 'text-text-muted' },
  cancelled: { label: 'Cancelled', bg: 'bg-error/15', text: 'text-error' },
};

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} ${className}`}
    >
      {config.label}
    </span>
  );
}
