import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Phone, Coffee, ChevronRight } from 'lucide-react';
import { api } from '../api/client';
import { isCurrentlyOpen, getTodayHours, formatWeeklyHours, type WeekHours } from '@shimizu/shared';
import type { Restaurant, MenuItem } from '../types';

interface LandingPageProps {
  slug: string;
}

export function LandingPage({ slug }: LandingPageProps) {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [restaurantData, menuData] = await Promise.all([
          api.getRestaurant(slug),
          api.getMenu(slug),
        ]);
        setRestaurant(restaurantData);
        
        // Get first 4 items as featured (or items marked featured if available)
        const allItems = menuData.categories.flatMap(c => c.items);
        setFeaturedItems(allItems.slice(0, 4));
      } catch (error) {
        console.error('Failed to load restaurant:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

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

  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div 
          className="absolute inset-0 bg-linear-to-br from-brand via-brand to-brand-dark"
          style={{ opacity: 0.95 }}
        />
        
        {/* Coffee pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative px-6 py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto text-center"
          >
            {/* Logo placeholder */}
            <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
              <Coffee className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {restaurant.name}
            </h1>
            
            <p className="text-white/80 text-lg mb-2">
              Guam's Oldest Specialty Coffee Shop
            </p>
            
            {/* Open/Closed Status */}
            {restaurant.hours && (
              <div className="mb-6">
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

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/${slug}`)}
              className="inline-flex items-center gap-2 bg-white text-brand px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-shadow"
            >
              Order Online
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Featured Items */}
      {featuredItems.length > 0 && (
        <section className="px-6 py-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-brand" />
              Popular Picks
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              {featuredItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onClick={() => navigate(`/${slug}`)}
                  className="bg-surface-card rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-shadow border border-border-subtle"
                >
                  <div className="w-full aspect-square bg-brand-light rounded-lg mb-3 flex items-center justify-center">
                    <Coffee className="w-8 h-8 text-brand/50" />
                  </div>
                  <h3 className="font-medium text-text-primary text-sm line-clamp-2 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-brand font-semibold text-sm">
                    ${item.base_price.toFixed(2)}
                  </p>
                </motion.button>
              ))}
            </div>
            
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={() => navigate(`/${slug}`)}
              className="w-full mt-6 py-3 text-brand font-medium text-center hover:bg-brand-light rounded-lg transition-colors"
            >
              View Full Menu →
            </motion.button>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="px-6 py-12 bg-brand/5">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            About Us
          </h2>
          <p className="text-text-secondary leading-relaxed mb-4">
            Since 1995, HavaJava has been Guam's home for specialty coffee. 
            What started as a small café in Hagåtña has grown into the island's 
            longest-running coffee house, serving generations of coffee lovers.
          </p>
          <p className="text-text-secondary leading-relaxed">
            We take pride in our craft, from locally-roasted beans to our signature 
            drinks. Whether you're grabbing a quick espresso or settling in for a 
            conversation, we're here to make your day a little brighter.
          </p>
        </div>
      </section>

      {/* Info Section */}
      <section className="px-6 py-12 bg-surface-elevated">
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
                  <p className="text-text-secondary text-sm">Monday – Saturday: 6:30am – 4:00pm</p>
                  <p className="text-text-secondary text-sm">Sunday: Closed</p>
                </>
              )}
            </div>
          </div>
          
          {/* Location */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="font-medium text-text-primary mb-1">Location</h3>
              <p className="text-text-secondary text-sm">
                {restaurant.address || '148 Aspinall Ave, Suite 102'}
              </p>
              <p className="text-text-secondary text-sm">Hagåtña, Guam 96910</p>
              <p className="text-text-muted text-xs mt-1">Across from Sirena Park</p>
            </div>
          </div>
          
          {/* Phone */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-brand-light rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="font-medium text-text-primary mb-1">Phone</h3>
              <a 
                href={`tel:${restaurant.phone || '6714770600'}`}
                className="text-brand text-sm hover:underline"
              >
                {restaurant.phone || '(671) 477-0600'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-6 py-12">
        <div className="max-w-md mx-auto text-center">
          <p className="text-text-secondary mb-4">
            Skip the line, order ahead!
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/${slug}`)}
            className="inline-flex items-center gap-2 bg-brand text-white px-8 py-4 rounded-xl font-semibold shadow-md hover:bg-brand-hover transition-colors"
          >
            Start Your Order
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-brand text-white/60 text-center text-sm">
        <p>© {new Date().getFullYear()} {restaurant.name}</p>
        <p className="mt-1">Guam's longest-brewing coffee shop since 1995</p>
      </footer>
    </div>
  );
}
