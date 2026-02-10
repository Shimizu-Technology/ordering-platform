import { motion } from 'framer-motion';
import { Plus, ChevronRight, Zap } from 'lucide-react';
import { OptimizedImage } from '@shimizu/shared';
import type { MenuItem } from '../../types';
import { formatPrice } from '../../utils/price';

const IMGIX_DOMAIN = import.meta.env.VITE_IMGIX_DOMAIN;

interface MenuItemCardProps {
  item: MenuItem;
  onSelect: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onSelect }: MenuItemCardProps) {
  const hasModifiers = item.modifier_groups.length > 0;
  const hasPromo = !!item.promotion;

  return (
    <motion.button
      onClick={() => onSelect(item)}
      className="w-full flex gap-3 p-4 text-left rounded-lg hover:bg-surface-elevated/80 transition-colors duration-(--duration-fast) touch-target group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-inset"
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
      aria-label={`${item.name}, ${hasPromo ? formatPrice(item.discounted_price!) : formatPrice(item.base_price)}${hasModifiers ? ', customizable' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-text-primary leading-tight">{item.name}</h3>
          {hasPromo && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-warning/10 text-warning text-[10px] font-bold rounded-full shrink-0 uppercase tracking-wide">
              <Zap className="w-2.5 h-2.5" />
              {item.promotion!.name}
            </span>
          )}
        </div>
        {item.description && (
          <p className="mt-1 text-sm text-text-secondary line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          {hasPromo ? (
            <>
              <span className="text-sm font-semibold text-success">
                {formatPrice(item.discounted_price!)}
              </span>
              <span className="text-sm text-text-muted line-through">
                {formatPrice(item.original_price!)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-text-primary">
              {formatPrice(item.base_price)}
            </span>
          )}
          {hasModifiers && (
            <span className="inline-flex items-center gap-0.5 text-xs text-brand font-medium">
              Customize
              <ChevronRight className="w-3 h-3" />
            </span>
          )}
        </div>
      </div>

      {item.image_url ? (
        <div className="w-20 h-20 rounded-md overflow-hidden shrink-0 bg-surface-elevated shadow-sm">
          <OptimizedImage
            src={item.image_url}
            alt=""
            context="thumb"
            imgixDomain={IMGIX_DOMAIN}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="w-9 h-9 rounded-full bg-brand/8 flex items-center justify-center shrink-0 self-center group-hover:bg-brand/12 transition-colors">
          <Plus className="w-4 h-4 text-brand" />
        </div>
      )}
    </motion.button>
  );
}
