import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Clock,
  Phone,
  Mail,
  MapPin,
  Palette,
  Image,
  Check,
  Loader2,
  RotateCcw,
  Bell,
  Globe,
  CreditCard,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Link2,
  MessageSquare,
} from 'lucide-react';
import type { AdminRestaurant, StripeConnectStatus } from '../../types/admin';
import { adminApi } from '../../api/adminClient';
import { Skeleton } from '../../components/ui/Skeleton';

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

interface RestaurantSettingsProps {
  onRestaurantUpdate?: (restaurant: AdminRestaurant) => void;
}

export function RestaurantSettings({ onRestaurantUpdate }: RestaurantSettingsProps) {
  const [restaurant, setRestaurant] = useState<AdminRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState<Record<string, { open?: string; close?: string; closed?: boolean }>>({});
  const [primaryColor, setPrimaryColor] = useState('#2D5016');
  const [secondaryColor, setSecondaryColor] = useState('#F5F0E8');
  const [accentColor, setAccentColor] = useState('#8B4513');
  const [fontFamily, setFontFamily] = useState('DM Sans');
  const [logoUrl, setLogoUrl] = useState('');

  // Notification state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  // Stripe Connect state
  const [stripeStatus, setStripeStatus] = useState<StripeConnectStatus | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeConnecting, setStripeConnecting] = useState(false);

  // Locations state
  const [locations, setLocations] = useState<import('../../types').Location[]>([]);
  const [locationSaving, setLocationSaving] = useState<Record<number, boolean>>({});
  const [locationSaved, setLocationSaved] = useState<Record<number, boolean>>({});
  const [locationMapUrls, setLocationMapUrls] = useState<Record<number, string>>({});

  const fetchRestaurant = useCallback(async () => {
    try {
      const data = await adminApi.getRestaurant();
      setRestaurant(data);
      populateForm(data);
      onRestaurantUpdate?.(data);
    } catch (err) {
      console.error('Failed to fetch restaurant:', err);
    } finally {
      setLoading(false);
    }
  }, [onRestaurantUpdate]);

  const fetchStripeStatus = useCallback(async () => {
    setStripeLoading(true);
    try {
      const status = await adminApi.getStripeStatus();
      setStripeStatus(status);
    } catch {
      setStripeStatus({ configured: false, connected: false, onboarding_complete: false });
    } finally {
      setStripeLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurant();
    fetchStripeStatus();
  }, [fetchRestaurant, fetchStripeStatus]);

  // Fetch locations once restaurant slug is known
  useEffect(() => {
    if (!restaurant?.slug) return;
    adminApi.getLocations(restaurant.slug).then((locs) => {
      setLocations(locs);
      const urls: Record<number, string> = {};
      locs.forEach((loc) => { urls[loc.id] = loc.map_url ?? ''; });
      setLocationMapUrls(urls);
    }).catch(console.error);
  }, [restaurant?.slug]);

  const populateForm = (r: AdminRestaurant) => {
    setName(r.name || '');
    setPhone(r.phone || '');
    setEmail(r.email || '');
    setAddress(r.address || '');
    setDescription(r.description || '');
    setHours(r.hours || {});
    setPrimaryColor(r.branding.primary_color || '#2D5016');
    setSecondaryColor(r.branding.secondary_color || '#F5F0E8');
    setAccentColor(r.branding.accent_color || '#8B4513');
    setFontFamily(r.branding.font_family || 'DM Sans');
    setLogoUrl(r.branding.logo_url || '');
    setNotificationsEnabled(r.notifications_enabled || false);
    setWebhookUrl(r.webhook_url || '');
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const data = await adminApi.updateRestaurant({
        name,
        phone,
        email,
        address,
        description,
        hours,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        font_family: fontFamily,
        logo_url: logoUrl || null,
        notifications_enabled: notificationsEnabled,
        webhook_url: webhookUrl || null,
      } as Partial<AdminRestaurant> & { hours: Record<string, unknown> });
      setRestaurant(data);
      onRestaurantUpdate?.(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (restaurant) populateForm(restaurant);
  };

  const updateDayHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleStripeConnect = async () => {
    setStripeConnecting(true);
    try {
      const returnUrl = `${window.location.origin}/admin`;
      const refreshUrl = `${window.location.origin}/admin`;
      const result = await adminApi.connectStripe(returnUrl, refreshUrl);
      window.location.href = result.url;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to initiate Stripe Connect');
    } finally {
      setStripeConnecting(false);
    }
  };

  // Live branding preview
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', primaryColor);
    root.style.setProperty('--brand-secondary', secondaryColor);
    root.style.setProperty('--brand-accent', accentColor);
    if (fontFamily) root.style.setProperty('--brand-font', `'${fontFamily}', sans-serif`);
  }, [primaryColor, secondaryColor, accentColor, fontFamily]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-7 w-48" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 p-4 border border-border-default rounded-[var(--radius-lg)]">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">Restaurant Settings</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 text-text-secondary bg-surface-elevated rounded-[var(--radius-md)] text-sm font-medium hover:text-text-primary transition-colors touch-target"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-[var(--radius-md)] font-medium text-sm transition-all hover:opacity-90 active:opacity-80 disabled:opacity-50 touch-target"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? 'Saved' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* ── Contact Info ────────────────────────────────────────────── */}
      <Section title="Contact Information">
        <FormField label="Restaurant Name" icon={<MapPin className="w-4 h-4" />}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
        </FormField>
        <FormField label="Phone" icon={<Phone className="w-4 h-4" />}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
          />
        </FormField>
        <FormField label="Email" icon={<Mail className="w-4 h-4" />}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
        </FormField>
        <FormField label="Address" icon={<MapPin className="w-4 h-4" />}>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input-field"
          />
        </FormField>
        <FormField label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-field resize-none"
          />
        </FormField>
      </Section>

      {/* ── Business Hours ──────────────────────────────────────────── */}
      <Section title="Business Hours" icon={<Clock className="w-5 h-5" />}>
        <div className="space-y-3">
          {DAYS.map(({ key, label }) => {
            const dayHours = hours[key] || {};
            const isClosed = dayHours.closed === true;

            return (
              <div
                key={key}
                className={`flex items-center gap-3 text-sm ${isClosed ? 'opacity-50' : ''}`}
              >
                <span className="w-24 font-medium text-text-primary shrink-0">{label}</span>
                <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isClosed}
                    onChange={(e) => updateDayHours(key, 'closed', e.target.checked)}
                    className="accent-[var(--brand-primary)]"
                  />
                  <span className="text-xs text-text-muted">Closed</span>
                </label>
                {!isClosed && (
                  <>
                    <input
                      type="time"
                      value={dayHours.open || '06:00'}
                      onChange={(e) => updateDayHours(key, 'open', e.target.value)}
                      className="px-2 py-1.5 bg-surface-elevated border border-border-default rounded-[var(--radius-sm)] text-sm focus:outline-none focus:border-brand"
                    />
                    <span className="text-text-muted">to</span>
                    <input
                      type="time"
                      value={dayHours.close || '18:00'}
                      onChange={(e) => updateDayHours(key, 'close', e.target.value)}
                      className="px-2 py-1.5 bg-surface-elevated border border-border-default rounded-[var(--radius-sm)] text-sm focus:outline-none focus:border-brand"
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* ── Notifications ───────────────────────────────────────────── */}
      <Section title="Notifications" icon={<Bell className="w-5 h-5" />}>
        <div className="space-y-4">
          {/* Master toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Enable Notifications</p>
              <p className="text-xs text-text-muted mt-0.5">Send email confirmations and webhook events for new orders</p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
                notificationsEnabled ? 'bg-brand' : 'bg-neutral-300'
              }`}
              role="switch"
              aria-checked={notificationsEnabled}
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md"
                animate={{ x: notificationsEnabled ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          <AnimatePresence>
            {notificationsEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="space-y-4 pt-2">
                  {/* Email status */}
                  <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-elevated">
                    <Mail className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">Email Confirmations</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Customers receive an order confirmation email when they place an order.
                      </p>
                      {restaurant?.smtp_configured ? (
                        <p className="flex items-center gap-1 text-xs text-success mt-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          SMTP configured
                        </p>
                      ) : (
                        <p className="flex items-center gap-1 text-xs text-warning mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          SMTP not configured (set SMTP_HOST env var)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SMS status */}
                  <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-surface-elevated">
                    <MessageSquare className="w-4 h-4 text-text-muted mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text-primary">SMS Notifications</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        Customers receive an SMS when their order is marked as ready.
                      </p>
                      {restaurant?.sms_configured ? (
                        <p className="flex items-center gap-1 text-xs text-success mt-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Twilio configured
                        </p>
                      ) : (
                        <p className="flex items-center gap-1 text-xs text-warning mt-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Twilio not configured (set TWILIO_ACCOUNT_SID env var)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Webhook URL */}
                  <FormField label="Webhook URL (optional)" icon={<Globe className="w-4 h-4" />}>
                    <input
                      type="url"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder="https://hooks.example.com/orders"
                      className="input-field"
                    />
                    <p className="text-xs text-text-muted mt-1">
                      Receive a POST request with order data when new orders arrive.
                    </p>
                  </FormField>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>

      {/* ── Stripe Connect ──────────────────────────────────────────── */}
      <Section title="Payment Processing" icon={<CreditCard className="w-5 h-5" />}>
        {stripeLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !stripeStatus?.configured ? (
          <div className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] bg-surface-elevated">
            <AlertCircle className="w-5 h-5 text-text-muted shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-text-primary">Payment processing not configured</p>
              <p className="text-xs text-text-muted mt-1">
                Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY environment variables to enable payment processing.
              </p>
            </div>
          </div>
        ) : stripeStatus.onboarding_complete ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] bg-success/10">
              <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Stripe Connected</p>
                <p className="text-xs text-text-muted mt-1">
                  Payments are being processed through your Stripe account.
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                  {stripeStatus.account_id && (
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <Link2 className="w-3 h-3" />
                      Account: {stripeStatus.account_id}
                    </p>
                  )}
                  {stripeStatus.charges_enabled && (
                    <p className="text-xs text-success flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Charges enabled
                    </p>
                  )}
                  {stripeStatus.payouts_enabled && (
                    <p className="text-xs text-success flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Payouts enabled
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : stripeStatus.connected ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-[var(--radius-md)] bg-warning/10">
              <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">Onboarding Incomplete</p>
                <p className="text-xs text-text-muted mt-1">
                  Your Stripe account is connected but onboarding is not yet complete. Complete the setup to start accepting payments.
                </p>
              </div>
            </div>
            <button
              onClick={handleStripeConnect}
              disabled={stripeConnecting}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-[var(--radius-md)] font-medium text-sm transition-all hover:opacity-90 active:opacity-80 disabled:opacity-50 touch-target"
            >
              {stripeConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              Continue Stripe Setup
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Connect your Stripe account to receive payments directly. A small platform fee is deducted from each transaction.
            </p>
            <button
              onClick={handleStripeConnect}
              disabled={stripeConnecting}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#635BFF] text-white rounded-[var(--radius-md)] font-medium text-sm transition-all hover:opacity-90 active:opacity-80 disabled:opacity-50 touch-target"
            >
              {stripeConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Connect with Stripe
            </button>
          </div>
        )}
      </Section>

      {/* ── Branding ────────────────────────────────────────────────── */}
      <Section title="Branding" icon={<Palette className="w-5 h-5" />}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ColorField label="Primary" value={primaryColor} onChange={setPrimaryColor} />
          <ColorField label="Secondary" value={secondaryColor} onChange={setSecondaryColor} />
          <ColorField label="Accent" value={accentColor} onChange={setAccentColor} />
        </div>

        <FormField label="Font Family">
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="input-field"
          >
            <option value="DM Sans">DM Sans</option>
            <option value="Outfit">Outfit</option>
            <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
            <option value="Space Grotesk">Space Grotesk</option>
            <option value="Sora">Sora</option>
            <option value="General Sans">General Sans</option>
          </select>
        </FormField>

        <FormField label="Logo URL" icon={<Image className="w-4 h-4" />}>
          <input
            type="url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://..."
            className="input-field"
          />
        </FormField>

        {/* Live Preview */}
        <div className="mt-4 p-4 rounded-[var(--radius-lg)] border border-border-default">
          <p className="text-xs text-text-muted mb-3 uppercase tracking-wider font-semibold">
            Live Preview
          </p>
          <div className="space-y-3">
            {/* Header preview */}
            <div
              className="rounded-[var(--radius-md)] p-4"
              style={{ backgroundColor: primaryColor, color: '#fff' }}
            >
              <div className="flex items-center gap-3">
                {logoUrl && (
                  <img src={logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-contain bg-white/10" />
                )}
                <div>
                  <h3 className="font-bold text-lg" style={{ fontFamily: `'${fontFamily}', sans-serif` }}>
                    {name || 'Restaurant Name'}
                  </h3>
                  <p className="text-sm opacity-80">{address || '123 Main St'}</p>
                </div>
              </div>
            </div>
            {/* Button preview */}
            <div className="flex gap-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-[var(--radius-md)] text-white text-sm font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Primary Button
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium"
                style={{ backgroundColor: secondaryColor, color: primaryColor }}
              >
                Secondary
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="px-4 py-2 rounded-[var(--radius-md)] text-white text-sm font-medium"
                style={{ backgroundColor: accentColor }}
              >
                Accent
              </motion.button>
            </div>
          </div>
        </div>
      </Section>

      {/* Locations */}
      {locations.length > 0 && (
        <Section title="Locations" icon={<MapPin className="w-4 h-4" />}>
          <p className="text-sm text-text-secondary">
            Set a Google Maps embed URL for each location. Copy it from Google Maps &rarr; Share &rarr; Embed a map &rarr; the <code>src=</code> value.
          </p>
          <div className="space-y-4">
            {locations.map((loc) => (
              <div key={loc.id} className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
                  <MapPin className="w-4 h-4" />
                  {loc.name} — Google Maps Embed URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={locationMapUrls[loc.id] ?? ''}
                    onChange={(e) =>
                      setLocationMapUrls((prev) => ({ ...prev, [loc.id]: e.target.value }))
                    }
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className="input-field flex-1"
                  />
                  <button
                    type="button"
                    disabled={locationSaving[loc.id]}
                    onClick={async () => {
                      setLocationSaving((prev) => ({ ...prev, [loc.id]: true }));
                      try {
                        const updated = await adminApi.updateLocation(restaurant?.slug ?? '', loc.id, {
                          map_url: locationMapUrls[loc.id] || null,
                        });
                        setLocations((prev) =>
                          prev.map((l) => (l.id === loc.id ? updated : l))
                        );
                        setLocationSaved((prev) => ({ ...prev, [loc.id]: true }));
                        setTimeout(
                          () => setLocationSaved((prev) => ({ ...prev, [loc.id]: false })),
                          2000
                        );
                      } catch (err) {
                        console.error('Failed to update location:', err);
                      } finally {
                        setLocationSaving((prev) => ({ ...prev, [loc.id]: false }));
                      }
                    }}
                    className="px-3 py-2 rounded-[var(--radius-md)] bg-brand text-white text-sm font-medium flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {locationSaving[loc.id] ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : locationSaved[loc.id] ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border-default rounded-[var(--radius-lg)] p-4 space-y-4"
    >
      <h3 className="flex items-center gap-2 font-semibold text-text-primary">
        {icon}
        {title}
      </h3>
      {children}
    </motion.section>
  );
}

function FormField({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-text-secondary">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-text-secondary">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-[var(--radius-sm)] border border-border-default cursor-pointer bg-transparent p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm bg-surface-elevated border border-border-default rounded-[var(--radius-md)] font-mono focus:outline-none focus:border-brand"
        />
      </div>
    </div>
  );
}
