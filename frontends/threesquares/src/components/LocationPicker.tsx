import { MapPin, Clock, Phone, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Location } from '../types';

interface LocationPickerProps {
  locations: Location[];
  selectedLocation: Location | null;
  onSelect: (location: Location) => void;
  compact?: boolean;
}

export function LocationPicker({ locations, selectedLocation, onSelect, compact = false }: LocationPickerProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const getHoursDisplay = (location: Location) => {
    const hours = location.hours?.[today];
    if (!hours) return 'Hours not available';
    if (hours.closed) return 'Closed today';
    return `${hours.open} - ${hours.close}`;
  };

  const isOpen = (location: Location) => {
    const hours = location.hours?.[today];
    if (!hours || hours.closed) return false;
    
    const now = new Date();
    const [openH, openM] = (hours.open || '00:00').split(':').map(Number);
    const [closeH, closeM] = (hours.close || '23:59').split(':').map(Number);
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;
    
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  };

  if (compact && selectedLocation) {
    return (
      <button
        onClick={() => onSelect(selectedLocation)}
        className="flex items-center gap-2 px-3 py-2 bg-brand-light rounded-lg text-sm text-brand hover:bg-brand/20 transition-colors"
      >
        <MapPin className="w-4 h-4" />
        <span className="font-medium">{selectedLocation.name}</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
        Select Pickup Location
      </h3>
      <div className="grid gap-3">
        {locations.map((location) => {
          const isSelected = selectedLocation?.id === location.id;
          const locationIsOpen = isOpen(location);

          return (
            <motion.button
              key={location.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(location)}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all
                ${isSelected 
                  ? 'border-brand bg-brand-light' 
                  : 'border-border-default bg-surface-card hover:border-brand/50'
                }
              `}
            >
              {/* Selection indicator */}
              <div className={`
                absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${isSelected ? 'border-brand bg-brand' : 'border-border-default'}
              `}>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                )}
              </div>

              {/* Location info */}
              <div className="pr-8">
                <h4 className="font-semibold text-text-primary">{location.name}</h4>
                
                {location.address && (
                  <p className="text-sm text-text-secondary mt-1 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                    {location.address}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className={`flex items-center gap-1.5 ${locationIsOpen ? 'text-success' : 'text-text-muted'}`}>
                    <Clock className="w-4 h-4" />
                    {getHoursDisplay(location)}
                  </span>

                  {location.phone && (
                    <span className="flex items-center gap-1.5 text-text-secondary">
                      <Phone className="w-4 h-4" />
                      {location.phone}
                    </span>
                  )}
                </div>

                {/* Open/Closed badge */}
                <div className="mt-2">
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${locationIsOpen 
                      ? 'bg-success/10 text-success' 
                      : 'bg-text-muted/10 text-text-muted'
                    }
                  `}>
                    {locationIsOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
