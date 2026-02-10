import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import type { MenuCategory } from '../../types';

interface CategoryNavProps {
  categories: MenuCategory[];
  activeCategory: number | null;
  onSelect: (categoryId: number) => void;
}

export function CategoryNav({ categories, activeCategory, onSelect }: CategoryNavProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeftFade(el.scrollLeft > 8);
    setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories, checkScroll]);

  // Auto-scroll to keep active button visible
  useEffect(() => {
    if (!activeCategory) return;
    const btn = buttonRefs.current.get(activeCategory);
    const container = scrollRef.current;
    if (!btn || !container) return;

    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    if (btnRect.left < containerRect.left + 40) {
      container.scrollTo({
        left: container.scrollLeft + btnRect.left - containerRect.left - 40,
        behavior: 'smooth',
      });
    } else if (btnRect.right > containerRect.right - 40) {
      container.scrollTo({
        left: container.scrollLeft + btnRect.right - containerRect.right + 40,
        behavior: 'smooth',
      });
    }
  }, [activeCategory]);

  return (
    <nav
      className="sticky top-0 z-20 bg-surface/95 backdrop-blur-sm border-b border-border-default"
      aria-label="Menu categories"
    >
      <div className="relative">
        {showLeftFade && (
          <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
        )}
        {showRightFade && (
          <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />
        )}
        <LayoutGroup>
          <div
            ref={scrollRef}
            className="flex gap-1 overflow-x-auto px-4 py-2.5 scrollbar-hide"
            role="tablist"
            aria-label="Menu categories"
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  ref={(el) => {
                    if (el) buttonRefs.current.set(cat.id, el);
                  }}
                  onClick={() => onSelect(cat.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`category-${cat.id}`}
                  className={`
                    relative px-3.5 py-2 text-sm font-medium whitespace-nowrap
                    rounded-md transition-colors duration-(--duration-fast)
                    touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40
                    ${isActive
                      ? 'text-brand'
                      : 'text-text-secondary hover:text-text-primary'
                    }
                  `}
                >
                  {cat.name}
                  {isActive && (
                    <motion.div
                      layoutId="categoryIndicator"
                      className="absolute bottom-0 left-2.5 right-2.5 h-0.5 bg-brand rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </nav>
  );
}
