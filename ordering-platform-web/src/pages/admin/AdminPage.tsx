import { useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { AdminLogin } from './AdminLogin';
import { AdminLayout } from './AdminLayout';
import { OrderQueue } from './OrderQueue';
import { MenuManagement } from './MenuManagement';
import { RestaurantSettings } from './RestaurantSettings';

type AdminPageId = 'orders' | 'menu' | 'settings';

export function AdminPage() {
  const isAuthenticated = useAdminStore((s) => s.isAuthenticated);
  const [activePage, setActivePage] = useState<AdminPageId>('orders');
  const [, setForceRender] = useState(0);

  if (!isAuthenticated()) {
    return <AdminLogin onSuccess={() => setForceRender((n) => n + 1)} />;
  }

  return (
    <AdminLayout activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'orders' && <OrderQueue />}
      {activePage === 'menu' && <MenuManagement />}
      {activePage === 'settings' && <RestaurantSettings />}
    </AdminLayout>
  );
}
