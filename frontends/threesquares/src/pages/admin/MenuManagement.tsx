import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Check,
  X,
  Package,
  Layers,
  Settings2,
} from 'lucide-react';
import type { AdminCategory, AdminMenuItem, AdminModifierGroup, AdminModifier } from '../../types/admin';
import { adminApi } from '../../api/adminClient';
import { formatPrice } from '../../utils/price';
import { Skeleton } from '../../components/ui/Skeleton';

// ============================================================================
// Main Component
// ============================================================================

export function MenuManagement() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const fetchCategories = useCallback(async () => {
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleCat = (id: number) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Category actions ──────────────────────────────────────────────
  const handleAddCategory = async () => {
    const name = window.prompt('Category name:');
    if (!name?.trim()) return;
    try {
      await adminApi.createCategory({ name: name.trim() });
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const handleRenameCategory = async (cat: AdminCategory) => {
    const name = window.prompt('New name:', cat.name);
    if (!name?.trim() || name.trim() === cat.name) return;
    try {
      await adminApi.updateCategory(cat.id, { name: name.trim() });
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const handleToggleCategoryActive = async (cat: AdminCategory) => {
    try {
      await adminApi.updateCategory(cat.id, { active: !cat.active });
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (cat: AdminCategory) => {
    if (!window.confirm(`Delete "${cat.name}" and all its items? This cannot be undone.`)) return;
    try {
      await adminApi.deleteCategory(cat.id);
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  const handleMoveCategory = async (catIndex: number, direction: 'up' | 'down') => {
    const newCats = [...categories];
    const swapIdx = direction === 'up' ? catIndex - 1 : catIndex + 1;
    if (swapIdx < 0 || swapIdx >= newCats.length) return;
    [newCats[catIndex], newCats[swapIdx]] = [newCats[swapIdx], newCats[catIndex]];
    setCategories(newCats);
    try {
      await adminApi.reorderCategories(newCats.map((c) => c.id));
    } catch {
      fetchCategories();
    }
  };

  // ── Item actions ──────────────────────────────────────────────────
  const handleAddItem = async (categoryId: number) => {
    const name = window.prompt('Item name:');
    if (!name?.trim()) return;
    const priceStr = window.prompt('Price (e.g. 5.50):', '0.00');
    const price = parseFloat(priceStr || '0');
    if (isNaN(price)) return;
    try {
      await adminApi.createMenuItem(categoryId, { name: name.trim(), base_price: price });
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create item');
    }
  };

  const handleDeleteItem = async (item: AdminMenuItem) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await adminApi.deleteMenuItem(item.id);
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const handleToggleAvailable = async (item: AdminMenuItem) => {
    try {
      await adminApi.updateMenuItem(item.id, { available: !item.available });
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  const handleMoveItem = async (categoryId: number, items: AdminMenuItem[], itemIndex: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const swapIdx = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (swapIdx < 0 || swapIdx >= newItems.length) return;
    [newItems[itemIndex], newItems[swapIdx]] = [newItems[swapIdx], newItems[itemIndex]];
    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, items: newItems } : c))
    );
    try {
      await adminApi.reorderMenuItems(categoryId, newItems.map((i) => i.id));
    } catch {
      fetchCategories();
    }
  };

  // ── Modifier group actions ────────────────────────────────────────
  const handleAddModifierGroup = async (menuItemId: number) => {
    const name = window.prompt('Modifier group name (e.g. Size, Temperature):');
    if (!name?.trim()) return;
    try {
      await adminApi.createModifierGroup(menuItemId, {
        name: name.trim(),
        required: false,
        min_select: 0,
        max_select: null,
      });
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create modifier group');
    }
  };

  const handleDeleteModifierGroup = async (group: AdminModifierGroup) => {
    if (!window.confirm(`Delete modifier group "${group.name}"?`)) return;
    try {
      await adminApi.deleteModifierGroup(group.id);
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete modifier group');
    }
  };

  // ── Modifier actions ──────────────────────────────────────────────
  const handleAddModifier = async (groupId: number) => {
    const name = window.prompt('Modifier name:');
    if (!name?.trim()) return;
    const priceStr = window.prompt('Price adjustment (e.g. 0.50, 0 for free):', '0');
    const price = parseFloat(priceStr || '0');
    if (isNaN(price)) return;
    try {
      await adminApi.createModifier(groupId, { name: name.trim(), price_adjustment: price });
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create modifier');
    }
  };

  const handleDeleteModifier = async (mod: AdminModifier) => {
    if (!window.confirm(`Delete modifier "${mod.name}"?`)) return;
    try {
      await adminApi.deleteModifier(mod.id);
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete modifier');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-[var(--radius-lg)] border border-border-default space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Menu</h2>
          <p className="text-sm text-text-secondary mt-0.5">
            {categories.length} {categories.length === 1 ? 'category' : 'categories'}
          </p>
        </div>
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-[var(--radius-md)] font-medium text-sm transition-all hover:opacity-90 active:opacity-80 touch-target"
        >
          <Plus className="w-4 h-4" />
          Category
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <AnimatePresence>
          {categories.map((cat, catIdx) => (
            <motion.div
              key={cat.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="border border-border-default rounded-[var(--radius-lg)] overflow-hidden"
            >
              {/* Category Header */}
              <div className="flex items-center gap-2 px-3 py-3 bg-surface-elevated/50">
                <GripVertical className="w-4 h-4 text-text-muted shrink-0" />
                <button
                  onClick={() => toggleCat(cat.id)}
                  className="flex-1 flex items-center gap-2 text-left touch-target"
                >
                  {expandedCats.has(cat.id) ? (
                    <ChevronDown className="w-4 h-4 text-text-muted" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  )}
                  <span className="font-semibold text-text-primary">{cat.name}</span>
                  <span className="text-xs text-text-muted">
                    {cat.items_count} {cat.items_count === 1 ? 'item' : 'items'}
                  </span>
                  {!cat.active && (
                    <span className="text-xs bg-error/15 text-error px-2 py-0.5 rounded-full font-medium">
                      Hidden
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    onClick={() => handleMoveCategory(catIdx, 'up')}
                    disabled={catIdx === 0}
                    className="p-1.5 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
                    aria-label="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoveCategory(catIdx, 'down')}
                    disabled={catIdx === categories.length - 1}
                    className="p-1.5 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
                    aria-label="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleCategoryActive(cat)}
                    className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
                    aria-label={cat.active ? 'Hide category' : 'Show category'}
                  >
                    {cat.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleRenameCategory(cat)}
                    className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
                    aria-label="Rename"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-1.5 text-text-muted hover:text-error transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Category Items */}
              <AnimatePresence>
                {expandedCats.has(cat.id) && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="divide-y divide-border-default/50">
                      {cat.items.map((item, itemIdx) => (
                        <MenuItemRow
                          key={item.id}
                          item={item}
                          expanded={expandedItems.has(item.id)}
                          onToggle={() => toggleItem(item.id)}
                          onToggleAvailable={() => handleToggleAvailable(item)}
                          onDelete={() => handleDeleteItem(item)}
                          onMoveUp={() => handleMoveItem(cat.id, cat.items, itemIdx, 'up')}
                          onMoveDown={() => handleMoveItem(cat.id, cat.items, itemIdx, 'down')}
                          isFirst={itemIdx === 0}
                          isLast={itemIdx === cat.items.length - 1}
                          onRefresh={fetchCategories}
                          onAddModifierGroup={() => handleAddModifierGroup(item.id)}
                          onDeleteModifierGroup={handleDeleteModifierGroup}
                          onAddModifier={handleAddModifier}
                          onDeleteModifier={handleDeleteModifier}
                        />
                      ))}

                      {/* Add Item Button */}
                      <div className="p-3">
                        <button
                          onClick={() => handleAddItem(cat.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-border-default text-text-secondary rounded-[var(--radius-md)] text-sm font-medium hover:border-brand hover:text-brand transition-colors touch-target"
                        >
                          <Plus className="w-4 h-4" />
                          Add Item
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// Menu Item Row
// ============================================================================

interface MenuItemRowProps {
  item: AdminMenuItem;
  expanded: boolean;
  onToggle: () => void;
  onToggleAvailable: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  onRefresh: () => void;
  onAddModifierGroup: () => void;
  onDeleteModifierGroup: (group: AdminModifierGroup) => void;
  onAddModifier: (groupId: number) => void;
  onDeleteModifier: (mod: AdminModifier) => void;
}

function MenuItemRow({
  item,
  expanded,
  onToggle,
  onToggleAvailable,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onRefresh,
  onAddModifierGroup,
  onDeleteModifierGroup,
  onAddModifier,
  onDeleteModifier,
}: MenuItemRowProps) {
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [priceValue, setPriceValue] = useState(item.base_price.toFixed(2));
  const [nameValue, setNameValue] = useState(item.name);
  const [editingImageUrl, setEditingImageUrl] = useState(false);
  const [imageUrlValue, setImageUrlValue] = useState(item.image_url || '');

  const savePrice = async () => {
    const price = parseFloat(priceValue);
    if (isNaN(price) || price < 0) return;
    try {
      await adminApi.updateMenuItem(item.id, { base_price: price });
      setEditingPrice(false);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update price');
    }
  };

  const saveName = async () => {
    if (!nameValue.trim()) return;
    try {
      await adminApi.updateMenuItem(item.id, { name: nameValue.trim() });
      setEditingName(false);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update name');
    }
  };

  const saveImageUrl = async () => {
    try {
      await adminApi.updateMenuItem(item.id, { image_url: imageUrlValue.trim() || null });
      setEditingImageUrl(false);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update image');
    }
  };

  return (
    <div className={`${!item.available ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2 px-3 py-2.5 pl-8">
        <GripVertical className="w-3.5 h-3.5 text-text-muted shrink-0" />

        <button
          onClick={onToggle}
          className="flex-1 flex items-center gap-2 text-left min-w-0 touch-target"
        >
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0" />
          )}

          {/* Name (inline editable) */}
          {editingName ? (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                className="w-40 px-2 py-0.5 text-sm bg-surface-elevated border border-border-default rounded focus:outline-none focus:border-brand"
                autoFocus
              />
              <button onClick={saveName} className="p-1 text-success"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => setEditingName(false)} className="p-1 text-text-muted"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <span
              className="text-sm font-medium text-text-primary truncate cursor-text"
              onDoubleClick={(e) => { e.stopPropagation(); setEditingName(true); }}
            >
              {item.name}
            </span>
          )}

          {item.modifier_groups_count > 0 && (
            <span className="text-xs text-text-muted shrink-0">
              {item.modifier_groups_count} {item.modifier_groups_count === 1 ? 'group' : 'groups'}
            </span>
          )}
        </button>

        {/* Inline price edit */}
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          {editingPrice ? (
            <div className="flex items-center gap-1">
              <span className="text-sm text-text-muted">$</span>
              <input
                type="text"
                value={priceValue}
                onChange={(e) => setPriceValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') savePrice(); if (e.key === 'Escape') setEditingPrice(false); }}
                className="w-16 px-2 py-0.5 text-sm text-right bg-surface-elevated border border-border-default rounded focus:outline-none focus:border-brand"
                autoFocus
              />
              <button onClick={savePrice} className="p-1 text-success"><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => setEditingPrice(false)} className="p-1 text-text-muted"><X className="w-3.5 h-3.5" /></button>
            </div>
          ) : (
            <button
              onClick={() => setEditingPrice(true)}
              className="text-sm font-medium text-text-primary hover:text-brand transition-colors px-1"
            >
              {formatPrice(item.base_price)}
            </button>
          )}
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={onMoveUp} disabled={isFirst} className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
          <button onClick={onMoveDown} disabled={isLast} className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
          <button onClick={onToggleAvailable} className="p-1 text-text-muted hover:text-text-primary">
            {item.available ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={onDelete} className="p-1 text-text-muted hover:text-error"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      {/* Expanded: modifier groups, image URL */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pl-12 space-y-3">
              {/* Image URL */}
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-3.5 h-3.5 text-text-muted shrink-0" />
                {editingImageUrl ? (
                  <div className="flex-1 flex items-center gap-1">
                    <input
                      type="text"
                      value={imageUrlValue}
                      onChange={(e) => setImageUrlValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveImageUrl(); if (e.key === 'Escape') setEditingImageUrl(false); }}
                      placeholder="https://..."
                      className="flex-1 px-2 py-0.5 text-sm bg-surface-elevated border border-border-default rounded focus:outline-none focus:border-brand"
                      autoFocus
                    />
                    <button onClick={saveImageUrl} className="p-1 text-success"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditingImageUrl(false)} className="p-1 text-text-muted"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingImageUrl(true)}
                    className="text-text-secondary hover:text-brand transition-colors truncate"
                  >
                    {item.image_url || 'Add image URL'}
                  </button>
                )}
              </div>

              {/* Modifier Groups */}
              <div className="space-y-2">
                {item.modifier_groups.map((group) => (
                  <ModifierGroupSection
                    key={group.id}
                    group={group}
                    onDelete={() => onDeleteModifierGroup(group)}
                    onAddModifier={() => onAddModifier(group.id)}
                    onDeleteModifier={onDeleteModifier}
                    onRefresh={onRefresh}
                  />
                ))}
                <button
                  onClick={onAddModifierGroup}
                  className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add modifier group
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Modifier Group Section
// ============================================================================

interface ModifierGroupSectionProps {
  group: AdminModifierGroup;
  onDelete: () => void;
  onAddModifier: () => void;
  onDeleteModifier: (mod: AdminModifier) => void;
  onRefresh: () => void;
}

function ModifierGroupSection({ group, onDelete, onAddModifier, onDeleteModifier, onRefresh }: ModifierGroupSectionProps) {
  const [editingGroup, setEditingGroup] = useState(false);
  const [groupName, setGroupName] = useState(group.name);
  const [required, setRequired] = useState(group.required);
  const [minSelect, setMinSelect] = useState(String(group.min_select));
  const [maxSelect, setMaxSelect] = useState(group.max_select ? String(group.max_select) : '');

  const saveGroup = async () => {
    try {
      await adminApi.updateModifierGroup(group.id, {
        name: groupName.trim() || group.name,
        required,
        min_select: parseInt(minSelect) || 0,
        max_select: maxSelect ? parseInt(maxSelect) : null,
      });
      setEditingGroup(false);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update group');
    }
  };

  return (
    <div className="bg-surface-elevated/50 rounded-[var(--radius-md)] p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-sm font-medium text-text-primary">{group.name}</span>
          {group.required && (
            <span className="text-xs bg-brand/15 text-brand px-1.5 py-0.5 rounded font-medium">Required</span>
          )}
          <span className="text-xs text-text-muted">
            ({group.min_select}-{group.max_select || 'any'})
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setEditingGroup(!editingGroup)} className="p-1 text-text-muted hover:text-text-primary">
            <Settings2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1 text-text-muted hover:text-error">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Group settings */}
      <AnimatePresence>
        {editingGroup && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-2"
          >
            <div className="grid grid-cols-2 gap-2 p-2 bg-surface-card rounded border border-border-default">
              <div>
                <label className="text-xs text-text-muted">Name</label>
                <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-surface-elevated border border-border-default rounded focus:outline-none focus:border-brand" />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)}
                    className="accent-[var(--brand-primary)]" />
                  Required
                </label>
              </div>
              <div>
                <label className="text-xs text-text-muted">Min select</label>
                <input type="number" value={minSelect} onChange={(e) => setMinSelect(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-surface-elevated border border-border-default rounded focus:outline-none focus:border-brand" />
              </div>
              <div>
                <label className="text-xs text-text-muted">Max select</label>
                <input type="number" value={maxSelect} onChange={(e) => setMaxSelect(e.target.value)} placeholder="any"
                  className="w-full px-2 py-1 text-sm bg-surface-elevated border border-border-default rounded focus:outline-none focus:border-brand" />
              </div>
              <div className="col-span-2 flex justify-end gap-2 mt-1">
                <button onClick={() => setEditingGroup(false)} className="px-3 py-1 text-sm text-text-secondary hover:text-text-primary">Cancel</button>
                <button onClick={saveGroup} className="px-3 py-1 text-sm bg-brand text-white rounded font-medium hover:opacity-90">Save</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modifiers */}
      <div className="space-y-1 pl-2">
        {group.modifiers.map((mod) => (
          <ModifierRow key={mod.id} modifier={mod} onDelete={() => onDeleteModifier(mod)} onRefresh={onRefresh} />
        ))}
        <button
          onClick={onAddModifier}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-brand transition-colors pt-1"
        >
          <Plus className="w-3 h-3" />
          Add modifier
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Modifier Row
// ============================================================================

interface ModifierRowProps {
  modifier: AdminModifier;
  onDelete: () => void;
  onRefresh: () => void;
}

function ModifierRow({ modifier, onDelete, onRefresh }: ModifierRowProps) {
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceVal, setPriceVal] = useState(modifier.price_adjustment.toFixed(2));

  const savePrice = async () => {
    const price = parseFloat(priceVal);
    if (isNaN(price)) return;
    try {
      await adminApi.updateModifier(modifier.id, { price_adjustment: price });
      setEditingPrice(false);
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update modifier');
    }
  };

  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-text-secondary">{modifier.name}</span>
      <div className="flex items-center gap-1">
        {editingPrice ? (
          <div className="flex items-center gap-1">
            <input
              type="text"
              value={priceVal}
              onChange={(e) => setPriceVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') savePrice(); if (e.key === 'Escape') setEditingPrice(false); }}
              className="w-14 px-1 py-0.5 text-xs text-right bg-surface-card border border-border-default rounded focus:outline-none focus:border-brand"
              autoFocus
            />
            <button onClick={savePrice} className="p-0.5 text-success"><Check className="w-3 h-3" /></button>
            <button onClick={() => setEditingPrice(false)} className="p-0.5 text-text-muted"><X className="w-3 h-3" /></button>
          </div>
        ) : (
          <button
            onClick={() => setEditingPrice(true)}
            className="text-xs text-text-muted hover:text-brand transition-colors"
          >
            {modifier.price_adjustment !== 0
              ? `${modifier.price_adjustment > 0 ? '+' : ''}${formatPrice(modifier.price_adjustment)}`
              : 'Free'}
          </button>
        )}
        <button onClick={onDelete} className="p-0.5 text-text-muted hover:text-error">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
