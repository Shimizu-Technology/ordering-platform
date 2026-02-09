import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  Zap,
  Clock,
  Tag,
  Percent,
  DollarSign,
  Gift,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';
import { adminApi } from '../../api/adminClient';
import type { AdminPromotion } from '../../types/admin';
import type { AdminCategory } from '../../types/admin';
import { formatPrice } from '../../utils/price';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
const DAY_LABELS: Record<string, string> = {
  sunday: 'Sun', monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed',
  thursday: 'Thu', friday: 'Fri', saturday: 'Sat',
};

const PROMO_TYPE_LABELS: Record<string, string> = {
  percentage_off: 'Percentage Off',
  fixed_off: 'Fixed Discount',
  bogo: 'Buy One Get One',
  happy_hour_price: 'Happy Hour Price',
};

const PROMO_TYPE_ICONS: Record<string, React.ElementType> = {
  percentage_off: Percent,
  fixed_off: DollarSign,
  bogo: Gift,
  happy_hour_price: Tag,
};

type PromotionTypeValue = 'percentage_off' | 'fixed_off' | 'bogo' | 'happy_hour_price';
type AppliesToValue = 'all' | 'category' | 'item';

type FormData = {
  name: string;
  promotion_type: PromotionTypeValue;
  value: string;
  start_time: string;
  end_time: string;
  days_of_week: string[];
  active: boolean;
  applies_to: AppliesToValue;
  applies_to_id: string;
};

const emptyForm: FormData = {
  name: '',
  promotion_type: 'percentage_off',
  value: '',
  start_time: '17:00',
  end_time: '19:00',
  days_of_week: [],
  active: true,
  applies_to: 'all',
  applies_to_id: '',
};

