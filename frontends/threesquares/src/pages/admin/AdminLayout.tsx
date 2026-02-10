import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  UtensilsCrossed,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap,
  BarChart3,
  Users,
  Cookie,
  Monitor,
} from 'lucide-react';
import { useAdminStore } from '../../stores/adminStore';
import type { AdminRestaurant } from '../../types/admin';

type AdminPage = 'orders' | 'catering' | 'merchandise' | 'menu' | 'promotions' | 'analytics' | 'settings' | 'pos';

interface AdminLayoutProps {
  activePage: AdminPage;
  onNavigate: (page: AdminPage) => void;
  children: React.ReactNode;
  restaurant?: AdminRestaurant | null;
}

const navItems: { id: AdminPage; label: string; icon: React.ElementType; requiresFeature?: string }[] = [
  { id: 'pos', label: 'POS', icon: Monitor },
  { id: 'orders', label: 'Order Queue', icon: ClipboardList },
  { id: 'catering', label: 'Catering', icon: Users, requiresFeature: 'catering' },
  { id: 'merchandise', label: 'Cookies', icon: Cookie, requiresFeature: 'merchandise' },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'promotions', label: 'Promos', icon: Zap },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminLayout({ activePage, onNavigate, children }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logout = useAdminStore((s) => s.logout);

  // Filter nav items based on restaurant features
  const filteredNavItems = navItems.filter(item => {
    if (!item.requiresFeature) return true;
    // For now, show catering and merchandise for Three Squares
    // TODO: Check actual features from restaurant when API returns it
    if (item.requiresFeature === 'catering') return true;
    if (item.requiresFeature === 'merchandise') return true;
    return true;
  });

  const handleNav = (page: AdminPage) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-surface-card border-b border-border-default">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary transition-colors touch-target"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="font-bold text-text-primary text-lg">Admin</h1>
          </div>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors touch-target ${
                    isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={logout}
            className="p-2 text-text-secondary hover:text-error transition-colors touch-target"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-20 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed top-14 left-0 bottom-0 w-[280px] bg-surface-card border-r border-border-default z-20 lg:hidden p-4"
            >
              <div className="space-y-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNav(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-colors touch-target ${
                        isActive
                          ? 'bg-brand/10 text-brand'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-40" />
                    </button>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="px-4 py-6 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}
