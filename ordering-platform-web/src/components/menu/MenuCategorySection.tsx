import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { MenuCategory, MenuItem } from '../../types';
import { MenuItemCard } from './MenuItemCard';

interface MenuCategorySectionProps {
  category: MenuCategory;
  onItemSelect: (item: MenuItem) => void;
  onInView: (categoryId: number) => void;
}

export function MenuCategorySection({ category, onItemSelect, onInView }: MenuCategorySectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onInView(category.id);
        }
      },
      { rootMargin: '-80px 0px -70% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [category.id, onInView]);

  return (
    <motion.section
      ref={ref}
      id={`category-${category.id}`}
      className="scroll-mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="px-4 py-3 text-lg font-semibold text-text-primary sticky top-12 bg-surface/95 backdrop-blur-sm z-10">
        {category.name}
      </h2>
      <div className="divide-y divide-border-default/50">
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} onSelect={onItemSelect} />
        ))}
      </div>
    </motion.section>
  );
}
