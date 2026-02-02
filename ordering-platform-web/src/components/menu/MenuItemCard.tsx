import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { MenuItem } from '../../types';
import { formatPrice } from '../../utils/price';

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
  const hasModifiers = item.modifier_groups.length > 0;

  return (
    <motion.button
      onClick={() => onSelect(item)}
      className="w-full flex gap-3 p-4 text-left rounded-[var(--radius-lg)] hover:bg-surface-elevated transition-colors duration-[var(--duration-fast)] touch-target group"
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-text-primary leading-tight">{item.name}</h3>
        {item.description && (
          <p className="mt-1 text-sm text-text-secondary line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">
            {formatPrice(item.base_price)}
          </span>
          {hasModifiers && (
            <span className="text-xs text-text-muted">Customizable</span>
          )}
        </div>
      </div>

      {item.image_url ? (
        <div className="w-20 h-20 rounded-[var(--radius-md)] overflow-hidden shrink-0 bg-surface-elevated">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Plus className="w-5 h-5 text-brand" />
        </div>
      )}
    </motion.button>
  );
}