export function PromotionsManagement() {
  const [promotions, setPromotions] = useState<AdminPromotion[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [promos, cats] = await Promise.all([
        adminApi.getPromotions(),
        adminApi.getCategories(),
      ]);
      setPromotions(promos);
      setCategories(cats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promotions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (promo: AdminPromotion) => {
    setForm({
      name: promo.name,
      promotion_type: promo.promotion_type,
      value: String(promo.value),
      start_time: promo.start_time,
      end_time: promo.end_time,
      days_of_week: [...promo.days_of_week],
      active: promo.active,
      applies_to: promo.applies_to,
      applies_to_id: promo.applies_to_id ? String(promo.applies_to_id) : '',
    });
    setEditingId(promo.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Partial<AdminPromotion> = {
        name: form.name,
        promotion_type: form.promotion_type as AdminPromotion['promotion_type'],
        value: parseFloat(form.value),
        start_time: form.start_time,
        end_time: form.end_time,
        days_of_week: form.days_of_week,
        active: form.active,
        applies_to: form.applies_to as AdminPromotion['applies_to'],
        applies_to_id: form.applies_to === 'all' ? null : parseInt(form.applies_to_id) || null,
      };

      if (editingId) {
        await adminApi.updatePromotion(editingId, payload);
      } else {
        await adminApi.createPromotion(payload);
      }

      closeForm();
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save promotion');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this promotion?')) return;
    try {
      await adminApi.deletePromotion(id);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const toggleDay = (day: string) => {
    setForm((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day],
    }));
  };

  const toggleActive = async (promo: AdminPromotion) => {
    try {
      await adminApi.updatePromotion(promo.id, { active: !promo.active });
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-[var(--radius-lg)] bg-surface-elevated animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Promotions</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage happy hours, discounts, and special offers
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white text-sm font-medium rounded-[var(--radius-md)] hover:bg-brand-hover transition-colors touch-target"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Promotion</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-error/10 text-error text-sm rounded-[var(--radius-md)]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Weekly Schedule Overview */}
      {promotions.length > 0 && (
        <div className="bg-surface-card rounded-[var(--radius-lg)] border border-border-default p-4">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Weekly Schedule</h3>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map((day) => {
              const dayPromos = promotions.filter(
                (p) => p.active && p.days_of_week.includes(day)
              );
              return (
                <div key={day} className="text-center">
                  <div className="text-xs font-medium text-text-secondary mb-1.5">
                    {DAY_LABELS[day]}
                  </div>
                  <div className="min-h-[3rem] space-y-0.5">
                    {dayPromos.map((p) => (
                      <div
                        key={p.id}
                        className="px-1 py-0.5 bg-brand/10 text-brand rounded text-[10px] leading-tight font-medium truncate"
                        title={`${p.name}: ${p.start_time}-${p.end_time}`}
                      >
                        {p.start_time.slice(0, 5)}
                      </div>
                    ))}
                    {dayPromos.length === 0 && (
                      <div className="text-xs text-text-muted">—</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Promotions List */}
      {promotions.length === 0 ? (
        <div className="text-center py-12 bg-surface-card rounded-[var(--radius-lg)] border border-border-default">
          <Zap className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-secondary font-medium">No promotions yet</p>
          <p className="text-sm text-text-muted mt-1">
            Create your first promotion to attract more customers
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {promotions.map((promo) => {
              const Icon = PROMO_TYPE_ICONS[promo.promotion_type] || Tag;
              const isExpanded = expandedId === promo.id;

              return (
                <motion.div
                  key={promo.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  className="bg-surface-card rounded-[var(--radius-lg)] border border-border-default overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${
                      promo.currently_active
                        ? 'bg-success/10 text-success'
                        : promo.active
                          ? 'bg-brand/10 text-brand'
                          : 'bg-surface-elevated text-text-muted'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-text-primary truncate">{promo.name}</h3>
                        {promo.currently_active && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded-full">
                            <Zap className="w-3 h-3" />
                            Live
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-sm text-text-secondary">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{promo.start_time} – {promo.end_time}</span>
                        <span className="text-text-muted">·</span>
                        <span>{formatPromoValue(promo)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleActive(promo)}
                        className={`relative w-10 h-6 rounded-full transition-colors touch-target ${
                          promo.active ? 'bg-brand' : 'bg-border-default'
                        }`}
                        aria-label={promo.active ? 'Deactivate' : 'Activate'}
                      >
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                          promo.active ? 'translate-x-[18px]' : 'translate-x-0.5'
                        }`} />
                      </button>
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : promo.id)}
                        className="p-2 text-text-secondary hover:text-text-primary transition-colors touch-target"
                        aria-label="Toggle details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-1 border-t border-border-subtle space-y-3">
                          <div className="flex flex-wrap gap-1">
                            {DAYS.map((day) => (
                              <span
                                key={day}
                                className={`px-2 py-1 text-xs font-medium rounded ${
                                  promo.days_of_week.includes(day)
                                    ? 'bg-brand/10 text-brand'
                                    : 'bg-surface-elevated text-text-muted'
                                }`}
                              >
                                {DAY_LABELS[day]}
                              </span>
                            ))}
                          </div>
                          <div className="text-sm text-text-secondary">
                            <span className="font-medium">Applies to: </span>
                            {promo.applies_to === 'all' ? 'All items' :
                              promo.applies_to === 'category' ? `Category #${promo.applies_to_id}` :
                                `Item #${promo.applies_to_id}`}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditForm(promo)}
                              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary bg-surface-elevated rounded-[var(--radius-md)] transition-colors touch-target"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(promo.id)}
                              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-error hover:bg-error/10 rounded-[var(--radius-md)] transition-colors touch-target"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={closeForm}
            />
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.97 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-x-4 top-[5vh] bottom-[5vh] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg bg-surface-card rounded-[var(--radius-xl)] shadow-xl z-50 flex flex-col overflow-hidden"
            >
              {/* Form Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border-default shrink-0">
                <h3 className="font-bold text-text-primary">
                  {editingId ? 'Edit Promotion' : 'New Promotion'}
                </h3>
                <button
                  onClick={closeForm}
                  className="p-2 -m-2 text-text-secondary hover:text-text-primary transition-colors touch-target"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Promotion Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g., Happy Hour"
                    className="input-field"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Discount Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PROMO_TYPE_LABELS).map(([type, label]) => {
                      const TypeIcon = PROMO_TYPE_ICONS[type] || Tag;
                      const isSelected = form.promotion_type === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, promotion_type: type as PromotionTypeValue }))}
                          className={`flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-[var(--radius-md)] border transition-colors touch-target ${
                            isSelected
                              ? 'bg-brand/10 border-brand text-brand'
                              : 'bg-surface-elevated border-border-default text-text-secondary hover:border-brand/30'
                          }`}
                        >
                          <TypeIcon className="w-4 h-4" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Value */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    {form.promotion_type === 'percentage_off' ? 'Percentage (%)' :
                      form.promotion_type === 'happy_hour_price' ? 'Happy Hour Price ($)' :
                        form.promotion_type === 'bogo' ? 'Buy X Get 1 Free (enter X)' :
                          'Discount Amount ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                    placeholder={form.promotion_type === 'percentage_off' ? '20' : '5.00'}
                    className="input-field"
                  />
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Schedule
                  </label>
                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <label className="text-xs text-text-muted mb-1 block">Start Time</label>
                      <input
                        type="time"
                        value={form.start_time}
                        onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-text-muted mb-1 block">End Time</label>
                      <input
                        type="time"
                        value={form.end_time}
                        onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                  </div>

                  {/* Days */}
                  <div className="flex flex-wrap gap-1.5">
                    {DAYS.map((day) => {
                      const isSelected = form.days_of_week.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-2 text-sm font-medium rounded-[var(--radius-md)] transition-colors touch-target ${
                            isSelected
                              ? 'bg-brand text-white'
                              : 'bg-surface-elevated text-text-secondary hover:bg-surface-elevated/80'
                          }`}
                        >
                          {DAY_LABELS[day]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Applies To */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Applies To
                  </label>
                  <select
                    value={form.applies_to}
                    onChange={(e) => setForm((f) => ({ ...f, applies_to: e.target.value as AppliesToValue, applies_to_id: '' }))}
                    className="input-field"
                  >
                    <option value="all">All Items</option>
                    <option value="category">Specific Category</option>
                    <option value="item">Specific Item</option>
                  </select>

                  {form.applies_to === 'category' && (
                    <select
                      value={form.applies_to_id}
                      onChange={(e) => setForm((f) => ({ ...f, applies_to_id: e.target.value }))}
                      className="input-field mt-2"
                    >
                      <option value="">Select category...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  )}

                  {form.applies_to === 'item' && (
                    <select
                      value={form.applies_to_id}
                      onChange={(e) => setForm((f) => ({ ...f, applies_to_id: e.target.value }))}
                      className="input-field mt-2"
                    >
                      <option value="">Select item...</option>
                      {categories.flatMap((cat) =>
                        cat.items.map((item) => (
                          <option key={item.id} value={item.id}>
                            {cat.name} — {item.name} ({formatPrice(item.base_price)})
                          </option>
                        ))
                      )}
                    </select>
                  )}
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex items-center gap-3 px-5 py-4 border-t border-border-default shrink-0">
                <button
                  onClick={closeForm}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-elevated rounded-[var(--radius-md)] hover:bg-border-default transition-colors touch-target"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name || !form.value || form.days_of_week.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand rounded-[var(--radius-md)] hover:bg-brand-hover transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4" />
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatPromoValue(promo: AdminPromotion): string {
  switch (promo.promotion_type) {
    case 'percentage_off': return `${promo.value}% off`;
    case 'fixed_off': return `${formatPrice(promo.value)} off`;
    case 'happy_hour_price': return `${formatPrice(promo.value)} flat`;
    case 'bogo': return 'BOGO';
    default: return '';
  }
}
