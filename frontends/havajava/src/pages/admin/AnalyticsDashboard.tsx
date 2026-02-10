import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Award,
  Calendar,
  BarChart3,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { adminApi } from '../../api/adminClient';
import { staggerContainer, staggerItem } from '../../utils/motion';
import type { AnalyticsOverview, RevenueResponse, ItemsResponse, HoursResponse } from '../../types/analytics';

type Granularity = 'daily' | 'weekly' | 'monthly';

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ── Animated Counter ──────────────────────────────────────────────────
function AnimatedCounter({ value, prefix = '', decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    const duration = 800;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + diff * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <span>{prefix}{display.toFixed(decimals)}</span>;
}

// ── KPI Card ──────────────────────────────────────────────────────────
function KpiCard({
  title,
  value,
  prefix = '',
  decimals = 0,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: number;
  prefix?: string;
  decimals?: number;
  icon: React.ElementType;
  subtitle?: string;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className="bg-surface-card border border-border-default rounded-lg p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-text-secondary">{title}</span>
        <div className="p-2 bg-brand/10 rounded-md">
          <Icon className="w-4 h-4 text-brand" />
        </div>
      </div>
      <div className="text-2xl font-bold text-text-primary tabular-nums">
        <AnimatedCounter value={value} prefix={prefix} decimals={decimals} />
      </div>
      {subtitle && (
        <p className="text-xs text-text-muted mt-1">{subtitle}</p>
      )}
    </motion.div>
  );
}

// ── Chart Tooltip ─────────────────────────────────────────────────────
interface TooltipPayloadItem {
  value?: number;
  dataKey?: string;
  color?: string;
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-card border border-border-default rounded-md p-3 shadow-lg text-sm">
      <p className="font-medium text-text-primary mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-text-secondary">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
          {entry.dataKey === 'revenue' ? formatCurrency(entry.value ?? 0) : `${entry.value} orders`}
        </p>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────
export function AnalyticsDashboard() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueResponse | null>(null);
  const [itemsData, setItemsData] = useState<ItemsResponse | null>(null);
  const [hoursData, setHoursData] = useState<HoursResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState<Granularity>('daily');

  const thirtyDaysAgo = formatDateForInput(new Date(Date.now() - 30 * 86400000));
  const today = formatDateForInput(new Date());
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, rev, items, hours] = await Promise.all([
        adminApi.getAnalyticsOverview(),
        adminApi.getAnalyticsRevenue({ start_date: startDate, end_date: endDate, granularity }),
        adminApi.getAnalyticsItems({ start_date: startDate, end_date: endDate, limit: 10 }),
        adminApi.getAnalyticsHours({ start_date: startDate, end_date: endDate }),
      ]);
      setOverview(ov);
      setRevenueData(rev);
      setItemsData(items);
      setHoursData(hours);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, granularity]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading && !overview) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface-card border border-border-default rounded-lg p-5 h-28 animate-pulse" />
          ))}
        </div>
        <div className="bg-surface-card border border-border-default rounded-lg h-80 animate-pulse" />
      </div>
    );
  }

  const topItemName = overview?.top_items?.[0]?.name ?? 'N/A';

  // Peak hour
  const peakHour = hoursData?.hours?.reduce((max, h) =>
    h.order_count > (max?.order_count ?? 0) ? h : max
  , hoursData.hours[0]);
  const maxHourOrders = peakHour?.order_count ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-text-primary">Analytics</h2>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-surface-card border border-border-default rounded-md transition-colors touch-target"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <KpiCard
          title="Today's Revenue"
          value={overview?.revenue ?? 0}
          prefix="$"
          decimals={2}
          icon={DollarSign}
          subtitle="Completed orders"
        />
        <KpiCard
          title="Orders Today"
          value={overview?.order_count ?? 0}
          icon={ShoppingBag}
          subtitle="Excl. cancelled"
        />
        <KpiCard
          title="Avg. Order Value"
          value={overview?.avg_order_value ?? 0}
          prefix="$"
          decimals={2}
          icon={TrendingUp}
        />
        <KpiCard
          title="Top Item"
          value={overview?.top_items?.[0]?.quantity ?? 0}
          icon={Award}
          subtitle={topItemName}
        />
      </motion.div>

      {/* Date Range + Granularity */}
      <div className="flex flex-wrap items-end gap-3 p-4 bg-surface-card border border-border-default rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-text-muted" />
          <label className="text-sm font-medium text-text-secondary">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input-field !w-auto"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-text-secondary">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field !w-auto"
          />
        </div>
        <div className="flex rounded-md border border-border-default overflow-hidden">
          {(['daily', 'weekly', 'monthly'] as Granularity[]).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-2 text-sm font-medium transition-colors touch-target ${
                granularity === g
                  ? 'bg-brand text-white'
                  : 'bg-surface-card text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
              }`}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="bg-surface-card border border-border-default rounded-lg p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-brand" />
          <h3 className="text-base font-bold text-text-primary">Revenue Over Time</h3>
          {revenueData && (
            <span className="ml-auto text-sm font-medium text-text-secondary tabular-nums">
              Total: {formatCurrency(revenueData.total_revenue)}
            </span>
          )}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData?.data_points ?? []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
              <XAxis
                dataKey="date"
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                tickFormatter={(d: string) => {
                  const date = new Date(d + 'T00:00:00');
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                tickFormatter={(v: number) => `$${v}`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--brand-primary)"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Two column: Top Items + Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Items Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-surface-card border border-border-default rounded-lg p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-brand" />
            <h3 className="text-base font-bold text-text-primary">Top Selling Items</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={itemsData?.items ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis
                  type="category"
                  dataKey="item_name"
                  width={120}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as { item_name: string; total_quantity: number; total_revenue: number };
                    return (
                      <div className="bg-surface-card border border-border-default rounded-md p-3 shadow-lg text-sm">
                        <p className="font-medium text-text-primary">{d.item_name}</p>
                        <p className="text-text-secondary">{d.total_quantity} sold</p>
                        <p className="text-text-secondary">{formatCurrency(d.total_revenue)} revenue</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="total_quantity" fill="var(--brand-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Peak Hours */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="bg-surface-card border border-border-default rounded-lg p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-brand" />
            <h3 className="text-base font-bold text-text-primary">Peak Hours</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hoursData?.hours ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  interval={2}
                />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload as { label: string; order_count: number; revenue: number };
                    return (
                      <div className="bg-surface-card border border-border-default rounded-md p-3 shadow-lg text-sm">
                        <p className="font-medium text-text-primary">{d.label}</p>
                        <p className="text-text-secondary">{d.order_count} orders</p>
                        <p className="text-text-secondary">{formatCurrency(d.revenue)} revenue</p>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="order_count"
                  fill="var(--brand-primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {peakHour && maxHourOrders > 0 && (
            <p className="text-sm text-text-secondary mt-3">
              Busiest hour: <span className="font-medium text-text-primary">{peakHour.label}</span> with {peakHour.order_count} orders
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
