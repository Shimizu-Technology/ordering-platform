import { create } from 'zustand';

interface AdminState {
  token: string | null;
  restaurantSlug: string;
  isAuthenticated: () => boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>((_, get) => ({
  token: localStorage.getItem('admin_token'),
  restaurantSlug: 'havajava',

  isAuthenticated: () => {
    return !!get().token;
  },

  login: (token: string) => {
    localStorage.setItem('admin_token', token);
    // We need to set the state directly using the store's set function
    useAdminStore.setState({ token });
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    useAdminStore.setState({ token: null });
  },
}));
