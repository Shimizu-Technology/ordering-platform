import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { MenuCategory, MenuItem } from '../../types';
import { MenuItemCard } from './MenuItemCard';
import { staggerContainer, staggerItem } from '../../utils/motion';

interface MenuCategorySectionProps {
  category: MenuCategory;
  onItemSelect: (item: MenuItem) => void;
  onInView?: (categoryId: number) => void;
  staggerIndex?: number;
}

export function MenuCategorySection({
  category,
  onItemSelect,
  onInView,
  staggerIndex = 0,
}: MenuCategorySectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onInView) return;
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
    <section
      ref={ref}
      id={`category-${category.id}`}
      className="scroll-mt-14"
      role="tabpanel"
      aria-labelledby={`cat-tab-${category.id}`}
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: staggerIndex * 0.05 }}
        className="px-4 py-3 text-lg font-semibold text-text-primary sticky top-[52px] bg-surface/95 backdrop-blur-sm z-10"
      >
        {category.name}
      </motion.h2>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="divide-y divide-border-subtle"
      >
        {category.items
          .filter((item) => item.available)
          .map((item) => (
            <motion.div key={item.id} variants={staggerItem}>
              <MenuItemCard item={item} onSelect={onItemSelect} />
            </motion.div>
          ))}
      </motion.div>
    </section>
  );
}
