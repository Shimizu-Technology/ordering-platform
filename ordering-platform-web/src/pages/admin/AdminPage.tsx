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

type AdminPageId = 'orders' | 'menu' | 'promotions' | 'settings';

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

  return (
    <AdminLayout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'orders' && <OrderQueue restaurant={restaurant} />}
      {activePage === 'menu' && <MenuManagement />}
      {activePage === 'promotions' && <PromotionsManagement />}
      {activePage === 'settings' && <RestaurantSettings onRestaurantUpdate={setRestaurant} />}
    </AdminLayout>
  );
}
