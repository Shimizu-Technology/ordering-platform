import { create } from 'zustand';
import type { Restaurant, MenuResponse } from '../types';
import { api } from '../api/client';
import { applyBranding } from '../utils/branding';

interface RestaurantState {
  restaurant: Restaurant | null;
  menu: MenuResponse | null;
  loading: boolean;
  error: string | null;
  slug: string | null;

  loadRestaurant: (slug: string) => Promise<void>;
  reset: () => void;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  restaurant: null,
  menu: null,
  loading: false,
  error: null,
  slug: null,

  loadRestaurant: async (slug: string) => {
    // Skip if already loaded for this slug
    if (get().slug === slug && get().restaurant) return;

    set({ loading: true, error: null, slug });

    try {
      const [menuData, restaurantData] = await Promise.all([
        api.getMenu(slug),
        api.getRestaurant(slug),
      ]);

      applyBranding(menuData.restaurant.branding);

      set({
        menu: menuData,
        restaurant: restaurantData,
        loading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load restaurant',
        loading: false,
      });
    }
  },

  reset: () => set({
    restaurant: null,
    menu: null,
    loading: false,
    error: null,
    slug: null,
  }),
}));
