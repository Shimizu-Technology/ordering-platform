import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone as PhoneIcon, Clock } from 'lucide-react';
import { api } from '../api/client';
import { applyBranding } from '../utils/branding';
import type { MenuResponse, MenuItem, Restaurant, Order } from '../types';
import { CategoryNav } from '../components/menu/CategoryNav';
import { MenuCategorySection } from '../components/menu/MenuCategorySection';
import { ItemDetailSheet } from '../components/menu/ItemDetailSheet';
import { CartFab } from '../components/cart/CartFab';
import { CartSheet } from '../components/cart/CartSheet';
import { CheckoutForm } from '../components/order/CheckoutForm';
import { OrderConfirmation } from '../components/order/OrderConfirmation';
import { CategorySkeleton } from '../components/ui/Skeleton';

type View = 'menu' | 'checkout' | 'confirmation';

interface MenuPageProps {
  slug: string;
}

export function MenuPage({ slug }: MenuPageProps) {
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [view, setView] = useState<View>('menu');
  const [order, setOrder] = useState<Order | null>(null);

  // Fetch menu data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [menuData, restaurantData] = await Promise.all([
          api.getMenu(slug),
          api.getRestaurant(slug),
        ]);
        setMenu(menuData);
        setRestaurant(restaurantData);
        applyBranding(menuData.restaurant.branding);
        if (menuData.categories.length > 0) {
          setActiveCategory(menuData.categories[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load menu');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const handleCategoryClick = useCallback((categoryId: number) => {
    setActiveCategory(categoryId);
    const el = document.getElementById(`category-${categoryId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleCategoryInView = useCallback((categoryId: number) => {
    setActiveCategory(categoryId);
  }, []);

  const handleOrderPlaced = (placedOrder: Order) => {
    setOrder(placedOrder);
    setView('confirmation');
  };

  const handleNewOrder = () => {
    setOrder(null);
    setView('menu');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="p-4 space-y-2">
          <div className="h-8 w-48 bg-surface-elevated rounded animate-pulse" />
          <div className="h-4 w-32 bg-surface-elevated rounded animate-pulse" />
        </div>
        <div className="space-y-8 mt-4">
          <CategorySkeleton />
          <CategorySkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !menu || !restaurant) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-lg font-medium text-text-primary">Oops!</p>
          <p className="text-text-secondary mt-1">{error || 'Restaurant not found'}</p>
        </div>
      </div>
    );
  }

  // Checkout view
  if (view === 'checkout') {
    return (
      <CheckoutForm
        restaurantSlug={slug}
        onBack={() => setView('menu')}
        onOrderPlaced={handleOrderPlaced}
      />
    );
  }

  // Confirmation view
  if (view === 'confirmation' && order) {
    return (
      <OrderConfirmation
        order={order}
        restaurantName={restaurant.name}
        restaurantPhone={restaurant.phone}
        onNewOrder={handleNewOrder}
      />
    );
  }

  // Menu view
  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Restaurant Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand text-white px-4 py-6"
      >
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-90">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {restaurant.address}
          </span>
          <a
            href={`tel:${restaurant.phone}`}
            className="flex items-center gap-1 hover:underline"
          >
            <PhoneIcon className="w-3.5 h-3.5" />
            {restaurant.phone}
          </a>
        </div>
        {restaurant.hours && (
          <div className="mt-2 flex items-center gap-1 text-xs opacity-75">
            <Clock className="w-3 h-3" />
            <TodayHours hours={restaurant.hours} />
          </div>
        )}
      </motion.header>

      {/* Category Navigation */}
      <CategoryNav
        categories={menu.categories}
        activeCategory={activeCategory}
        onSelect={handleCategoryClick}
      />

      {/* Menu Sections */}
      <div className="space-y-2 mt-2">
        {menu.categories.map((category) => (
          <MenuCategorySection
            key={category.id}
            category={category}
            onItemSelect={setSelectedItem}
            onInView={handleCategoryInView}
          />
        ))}
      </div>

      {/* Item Detail Sheet */}
      <ItemDetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Cart FAB */}
      <CartFab onClick={() => setCartOpen(true)} />

      {/* Cart Sheet */}
      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setView('checkout');
        }}
      />
    </div>
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
