import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Location } from '../types';

interface LocationState {
  locations: Location[];
  selectedLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  
  setLocations: (locations: Location[]) => void;
  selectLocation: (location: Location) => void;
  clearLocation: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      locations: [],
      selectedLocation: null,
      isLoading: false,
      error: null,

      setLocations: (locations) => set({ locations }),
      
      selectLocation: (location) => set({ selectedLocation: location }),
      
      clearLocation: () => set({ selectedLocation: null }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'threesquares-location',
      partialize: (state) => ({ 
        selectedLocation: state.selectedLocation 
      }),
    }
  )
);
