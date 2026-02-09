import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  Phone, 
  UtensilsCrossed, 
  Users, 
  Cookie,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../api/client';
import { isCurrentlyOpen, getTodayHours, formatWeeklyHours, type WeekHours } from '@shimizu/shared';
import type { Restaurant, Location } from '../types';
import { LocationPicker } from '../components/LocationPicker';
import { useLocationStore } from '../stores/locationStore';

interface LandingPageProps {
  slug: string;
}

export function LandingPage({ slug }: LandingPageProps) {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const { selectedLocation, selectLocation } = useLocationStore();

  useEffect(() => {
    async function loadData() {
      try {
        const [restaurantData, locationsResponse] = await Promise.all([
          apiClient.getRestaurant(slug),
          apiClient.getLocations(slug),
        ]);
        setRestaurant(restaurantData);
        // Handle both {locations: []} and [] response formats
        const locationsData = Array.isArray(locationsResponse) 
          ? locationsResponse 
          : locationsResponse.locations || [];
        setLocations(locationsData);
        
        // Auto-select first location if none selected
        if (!selectedLocation && locationsData.length > 0) {
          selectLocation(locationsData[0]);
        }
      } catch (error) {
        console.error('Failed to load restaurant:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug, selectedLocation, selectLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-text-secondary">Restaurant not found</p>
      </div>
    );
  }

  const sections = [
    {
      id: 'restaurant',
      title: 'Restaurant',
      subtitle: 'Order food for pickup',
      description: 'Fresh-made dishes, sandwiches, salads & more',
      icon: UtensilsCrossed,
      color: 'bg-brand',
      hoverColor: 'hover:bg-brand-hover',
      path: `/${slug}`,
      enabled: true,
    },
    {
      id: 'catering',
      title: 'Catering',
      subtitle: 'Events & large orders',
      description: 'Corporate events, parties, and special occasions',
      icon: Users,
      color: 'bg-amber-600',
      hoverColor: 'hover:bg-amber-700',
      path: `/${slug}/catering`,
      enabled: restaurant.features?.catering ?? false,
    },
    {
      id: 'cookies',
      title: 'Latte Stone Cookies',
      subtitle: 'Authentic Chamorro treats',
      description: 'Handcrafted shortbread with island flavors',
      icon: Cookie,
      color: 'bg-amber-500',
      hoverColor: 'hover:bg-amber-600',
      path: `/${slug}/cookies`,
      enabled: restaurant.features?.merchandise ?? false,
    },
  ];

  const enabledSections = sections.filter(s => s.enabled);

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-brand via-brand to-brand-dark"
          style={{ opacity: 0.95 }}
        />
        
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative px-6 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto text-center"
          >
            {/* Logo placeholder */}
            <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {restaurant.name}
            </h1>
            
            <p className="text-white/80 text-lg mb-1">
              Good Food, Good Mood
            </p>
            
            <p className="text-white/60 text-sm mb-4">
              B&G Pacific Food Services
            </p>

            {/* Open/Closed Status */}
            {restaurant.hours && (
              <div className="mb-4">
                {isCurrentlyOpen(restaurant.hours as WeekHours, restaurant.timezone) ? (
                  <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    Open · {getTodayHours(restaurant.hours as WeekHours, restaurant.timezone)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-200 px-3 py-1 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-red-400 rounded-full" />
                    Closed · {getTodayHours(restaurant.hours as WeekHours, restaurant.timezone)}
                  </span>
                )}
              </div>
            )}

            {/* Location selector */}
            {locations.length > 1 && (
              <button
                onClick={() => setShowLocationPicker(true)}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors mb-4"
              >
                <MapPin className="w-4 h-4" />
                {selectedLocation?.name || 'Select Location'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Section Cards */}
      <section className="px-6 py-8 -mt-6">
        <div className="max-w-md mx-auto space-y-4">
          {enabledSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                onClick={() => navigate(section.path)}
                className={`w-full ${section.color} ${section.hoverColor} rounded-2xl p-6 text-left shadow-lg hover:shadow-xl transition-all group`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold text-white mb-1">
                      {section.title}
                    </h2>
                    <p className="text-white/90 font-medium text-sm mb-1">
                      {section.subtitle}
                    </p>
                    <p className="text-white/70 text-sm">
                      {section.description}
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0 mt-4" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 py-10 bg-brand/5">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            About Three Squares
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Three Squares is part of B&G Pacific Food Services, bringing quality 
            food and exceptional service to Guam. From our kitchen to your table, 
            we believe every meal should be a good one.
          </p>
          <p className="text-text-secondary leading-relaxed">
            We also offer catering for events of all sizes and are proud home to 
            <strong className="text-brand"> Latte Stone Cookies</strong> — authentic 
            Chamorro-inspired shortbread made with island flavors.
          </p>
        </div>
      </section>

      {/* Info Section */}
      <section className="px-6 py-10 bg-surface-elevated">
        <div className="max-w-md mx-auto space-y-6">
          <h2 className="text-xl font-semibold text-text-primary mb-6">
            Visit Us
          </h2>
          
          {/* Hours */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="font-medium text-text-primary mb-1">Hours</h3>
              {restaurant.hours ? (
                <div className="space-y-0.5">
                  {formatWeeklyHours(restaurant.hours as WeekHours).map(({ day, hours }) => (
                    <p key={day} className="text-text-secondary text-sm">
                      <span className="inline-block w-24">{day}:</span> {hours}
                    </p>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-text-secondary text-sm">Monday – Friday: 6:00am – 2:00pm</p>
                  <p className="text-text-secondary text-sm">Saturday – Sunday: Closed</p>
                </>
              )}
            </div>
          </div>
          
          {/* Locations */}
          {locations.length > 0 ? (
            locations.map(location => (
              <div key={location.id} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h3 className="font-medium text-text-primary mb-1">{location.name}</h3>
                  <p className="text-text-secondary text-sm">{location.address}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h3 className="font-medium text-text-primary mb-1">Location</h3>
                <p className="text-text-secondary text-sm">
                  {restaurant.address || '416 Chalan San Antonio'}
                </p>
                <p className="text-text-secondary text-sm">Tamuning, Guam 96913</p>
              </div>
            </div>
          )}
          
          {/* Phone */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="font-medium text-text-primary mb-1">Phone</h3>
              <a 
                href={`tel:${restaurant.phone || '6716462652'}`}
                className="text-brand text-sm hover:underline"
              >
                {restaurant.phone || '(671) 646-2652'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-brand text-white/60 text-center text-sm">
        <p>© {new Date().getFullYear()} {restaurant.name}</p>
        <p className="mt-1">B&G Pacific Food Services</p>
      </footer>

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setShowLocationPicker(false)}
          />
          {/* Modal Content */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="relative w-full max-w-md bg-surface rounded-t-2xl sm:rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
          >
            <LocationPicker
              locations={locations}
              selectedLocation={selectedLocation}
              onSelect={(location) => {
                selectLocation(location);
                setShowLocationPicker(false);
              }}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
