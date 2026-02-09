import { useState, useEffect, useCallback } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { adminApi } from '../../api/adminClient';
import type { AdminRestaurant } from '../../types/admin';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import { OrderQueue } from './OrderQueue';
import { MenuManagement } from './MenuManagement';
import { RestaurantSettings } from './RestaurantSettings';
import { PromotionsManagement } from './PromotionsManagement';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { CateringInbox } from './CateringInbox';
import { MerchandiseAdmin } from './MerchandiseAdmin';
import { POSPage } from './POSPage';

type AdminPageId = 'orders' | 'catering' | 'merchandise' | 'menu' | 'promotions' | 'analytics' | 'settings' | 'pos';

export function AdminPage() {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const [activePage, setActivePage] = useState<AdminPageId>('orders');
  const [, setForceRender] = useState(0);
  const [restaurant, setRestaurant] = useState<AdminRestaurant | null>(null);

  const fetchRestaurant = useCallback(async () => {
    try {
      const data = await adminApi.getRestaurant();
      setRestaurant(data);
    } catch {
      // Will handle in individual pages
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchRestaurant();
    }
  }, [isAuthenticated, fetchRestaurant]);

  if (!isAuthenticated()) {
    return <AdminLogin onSuccess={() => setForceRender((n) => n + 1)} />;
  }

  // POS mode is full-screen, not inside the admin layout
  if (activePage === 'pos') {
    return <POSPage onBack={() => setActivePage('orders')} />;
  }

  return (
    <AdminLayout activePage={activePage} onNavigate={setActivePage} restaurant={restaurant}>
      {activePage === 'orders' && <OrderQueue restaurant={restaurant} />}
      {activePage === 'catering' && <CateringInbox />}
      {activePage === 'merchandise' && <MerchandiseAdmin />}
      {activePage === 'menu' && <MenuManagement />}
      {activePage === 'promotions' && <PromotionsManagement />}
      {activePage === 'analytics' && <AnalyticsDashboard />}
      {activePage === 'settings' && <RestaurantSettings onRestaurantUpdate={setRestaurant} />}
    </AdminLayout>
  );
}
