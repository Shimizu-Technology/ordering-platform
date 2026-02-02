import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { MenuCategory } from '../../types';

interface CategoryNavProps {
  categories: MenuCategory[];
  activeCategory: number | null;
  onSelect: (categoryId: number) => void;
}

export function CategoryNav({ categories, activeCategory, onSelect }: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      setShowLeftFade(el.scrollLeft > 8);
      setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    return () => el.removeEventListener('scroll', check);
  }, [categories]);

  return (
    <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-sm border-b border-border-default">
      <div className="relative">
        {showLeftFade && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
        )}
        {showRightFade && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />
        )}
        <div
          ref={scrollRef}
          className="flex gap-1 overflow-x-auto px-4 py-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`
                relative px-3 py-2 text-sm font-medium whitespace-nowrap rounded-[var(--radius-md)]
                transition-colors duration-[var(--duration-fast)] touch-target
                ${activeCategory === cat.id
                  ? 'text-brand'
                  : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              {cat.name}
              {activeCategory === cat.id && (
                <motion.div
                  layoutId="categoryIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
