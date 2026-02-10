import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone as PhoneIcon, Clock, Search, X, AlertCircle } from 'lucide-react';
import { useRestaurantStore } from '../stores/restaurantStore';
import type { MenuItem } from '../types';
import { CategoryNav } from '../components/menu/CategoryNav';
import { MenuCategorySection } from '../components/menu/MenuCategorySection';
import { ItemDetailSheet } from '../components/menu/ItemDetailSheet';
import { CartFab } from '../components/cart/CartFab';
import { CartSheet } from '../components/cart/CartSheet';
import { HeaderSkeleton, CategoryNavSkeleton, CategorySkeleton } from '../components/ui/Skeleton';
import { pageTransition, pageTransitionConfig } from '../utils/motion';

interface MenuPageProps {
  slug: string;
}

export function MenuPage({ slug }: MenuPageProps) {
  const navigate = useNavigate();
  const { restaurant, menu, loading, error, loadRestaurant } = useRestaurantStore();

  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    loadRestaurant(slug);
  }, [slug, loadRestaurant]);

  // Set initial active category
  useEffect(() => {
    if (menu?.categories.length && !activeCategory) {
      setActiveCategory(menu.categories[0].id);
    }
  }, [menu, activeCategory]);

  const handleCategoryClick = useCallback((categoryId: number) => {
    setActiveCategory(categoryId);
    const el = document.getElementById(`category-${categoryId}`);
    if (el) {
      const navHeight = 52; // sticky nav height
      const y = el.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, []);

  const handleCategoryInView = useCallback((categoryId: number) => {
    setActiveCategory(categoryId);
  }, []);

  // Filter categories by search
  const filteredCategories = useMemo(() => {
    if (!menu?.categories) return [];
    if (!searchQuery.trim()) return menu.categories;

    const q = searchQuery.toLowerCase();
    return menu.categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [menu, searchQuery]);

  const handleCheckout = () => {
    setCartOpen(false);
    navigate(`/${slug}/checkout`);
  };

  // Loading state
  if (loading) {
    return (
      <motion.div
        className="min-h-screen bg-surface"
        {...pageTransition}
        transition={pageTransitionConfig}
      >
        <HeaderSkeleton />
        <CategoryNavSkeleton />
        <div className="space-y-8 mt-2">
          <CategorySkeleton />
          <CategorySkeleton />
          <CategorySkeleton />
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error || !menu || !restaurant) {
    return (
      <motion.div
        className="min-h-screen bg-surface flex items-center justify-center px-6"
        {...pageTransition}
        transition={pageTransitionConfig}
      >
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-error" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary mb-2">
            Something went wrong
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            {error || 'We couldn\'t find this restaurant. Please check the URL and try again.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-5 py-2.5 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-hover transition-colors touch-target"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  const hasResults = filteredCategories.length > 0;

  return (
    <motion.div
      className="min-h-screen bg-surface pb-24"
      {...pageTransition}
      transition={pageTransitionConfig}
    >
      {/* Restaurant Header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-brand text-white px-4 pt-6 pb-5"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{restaurant.name}</h1>
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-sm opacity-90">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="leading-tight">{restaurant.address}</span>
              </span>
              <a
                href={`tel:${restaurant.phone}`}
                className="flex items-center gap-1.5 hover:opacity-100 transition-opacity"
                aria-label={`Call ${restaurant.name}`}
              >
                <PhoneIcon className="w-3.5 h-3.5 shrink-0" />
                {restaurant.phone}
              </a>
            </div>
            {restaurant.hours && (
              <div className="mt-2 flex items-center gap-1.5 text-xs opacity-75">
                <Clock className="w-3 h-3 shrink-0" />
                <TodayHours hours={restaurant.hours} />
              </div>
            )}
          </div>

          {/* Search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2.5 -m-1 rounded-full hover:bg-white/10 transition-colors touch-target"
            aria-label={searchOpen ? 'Close search' : 'Search menu'}
          >
            {searchOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Search Bar */}
        <motion.div
          initial={false}
          animate={searchOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="pt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the menu..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/15 text-white placeholder-white/50 text-sm rounded-md border border-white/10 focus:outline-none focus:border-white/30 focus:bg-white/20 transition-colors"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5 text-white/60" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* Category Navigation */}
      {!searchQuery && (
        <CategoryNav
          categories={menu.categories}
          activeCategory={activeCategory}
          onSelect={handleCategoryClick}
        />
      )}

      {/* Menu Sections */}
      {hasResults ? (
        <div className="space-y-2 mt-2">
          {filteredCategories.map((category, index) => (
            <MenuCategorySection
              key={category.id}
              category={category}
              onItemSelect={setSelectedItem}
              onInView={searchQuery ? undefined : handleCategoryInView}
              staggerIndex={index}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
          <Search className="w-10 h-10 text-text-muted mb-3" />
          <p className="text-text-secondary font-medium">No items found</p>
          <p className="text-sm text-text-muted mt-1">
            Try a different search term
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSearchOpen(false);
            }}
            className="mt-4 text-sm text-brand font-medium hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Item Detail Sheet */}
      <ItemDetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Cart FAB */}
      <CartFab onClick={() => setCartOpen(true)} />

      {/* Cart Sheet */}
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </motion.div>
  );
}

// ============================================================================
// Today's Hours Helper
// ============================================================================

function TodayHours({ hours }: { hours: Record<string, { open?: string; close?: string; closed?: boolean }> }) {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[new Date().getDay()];
  const todayHours = hours[today];

  if (!todayHours || todayHours.closed) {
    return <span>Closed today</span>;
  }

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <span>
      Today: {formatTime(todayHours.open!)} - {formatTime(todayHours.close!)}
    </span>
  );
}
