import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Check, Circle } from 'lucide-react';
import type { MenuItem, ModifierGroup, Modifier, SelectedModifier } from '../../types';
import { formatPrice, calculateItemTotal } from '../../utils/price';
import { Button } from '../ui/Button';
import { useCartStore } from '../../stores/cartStore';

interface ItemDetailSheetProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function ItemDetailSheet({ item, onClose }: ItemDetailSheetProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Map<number, Set<number>>>(new Map());
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Reset state when item changes
  useEffect(() => {
    if (item) {
      setQuantity(1);
      setSpecialInstructions('');
      // Pre-select defaults
      const defaults = new Map<number, Set<number>>();
      item.modifier_groups.forEach((group) => {
        const defaultMods = group.modifiers
          .filter((m) => m.default_selected)
          .map((m) => m.id);
        if (defaultMods.length > 0) {
          defaults.set(group.id, new Set(defaultMods));
        }
      });
      setSelections(defaults);
    }
  }, [item]);

  const toggleModifier = useCallback(
    (group: ModifierGroup, modifier: Modifier) => {
      setSelections((prev) => {
        const next = new Map(prev);
        const current = new Set(next.get(group.id) || []);

        if (group.max_select === 1) {
          // Radio behavior
          current.clear();
          current.add(modifier.id);
        } else {
          // Checkbox behavior
          if (current.has(modifier.id)) {
            current.delete(modifier.id);
          } else {
            // Check max
            if (group.max_select && current.size >= group.max_select) {
              return prev;
            }
            current.add(modifier.id);
          }
        }

        next.set(group.id, current);
        return next;
      });
    },
    []
  );

  const getSelectedModifiers = useCallback((): SelectedModifier[] => {
    if (!item) return [];
    const result: SelectedModifier[] = [];
    item.modifier_groups.forEach((group) => {
      const selected = selections.get(group.id);
      if (selected) {
        group.modifiers.forEach((mod) => {
          if (selected.has(mod.id)) {
            result.push({ groupId: group.id, groupName: group.name, modifier: mod });
          }
        });
      }
    });
    return result;
  }, [item, selections]);

  const isValid = useCallback((): boolean => {
    if (!item) return false;
    return item.modifier_groups.every((group) => {
      if (!group.required) return true;
      const selected = selections.get(group.id);
      const count = selected?.size || 0;
      return count >= group.min_select && (!group.max_select || count <= group.max_select);
    });
  }, [item, selections]);

  const totalPrice = item
    ? calculateItemTotal(
        item.base_price,
        getSelectedModifiers().map((sm) => sm.modifier),
        quantity
      )
    : 0;

  const handleAdd = () => {
    if (!item || !isValid()) return;
    addItem(item, getSelectedModifiers(), quantity, specialInstructions);
    onClose();
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-surface-card rounded-t-[var(--radius-xl)] max-h-[90vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-4 pb-0">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-semibold text-text-primary">{item.name}</h2>
                {item.description && (
                  <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
                )}
                <p className="mt-1 text-sm font-medium text-brand">
                  Starting at {formatPrice(item.base_price)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 -m-2 rounded-full hover:bg-surface-elevated transition-colors touch-target"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Modifier Groups */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              {item.modifier_groups.map((group) => (
                <ModifierGroupSection
                  key={group.id}
                  group={group}
                  selections={selections.get(group.id) || new Set()}
                  onToggle={(mod) => toggleModifier(group, mod)}
                />
              ))}

              {/* Special Instructions */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Special Instructions
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-border-default rounded-[var(--radius-md)] bg-surface resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                />
              </div>
            </div>

            {/* Footer with quantity and add button */}
            <div className="p-4 border-t border-border-default bg-surface-card">
              <div className="flex items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center gap-3 bg-surface-elevated rounded-[var(--radius-lg)] p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-[var(--radius-md)] hover:bg-surface-card transition-colors touch-target"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-[var(--radius-md)] hover:bg-surface-card transition-colors touch-target"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart */}
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={handleAdd}
                  disabled={!isValid()}
                >
                  Add to Order &middot; {formatPrice(totalPrice)}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// Modifier Group Component
// ============================================================================

interface ModifierGroupSectionProps {
  group: ModifierGroup;
  selections: Set<number>;
  onToggle: (modifier: Modifier) => void;
}

function ModifierGroupSection({ group, selections, onToggle }: ModifierGroupSectionProps) {
  const isRadio = group.max_select === 1;
  const selectedCount = selections.size;
  const isComplete = group.required
    ? selectedCount >= group.min_select
    : true;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-primary">{group.name}</h3>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            group.required
              ? isComplete
                ? 'bg-green-50 text-green-700'
                : 'bg-amber-50 text-amber-700'
              : 'bg-surface-elevated text-text-muted'
          }`}
        >
          {group.selection_label}
        </span>
      </div>

      <div className="space-y-0.5">
        {group.modifiers.map((modifier) => {
          const isSelected = selections.has(modifier.id);
          return (
            <motion.button
              key={modifier.id}
              onClick={() => onToggle(modifier)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]
                transition-colors duration-[var(--duration-fast)] touch-target text-left
                ${isSelected ? 'bg-brand/5 border border-brand/20' : 'hover:bg-surface-elevated border border-transparent'}
              `}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selection indicator */}
              <div className="shrink-0">
                {isRadio ? (
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-brand bg-brand' : 'border-text-muted'
                    }`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-white"
                      />
                    )}
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                      isSelected ? 'border-brand bg-brand' : 'border-text-muted'
                    }`}
                  >
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {/* Label */}
              <span className="flex-1 text-sm text-text-primary">{modifier.name}</span>

              {/* Price */}
              {modifier.display_price && (
                <span className="text-sm text-text-secondary">{modifier.display_price}</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
