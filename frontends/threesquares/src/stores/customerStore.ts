import { create } from 'zustand';
import type { Customer } from '../types/customer';

interface SavedCustomerInfo {
  name: string;
  email: string;
  phone: string;
  customerId: number | null;
}

interface CustomerState {
  savedInfo: SavedCustomerInfo | null;
  saveEnabled: boolean;

  loadSavedInfo: () => SavedCustomerInfo | null;
  saveCustomerInfo: (info: SavedCustomerInfo) => void;
  clearSavedInfo: () => void;
  setSaveEnabled: (enabled: boolean) => void;
  updateFromCustomer: (customer: Customer) => void;
}

const STORAGE_KEY = 'ordering_customer_info';

function loadFromStorage(): SavedCustomerInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SavedCustomerInfo;
  } catch {
    return null;
  }
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  savedInfo: loadFromStorage(),
  saveEnabled: !!loadFromStorage(),

  loadSavedInfo: () => {
    const info = loadFromStorage();
    set({ savedInfo: info, saveEnabled: !!info });
    return info;
  },

  saveCustomerInfo: (info: SavedCustomerInfo) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    set({ savedInfo: info });
  },

  clearSavedInfo: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ savedInfo: null, saveEnabled: false });
  },

  setSaveEnabled: (enabled: boolean) => {
    set({ saveEnabled: enabled });
    if (!enabled) {
      get().clearSavedInfo();
    }
  },

  updateFromCustomer: (customer: Customer) => {
    const info: SavedCustomerInfo = {
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      customerId: customer.id,
    };
    get().saveCustomerInfo(info);
  },
}));
