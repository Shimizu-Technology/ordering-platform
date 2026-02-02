import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import type { AdminRestaurant } from '../../types/admin';
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

export function RestaurantSettings() {
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

  const fetchRestaurant = useCallback(async () => {
    try {
      const data = await adminApi.getRestaurant();
      setRestaurant(data);
      populateForm(data);
    } catch (err) {
      console.error('Failed to fetch restaurant:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurant();
  }, [fetchRestaurant]);

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
      } as Partial<AdminRestaurant> & { hours: Record<string, unknown> });
      setRestaurant(data);
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
            <option value="Inter">Inter</option>
            <option value="Outfit">Outfit</option>
            <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
            <option value="Space Grotesk">Space Grotesk</option>
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
