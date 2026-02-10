import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { X, Minus, Plus, Check, ChevronDown, Asterisk } from 'lucide-react';
import type { MenuItem, ModifierGroup, Modifier, SelectedModifier } from '../../types';
import { formatPrice, calculateItemTotal } from '../../utils/price';
import { Button } from '../ui/Button';
import { useCartStore } from '../../stores/cartStore';
import { toast } from '../ui/Toast';
import { springs, backdropVariants } from '../../utils/motion';

interface ItemDetailSheetProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function ItemDetailSheet({ item, onClose }: ItemDetailSheetProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Map<number, Set<number>>>(new Map());
  const [specialInstructions, setSpecialInstructions] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  // Drag-to-dismiss
  const sheetY = useMotionValue(0);
  const backdropOpacity = useTransform(sheetY, [0, 300], [1, 0]);
  const controls = useAnimation();

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
      sheetY.set(0);
      controls.start({ y: 0 });
    }
  }, [item, controls, sheetY]);

  // Lock body scroll when open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [item]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > 150) {
      controls.start({ y: '100%' }).then(onClose);
    } else {
      controls.start({ y: 0 });
    }
  };

  const toggleModifier = useCallback(
    (group: ModifierGroup, modifier: Modifier) => {
      setSelections((prev) => {
        const next = new Map(prev);
        const current = new Set(next.get(group.id) || []);

        if (group.max_select === 1) {
          current.clear();
          current.add(modifier.id);
        } else {
          if (current.has(modifier.id)) {
            current.delete(modifier.id);
          } else {
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

  const unfulfilledRequired = item?.modifier_groups
    .filter((g) => g.required)
    .filter((g) => {
      const count = selections.get(g.id)?.size || 0;
      return count < g.min_select;
    }) || [];

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
    toast.success(`${item.name} added to order`);
    onClose();
  };

  return (
    <AnimatePresence>
      {item && (
        <>
          {/* Backdrop */}
          <motion.div
            key="item-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ opacity: backdropOpacity }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            key="item-sheet"
            initial={{ y: '100%' }}
            animate={controls}
            exit={{ y: '100%' }}
            transition={springs.sheet}
            style={{ y: sheetY }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed inset-x-0 bottom-0 z-50 bg-surface-card rounded-t-[var(--radius-xl)] max-h-[92vh] flex flex-col shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={`Customize ${item.name}`}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-text-muted/30" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-4 pb-3">
              <div className="flex-1 pr-4">
                <h2 className="text-xl font-bold text-text-primary leading-tight">
                  {item.name}
                </h2>
                {item.description && (
                  <p className="mt-1.5 text-sm text-text-secondary leading-relaxed">
                    {item.description}
                  </p>
                )}
                <p className="mt-1.5 text-sm font-semibold text-brand">
                  Starting at {formatPrice(item.base_price)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 -m-1 rounded-full hover:bg-surface-elevated transition-colors touch-target"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 space-y-5"
            >
              {item.modifier_groups.map((group, index) => (
                <ModifierGroupSection
                  key={group.id}
                  group={group}
                  selections={selections.get(group.id) || new Set()}
                  onToggle={(mod) => toggleModifier(group, mod)}
                  index={index}
                />
              ))}

              {/* Special Instructions */}
              <div>
                <label
                  htmlFor="item-instructions"
                  className="block text-sm font-semibold text-text-primary mb-2"
                >
                  Special Instructions
                </label>
                <textarea
                  id="item-instructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests..."
                  rows={2}
                  className="w-full px-3 py-2.5 text-sm border border-border-default rounded-md bg-surface resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                />
              </div>
            </div>

            {/* Footer with validation hint, quantity, and add button */}
            <div className="border-t border-border-default bg-surface-card px-4 py-3 space-y-2">
              {/* Validation message */}
              <AnimatePresence>
                {unfulfilledRequired.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-warning flex items-center gap-1"
                  >
                    <Asterisk className="w-3 h-3 shrink-0" />
                    Please select: {unfulfilledRequired.map((g) => g.name).join(', ')}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center gap-2 bg-surface-elevated rounded-lg p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-md hover:bg-surface-card transition-colors touch-target"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold tabular-nums" aria-label={`Quantity: ${quantity}`}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 rounded-md hover:bg-surface-card transition-colors touch-target"
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
                  Add to Order · {formatPrice(totalPrice)}
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
  index: number;
}

function ModifierGroupSection({ group, selections, onToggle, index }: ModifierGroupSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const isRadio = group.max_select === 1;
  const selectedCount = selections.size;
  const isComplete = group.required
    ? selectedCount >= group.min_select
    : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Group Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between mb-2 group touch-target"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-text-primary">
            {group.name}
          </h3>
          {group.required && (
            <span className="flex items-center gap-0.5">
              <Asterisk className="w-3 h-3 text-error" />
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
              group.required
                ? isComplete
                  ? 'bg-success/10 text-success'
                  : 'bg-warning/10 text-warning'
                : 'bg-surface-elevated text-text-muted'
            }`}
          >
            {group.selection_label}
          </span>
          <motion.div
            animate={{ rotate: collapsed ? -90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </motion.div>
        </div>
      </button>

      {/* Modifiers */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5">
              {group.modifiers.map((modifier) => {
                const isSelected = selections.has(modifier.id);
                return (
                  <motion.button
                    key={modifier.id}
                    onClick={() => onToggle(modifier)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-3 rounded-md
                      transition-all duration-(--duration-fast) touch-target text-left
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30
                      ${isSelected
                        ? 'bg-brand/5 border border-brand/20'
                        : 'hover:bg-surface-elevated border border-transparent'
                      }
                    `}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                    role={isRadio ? 'radio' : 'checkbox'}
                    aria-checked={isSelected}
                    aria-label={`${modifier.name}${modifier.display_price ? `, ${modifier.display_price}` : ''}`}
                  >
                    {/* Selection indicator */}
                    <div className="shrink-0">
                      {isRadio ? (
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                            isSelected ? 'border-brand bg-brand' : 'border-text-muted/50'
                          }`}
                        >
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: 0.15 }}
                                className="w-2 h-2 rounded-full bg-white"
                              />
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-[4px] flex items-center justify-center border-2 transition-all duration-150 ${
                            isSelected ? 'border-brand bg-brand' : 'border-text-muted/50'
                          }`}
                        >
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: 0.15 }}
                              >
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <span className={`flex-1 text-sm ${isSelected ? 'text-text-primary font-medium' : 'text-text-primary'}`}>
                      {modifier.name}
                    </span>

                    {/* Price */}
                    {modifier.display_price && (
                      <span className={`text-sm tabular-nums ${isSelected ? 'text-brand font-medium' : 'text-text-muted'}`}>
                        {modifier.display_price}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
