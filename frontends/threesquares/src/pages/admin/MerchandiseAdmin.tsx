import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cookie,
  Plus,
  Pencil,
  Trash2,
  Package,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  Loader2,
} from 'lucide-react';
import { adminApi } from '../../api/adminClient';
import type {
  MerchandiseCategory,
  MerchandiseItem,
  MerchandiseVariant,
} from '../../types/admin';

export function MerchandiseAdmin() {
  const [categories, setCategories] = useState<MerchandiseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Modal states
  const [editingCategory, setEditingCategory] = useState<MerchandiseCategory | null>(null);
  const [editingItem, setEditingItem] = useState<{ item: MerchandiseItem; categoryId: number } | null>(null);
  const [editingVariant, setEditingVariant] = useState<{ variant: MerchandiseVariant; itemId: number } | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<{ variant: MerchandiseVariant; itemName: string } | null>(null);

  // New item/variant state
  const [addingItemTo, setAddingItemTo] = useState<number | null>(null);
  const [addingVariantTo, setAddingVariantTo] = useState<number | null>(null);

  useEffect(() => {
    loadMerchandise();
  }, []);

  const loadMerchandise = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getMerchandise();
      setCategories(data.categories);
      // Expand all categories by default
      setExpandedCategories(new Set(data.categories.map(c => c.id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load merchandise');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: number) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleItem = (id: number) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Delete this category and all its items?')) return;
    try {
      await adminApi.deleteMerchandiseCategory(id);
      loadMerchandise();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Delete this item and all its variants?')) return;
    try {
      await adminApi.deleteMerchandiseItem(id);
      loadMerchandise();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleDeleteVariant = async (id: number) => {
    if (!confirm('Delete this variant?')) return;
    try {
      await adminApi.deleteMerchandiseVariant(id);
      loadMerchandise();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  // Calculate totals
  const totalItems = categories.reduce((sum, c) => sum + c.items.length, 0);
  const totalVariants = categories.reduce(
    (sum, c) => sum + c.items.reduce((s, i) => s + i.variants.length, 0),
    0
  );
  const lowStockCount = categories.reduce(
    (sum, c) => sum + c.items.reduce((s, i) => s + i.variants.filter(v => v.low_stock && v.track_inventory).length, 0),
    0
  );
  const outOfStockCount = categories.reduce(
    (sum, c) => sum + c.items.reduce((s, i) => s + i.variants.filter(v => !v.in_stock && v.track_inventory).length, 0),
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error/10 text-error rounded-lg">
        <p>{error}</p>
        <button onClick={loadMerchandise} className="mt-2 text-sm underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Cookie className="w-6 h-6 text-brand" />
            Merchandise
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Manage Latte Stone Cookies inventory
          </p>
        </div>
        <button
          onClick={() => setEditingCategory({ id: 0, name: '', description: null, active: true, position: 0, items: [] })}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Cookie} label="Products" value={totalItems} />
        <StatCard icon={Package} label="Variants" value={totalVariants} />
        <StatCard
          icon={AlertTriangle}
          label="Low Stock"
          value={lowStockCount}
          variant={lowStockCount > 0 ? 'warning' : 'default'}
        />
        <StatCard
          icon={AlertTriangle}
          label="Out of Stock"
          value={outOfStockCount}
          variant={outOfStockCount > 0 ? 'error' : 'default'}
        />
      </div>

      {/* Categories list */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            <Cookie className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No merchandise categories yet</p>
            <button
              onClick={() => setEditingCategory({ id: 0, name: '', description: null, active: true, position: 0, items: [] })}
              className="mt-4 text-brand font-medium hover:underline"
            >
              Create your first category
            </button>
          </div>
        ) : (
          categories.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              expanded={expandedCategories.has(category.id)}
              expandedItems={expandedItems}
              onToggle={() => toggleCategory(category.id)}
              onToggleItem={toggleItem}
              onEditCategory={() => setEditingCategory(category)}
              onDeleteCategory={() => handleDeleteCategory(category.id)}
              onEditItem={(item) => setEditingItem({ item, categoryId: category.id })}
              onDeleteItem={handleDeleteItem}
              onEditVariant={(variant, itemId) => setEditingVariant({ variant, itemId })}
              onDeleteVariant={handleDeleteVariant}
              onAdjustStock={(variant, itemName) => setStockAdjustment({ variant, itemName })}
              onAddItem={() => setAddingItemTo(category.id)}
              onAddVariant={(itemId) => setAddingVariantTo(itemId)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editingCategory && (
          <CategoryModal
            category={editingCategory}
            onClose={() => setEditingCategory(null)}
            onSave={loadMerchandise}
          />
        )}
        {(editingItem || addingItemTo !== null) && (
          <ItemModal
            item={editingItem?.item}
            categoryId={editingItem?.categoryId ?? addingItemTo!}
            onClose={() => { setEditingItem(null); setAddingItemTo(null); }}
            onSave={loadMerchandise}
          />
        )}
        {(editingVariant || addingVariantTo !== null) && (
          <VariantModal
            variant={editingVariant?.variant}
            itemId={editingVariant?.itemId ?? addingVariantTo!}
            onClose={() => { setEditingVariant(null); setAddingVariantTo(null); }}
            onSave={loadMerchandise}
          />
        )}
        {stockAdjustment && (
          <StockAdjustmentModal
            variant={stockAdjustment.variant}
            itemName={stockAdjustment.itemName}
            onClose={() => setStockAdjustment(null)}
            onSave={loadMerchandise}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Stat Card Component
// ============================================================================

function StatCard({
  icon: Icon,
  label,
  value,
  variant = 'default',
}: {
  icon: typeof Cookie;
  label: string;
  value: number;
  variant?: 'default' | 'warning' | 'error';
}) {
  const colors = {
    default: 'bg-surface-elevated text-text-primary',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-700',
  };

  return (
    <div className={`p-4 rounded-xl ${colors[variant]}`}>
      <Icon className="w-5 h-5 mb-2 opacity-70" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-70">{label}</p>
    </div>
  );
}

// ============================================================================
// Category Card Component
// ============================================================================

function CategoryCard({
  category,
  expanded,
  expandedItems,
  onToggle,
  onToggleItem,
  onEditCategory,
  onDeleteCategory,
  onEditItem,
  onDeleteItem,
  onEditVariant,
  onDeleteVariant,
  onAdjustStock,
  onAddItem,
  onAddVariant,
}: {
  category: MerchandiseCategory;
  expanded: boolean;
  expandedItems: Set<number>;
  onToggle: () => void;
  onToggleItem: (id: number) => void;
  onEditCategory: () => void;
  onDeleteCategory: () => void;
  onEditItem: (item: MerchandiseItem) => void;
  onDeleteItem: (id: number) => void;
  onEditVariant: (variant: MerchandiseVariant, itemId: number) => void;
  onDeleteVariant: (id: number) => void;
  onAdjustStock: (variant: MerchandiseVariant, itemName: string) => void;
  onAddItem: () => void;
  onAddVariant: (itemId: number) => void;
}) {
  return (
    <div className="bg-surface-elevated rounded-xl border border-border-default overflow-hidden">
      {/* Category header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface transition-colors"
      >
        {expanded ? (
          <ChevronDown className="w-5 h-5 text-text-muted" />
        ) : (
          <ChevronRight className="w-5 h-5 text-text-muted" />
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary">{category.name}</h3>
          <p className="text-sm text-text-secondary">
            {category.items.length} {category.items.length === 1 ? 'item' : 'items'}
            {!category.active && <span className="ml-2 text-amber-600">(inactive)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={onEditCategory}
            className="p-2 hover:bg-surface rounded-lg transition-colors"
            title="Edit category"
          >
            <Pencil className="w-4 h-4 text-text-muted" />
          </button>
          <button
            onClick={onDeleteCategory}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete category"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </button>

      {/* Items */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border-default">
              {category.items.map(item => (
                <ItemRow
                  key={item.id}
                  item={item}
                  expanded={expandedItems.has(item.id)}
                  onToggle={() => onToggleItem(item.id)}
                  onEdit={() => onEditItem(item)}
                  onDelete={() => onDeleteItem(item.id)}
                  onEditVariant={(v) => onEditVariant(v, item.id)}
                  onDeleteVariant={onDeleteVariant}
                  onAdjustStock={(v) => onAdjustStock(v, item.name)}
                  onAddVariant={() => onAddVariant(item.id)}
                />
              ))}

              {/* Add item button */}
              <button
                onClick={onAddItem}
                className="w-full flex items-center justify-center gap-2 p-3 text-brand font-medium hover:bg-brand/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Item Row Component
// ============================================================================

function ItemRow({
  item,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onEditVariant,
  onDeleteVariant,
  onAdjustStock,
  onAddVariant,
}: {
  item: MerchandiseItem;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onEditVariant: (variant: MerchandiseVariant) => void;
  onDeleteVariant: (id: number) => void;
  onAdjustStock: (variant: MerchandiseVariant) => void;
  onAddVariant: () => void;
}) {
  const hasStockIssues = item.variants.some(v => v.track_inventory && (!v.in_stock || v.low_stock));

  return (
    <div className="border-b border-border-default last:border-b-0">
      {/* Item header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface/50 transition-colors"
      >
        <div className="w-6" />
        {item.has_variants ? (
          expanded ? (
            <ChevronDown className="w-4 h-4 text-text-muted" />
          ) : (
            <ChevronRight className="w-4 h-4 text-text-muted" />
          )
        ) : (
          <div className="w-4" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-text-primary truncate">{item.name}</span>
            {!item.available && (
              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                Hidden
              </span>
            )}
            {hasStockIssues && (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <p className="text-sm text-text-secondary">
            {item.has_variants
              ? `${item.variants.length} variants`
              : item.base_price
              ? `$${item.base_price.toFixed(2)}`
              : 'No price set'}
          </p>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-surface rounded transition-colors"
            title="Edit item"
          >
            <Pencil className="w-4 h-4 text-text-muted" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-50 rounded transition-colors"
            title="Delete item"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </button>

      {/* Variants */}
      <AnimatePresence>
        {expanded && item.has_variants && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-surface/30"
          >
            <div className="pl-16 pr-4 py-2 space-y-1">
              {item.variants.map(variant => (
                <VariantRow
                  key={variant.id}
                  variant={variant}
                  onEdit={() => onEditVariant(variant)}
                  onDelete={() => onDeleteVariant(variant.id)}
                  onAdjustStock={() => onAdjustStock(variant)}
                />
              ))}
              <button
                onClick={onAddVariant}
                className="flex items-center gap-1 text-sm text-brand font-medium hover:underline py-1"
              >
                <Plus className="w-3 h-3" />
                Add Variant
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Variant Row Component
// ============================================================================

function VariantRow({
  variant,
  onEdit,
  onDelete,
  onAdjustStock,
}: {
  variant: MerchandiseVariant;
  onEdit: () => void;
  onDelete: () => void;
  onAdjustStock: () => void;
}) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 bg-white rounded-lg">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">{variant.name}</span>
          {!variant.available && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
              Hidden
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <span>${variant.price.toFixed(2)}</span>
          {variant.track_inventory && (
            <span
              className={`flex items-center gap-1 ${
                !variant.in_stock
                  ? 'text-red-600'
                  : variant.low_stock
                  ? 'text-amber-600'
                  : 'text-green-600'
              }`}
            >
              <Package className="w-3 h-3" />
              {variant.stock_quantity} in stock
            </span>
          )}
          {variant.sku && <span className="text-text-muted">SKU: {variant.sku}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {variant.track_inventory && (
          <button
            onClick={onAdjustStock}
            className="px-2 py-1 text-xs font-medium text-brand bg-brand/10 rounded hover:bg-brand/20 transition-colors"
          >
            Adjust
          </button>
        )}
        <button
          onClick={onEdit}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          title="Edit variant"
        >
          <Pencil className="w-3.5 h-3.5 text-text-muted" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 hover:bg-red-50 rounded transition-colors"
          title="Delete variant"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Modal Components
// ============================================================================

function ModalWrapper({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-border-default">
          <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-lg transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function CategoryModal({
  category,
  onClose,
  onSave,
}: {
  category: MerchandiseCategory;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || '');
  const [active, setActive] = useState(category.active);
  const [saving, setSaving] = useState(false);

  const isNew = category.id === 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      if (isNew) {
        await adminApi.createMerchandiseCategory({ name, description: description || null, active });
      } else {
        await adminApi.updateMerchandiseCategory(category.id, { name, description: description || null, active });
      }
      onSave();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title={isNew ? 'New Category' : 'Edit Category'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand"
            placeholder="e.g., Cookie Boxes"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand resize-none"
            rows={3}
            placeholder="Optional description"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={e => setActive(e.target.checked)}
            className="w-4 h-4 text-brand rounded border-border-default focus:ring-brand"
          />
          <span className="text-sm text-text-primary">Active (visible to customers)</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border-default rounded-lg text-text-primary hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

function ItemModal({
  item,
  categoryId,
  onClose,
  onSave,
}: {
  item?: MerchandiseItem;
  categoryId: number;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState(item?.description || '');
  const [basePrice, setBasePrice] = useState(item?.base_price?.toString() || '');
  const [imageUrl, setImageUrl] = useState(item?.image_url || '');
  const [available, setAvailable] = useState(item?.available ?? true);
  const [saving, setSaving] = useState(false);

  const isNew = !item;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const data = {
        name,
        description: description || null,
        base_price: basePrice ? parseFloat(basePrice) : null,
        image_url: imageUrl || null,
        available,
      };

      if (isNew) {
        await adminApi.createMerchandiseItem(categoryId, data);
      } else {
        await adminApi.updateMerchandiseItem(item.id, data);
      }
      onSave();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title={isNew ? 'New Item' : 'Edit Item'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand"
            placeholder="e.g., Classic Latte Stone"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand resize-none"
            rows={2}
            placeholder="Optional description"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Base Price (leave empty if using variants)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={basePrice}
            onChange={e => setBasePrice(e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={e => setImageUrl(e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand"
            placeholder="https://..."
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={available}
            onChange={e => setAvailable(e.target.checked)}
            className="w-4 h-4 text-brand rounded border-border-default focus:ring-brand"
          />
          <span className="text-sm text-text-primary">Available (visible to customers)</span>
        </label>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border-default rounded-lg text-text-primary hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

function VariantModal({
  variant,
  itemId,
  onClose,
  onSave,
}: {
  variant?: MerchandiseVariant;
  itemId: number;
  onClose: () => void;
  onSave: () => void;
}) {
  const [name, setName] = useState(variant?.name || '');
  const [price, setPrice] = useState(variant?.price?.toString() || '');
  const [sku, setSku] = useState(variant?.sku || '');
  const [available, setAvailable] = useState(variant?.available ?? true);
  const [trackInventory, setTrackInventory] = useState(variant?.track_inventory ?? true);
  const [stockQuantity, setStockQuantity] = useState(variant?.stock_quantity?.toString() || '0');
  const [lowStockThreshold, setLowStockThreshold] = useState(variant?.low_stock_threshold?.toString() || '5');
  const [saving, setSaving] = useState(false);

  const isNew = !variant;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    setSaving(true);
    try {
      const data = {
        name,
        price: parseFloat(price),
        sku: sku || null,
        available,
        track_inventory: trackInventory,
        stock_quantity: parseInt(stockQuantity) || 0,
        low_stock_threshold: parseInt(lowStockThreshold) || 5,
      };

      if (isNew) {
        await adminApi.createMerchandiseVariant(itemId, data);
      } else {
        await adminApi.updateMerchandiseVariant(variant.id, data);
      }
      onSave();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title={isNew ? 'New Variant' : 'Edit Variant'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand"
              placeholder="e.g., Box of 6"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={e => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">SKU (optional)</label>
          <input
            type="text"
            value={sku}
            onChange={e => setSku(e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand"
            placeholder="e.g., LSC-6PK"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={available}
            onChange={e => setAvailable(e.target.checked)}
            className="w-4 h-4 text-brand rounded border-border-default focus:ring-brand"
          />
          <span className="text-sm text-text-primary">Available (visible to customers)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={trackInventory}
            onChange={e => setTrackInventory(e.target.checked)}
            className="w-4 h-4 text-brand rounded border-border-default focus:ring-brand"
          />
          <span className="text-sm text-text-primary">Track inventory</span>
        </label>
        {trackInventory && (
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Stock</label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={e => setStockQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Low Stock Alert</label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(e.target.value)}
                className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand"
              />
            </div>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border-default rounded-lg text-text-primary hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !name.trim() || !price}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isNew ? 'Create' : 'Save'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}

function StockAdjustmentModal({
  variant,
  itemName,
  onClose,
  onSave,
}: {
  variant: MerchandiseVariant;
  itemName: string;
  onClose: () => void;
  onSave: () => void;
}) {
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('restock');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const adjustmentNum = parseInt(adjustment) || 0;
  const newStock = variant.stock_quantity + adjustmentNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustmentNum === 0) return;

    setSaving(true);
    try {
      await adminApi.adjustMerchandiseStock(variant.id, adjustmentNum, reason, notes || undefined);
      onSave();
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalWrapper title="Adjust Stock" onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="text-center py-4 bg-surface rounded-lg">
          <p className="text-sm text-text-secondary">{itemName}</p>
          <p className="text-lg font-semibold text-text-primary">{variant.name}</p>
          <p className="text-3xl font-bold text-brand mt-2">{variant.stock_quantity}</p>
          <p className="text-sm text-text-muted">Current stock</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Adjustment (+/-)
          </label>
          <input
            type="number"
            value={adjustment}
            onChange={e => setAdjustment(e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand text-center text-xl"
            placeholder="0"
            autoFocus
          />
          {adjustmentNum !== 0 && (
            <p className={`text-sm mt-1 text-center ${newStock < 0 ? 'text-red-600' : 'text-green-600'}`}>
              New stock: {newStock}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Reason</label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand"
          >
            <option value="restock">Restock</option>
            <option value="damaged">Damaged</option>
            <option value="inventory_count">Inventory Count</option>
            <option value="returned">Returned</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-border-default rounded-lg focus:outline-none focus:border-brand"
            placeholder="Additional notes"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border-default rounded-lg text-text-primary hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || adjustmentNum === 0 || newStock < 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Adjust
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
