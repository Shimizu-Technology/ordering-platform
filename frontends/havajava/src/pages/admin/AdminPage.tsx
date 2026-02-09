import { useState, useEffect, useCallback } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { useAuth, setGlobalTokenGetter } from '../../contexts/AuthContext';
import { adminApi } from '../../api/adminClient';
import type { AdminRestaurant } from '../../types/admin';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import { OrderQueue } from './OrderQueue';
import { MenuManagement } from './MenuManagement';
import { RestaurantSettings } from './RestaurantSettings';
import { PromotionsManagement } from './PromotionsManagement';
import { AnalyticsDashboard } from './AnalyticsDashboard';

type AdminPageId = 'orders' | 'menu' | 'promotions' | 'analytics' | 'settings';

export function AdminPage() {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const { getToken, isSignedIn, isLoading } = useAuth();
  const [activePage, setActivePage] = useState<AdminPageId>('orders');
  const [, setForceRender] = useState(0);
  const [restaurant, setRestaurant] = useState<AdminRestaurant | null>(null);

  // Set up global token getter for API client
  useEffect(() => {
    setGlobalTokenGetter(getToken);
  }, [getToken]);

  const fetchRestaurant = useCallback(async () => {
    try {
      const data = await adminApi.getRestaurant();
      setRestaurant(data);
    } catch {
      // Will handle in individual pages
    }
  }, []);

  // Fetch restaurant when authenticated
  useEffect(() => {
    if (isAuthenticated() || isSignedIn) {
      fetchRestaurant();
    }
  }, [isAuthenticated, isSignedIn, fetchRestaurant]);

  // Show loading while Clerk initializes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  // Check if user needs to log in
  // For Clerk: use isSignedIn; for token auth: use isAuthenticated from store
  const needsLogin = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY 
    ? !isSignedIn 
    : !isAuthenticated();

  if (needsLogin) {
    return <AdminLogin onSuccess={() => setForceRender((n) => n + 1)} />;
  }

  return (
    <AdminLayout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'orders' && <OrderQueue restaurant={restaurant} />}
      {activePage === 'menu' && <MenuManagement />}
      {activePage === 'promotions' && <PromotionsManagement />}
      {activePage === 'analytics' && <AnalyticsDashboard />}
      {activePage === 'settings' && <RestaurantSettings onRestaurantUpdate={setRestaurant} />}
    </AdminLayout>
  );
}
