import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store,
  Clock,
  Palette,
  UtensilsCrossed,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Check,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  FileText,
  Eye,
} from 'lucide-react';
import { api } from '../api/client';
import type { Restaurant } from '../types';

// ============================================================================
// Step Types
// ============================================================================

interface StepInfo {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const STEPS: StepInfo[] = [
  { id: 1, title: 'Restaurant Basics', description: 'Name, contact & address', icon: Store },
  { id: 2, title: 'Hours & Branding', description: 'Schedule & visual identity', icon: Palette },
  { id: 3, title: 'Menu Setup', description: 'Get your menu started', icon: UtensilsCrossed },
  { id: 4, title: 'Review & Launch', description: 'Preview and go live', icon: Rocket },
];

const DAYS_FULL = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const DAY_LABELS_FULL: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
};

type HoursData = Record<string, { open: string; close: string; closed: boolean }>;

const defaultHours: HoursData = Object.fromEntries(
  DAYS_FULL.map((day) => [day, {
    open: day === 'sunday' ? '10:00' : '08:00',
    close: day === 'sunday' ? '17:00' : '20:00',
    closed: false,
  }])
) as HoursData;

export function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [, setCreatedRestaurant] = useState<Restaurant | null>(null);

  // Step 1 data
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  // Step 2 data
  const [hours, setHours] = useState<HoursData>(defaultHours);
  const [primaryColor, setPrimaryColor] = useState('#2D5016');
  const [secondaryColor, setSecondaryColor] = useState('#F5F0E8');
  const [accentColor, setAccentColor] = useState('#8B4513');

  // Step 3 data
  const [menuTemplate, setMenuTemplate] = useState<'coffee_shop' | 'restaurant' | 'blank'>('coffee_shop');

  const generatedSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 1: return name.trim().length >= 2;
      case 2: return true;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  }, [currentStep, name]);

  const goNext = () => {
    if (!canProceed()) return;
    setDirection(1);
    setCurrentStep((s) => Math.min(s + 1, 4));
    setError(null);
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep((s) => Math.max(s - 1, 1));
    setError(null);
  };

  const handleLaunch = async () => {
    setSaving(true);
    setError(null);

    try {
      // Step 1: Create restaurant
      const restaurant = await api.createRestaurant({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        description: description.trim() || undefined,
      });

      setCreatedRestaurant(restaurant);

      // Step 2: Complete setup
      const hoursPayload: Record<string, { open?: string; close?: string; closed?: boolean }> = {};
      for (const [day, data] of Object.entries(hours)) {
        if (data.closed) {
          hoursPayload[day] = { closed: true };
        } else {
          hoursPayload[day] = { open: data.open, close: data.close };
        }
      }

      await api.setupRestaurant(restaurant.slug, {
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        hours: hoursPayload,
      });

      // Navigate to admin dashboard
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create restaurant');
    } finally {
      setSaving(false);
    }
  };

  const updateDayHours = (day: string, field: 'open' | 'close', value: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const toggleDayClosed = (day: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed },
    }));
  };

  const stepVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (d: number) => ({
      x: d > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="bg-surface-card border-b border-border-default px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-bold text-text-primary">Create Your Restaurant</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Set up your online ordering in minutes
          </p>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-surface-card border-b border-border-default px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isComplete
                        ? 'bg-success text-white'
                        : isActive
                          ? 'bg-brand text-white'
                          : 'bg-surface-elevated text-text-muted'
                    }`}>
                      {isComplete ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs mt-1 font-medium hidden sm:block ${
                      isActive ? 'text-brand' : isComplete ? 'text-success' : 'text-text-muted'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                      isComplete ? 'bg-success' : 'bg-border-default'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 sm:hidden text-center">
            <span className="text-sm font-medium text-text-primary">
              Step {currentStep}: {STEPS[currentStep - 1].title}
            </span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 mb-4 bg-error/10 text-error text-sm rounded-[var(--radius-md)]"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {currentStep === 1 && (
                <Step1Basics
                  name={name} setName={setName}
                  phone={phone} setPhone={setPhone}
                  email={email} setEmail={setEmail}
                  address={address} setAddress={setAddress}
                  description={description} setDescription={setDescription}
                  slug={generatedSlug}
                />
              )}
              {currentStep === 2 && (
                <Step2HoursBranding
                  hours={hours}
                  updateDayHours={updateDayHours}
                  toggleDayClosed={toggleDayClosed}
                  primaryColor={primaryColor} setPrimaryColor={setPrimaryColor}
                  secondaryColor={secondaryColor} setSecondaryColor={setSecondaryColor}
                  accentColor={accentColor} setAccentColor={setAccentColor}
                />
              )}
              {currentStep === 3 && (
                <Step3Menu
                  template={menuTemplate}
                  setTemplate={setMenuTemplate}
                />
              )}
              {currentStep === 4 && (
                <Step4Review
                  name={name}
                  slug={generatedSlug}
                  phone={phone}
                  email={email}
                  address={address}
                  hours={hours}
                  primaryColor={primaryColor}
                  secondaryColor={secondaryColor}
                  accentColor={accentColor}
                  template={menuTemplate}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-surface-card border-t border-border-default px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-text-secondary bg-surface-elevated rounded-[var(--radius-md)] hover:bg-border-default transition-colors touch-target disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {currentStep < 4 ? (
            <button
              onClick={goNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-brand rounded-[var(--radius-md)] hover:bg-brand-hover transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleLaunch}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-success rounded-[var(--radius-md)] hover:bg-success/90 transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Rocket className="w-4 h-4" />
              {saving ? 'Launching...' : 'Launch Restaurant'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step 1: Restaurant Basics
// ============================================================================

function Step1Basics({
  name, setName, phone, setPhone, email, setEmail,
  address, setAddress, description, setDescription, slug,
}: {
  name: string; setName: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  address: string; setAddress: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  slug: string;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Tell us about your restaurant</h2>
        <p className="text-sm text-text-secondary mt-1">
          Start with the basics. You can always update these later.
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1.5">
          <Store className="w-4 h-4 text-text-secondary" />
          Restaurant Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., HavaJava Coffee"
          className="input-field"
          autoFocus
        />
        {slug && (
          <p className="text-xs text-text-muted mt-1.5">
            Your URL: <span className="font-mono text-brand">yourdomain.com/{slug}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1.5">
            <Phone className="w-4 h-4 text-text-secondary" />
            Phone
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(671) 555-0123"
            className="input-field"
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1.5">
            <Mail className="w-4 h-4 text-text-secondary" />
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="info@restaurant.com"
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1.5">
          <MapPin className="w-4 h-4 text-text-secondary" />
          Address
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Main St, Hagåtña, GU 96910"
          className="input-field"
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1.5">
          <FileText className="w-4 h-4 text-text-secondary" />
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell your customers what makes your place special..."
          className="input-field min-h-[80px] resize-none"
          rows={3}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Step 2: Hours & Branding
// ============================================================================

function Step2HoursBranding({
  hours, updateDayHours, toggleDayClosed,
  primaryColor, setPrimaryColor,
  secondaryColor, setSecondaryColor,
  accentColor, setAccentColor,
}: {
  hours: HoursData;
  updateDayHours: (day: string, field: 'open' | 'close', value: string) => void;
  toggleDayClosed: (day: string) => void;
  primaryColor: string; setPrimaryColor: (v: string) => void;
  secondaryColor: string; setSecondaryColor: (v: string) => void;
  accentColor: string; setAccentColor: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Hours & Branding</h2>
        <p className="text-sm text-text-secondary mt-1">
          Set your operating hours and brand colors.
        </p>
      </div>

      {/* Operating Hours */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
          <Clock className="w-4 h-4 text-text-secondary" />
          Operating Hours
        </h3>
        <div className="space-y-2">
          {DAYS_FULL.map((day) => {
            const d = hours[day];
            return (
              <div key={day} className="flex items-center gap-3 py-2">
                <span className="w-20 text-sm font-medium text-text-primary shrink-0">
                  {DAY_LABELS_FULL[day]}
                </span>
                <button
                  onClick={() => toggleDayClosed(day)}
                  className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
                    !d.closed ? 'bg-brand' : 'bg-border-default'
                  }`}
                  aria-label={d.closed ? 'Open this day' : 'Close this day'}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    !d.closed ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`} />
                </button>
                {d.closed ? (
                  <span className="text-sm text-text-muted italic">Closed</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={d.open}
                      onChange={(e) => updateDayHours(day, 'open', e.target.value)}
                      className="input-field !py-1.5 !text-sm w-[120px]"
                    />
                    <span className="text-text-muted text-sm">to</span>
                    <input
                      type="time"
                      value={d.close}
                      onChange={(e) => updateDayHours(day, 'close', e.target.value)}
                      className="input-field !py-1.5 !text-sm w-[120px]"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Brand Colors */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
          <Palette className="w-4 h-4 text-text-secondary" />
          Brand Colors
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <ColorPicker label="Primary" value={primaryColor} onChange={setPrimaryColor} />
          <ColorPicker label="Secondary" value={secondaryColor} onChange={setSecondaryColor} />
          <ColorPicker label="Accent" value={accentColor} onChange={setAccentColor} />
        </div>

        {/* Preview swatch */}
        <div className="mt-4 p-4 rounded-[var(--radius-lg)] border border-border-default"
          style={{ backgroundColor: secondaryColor }}>
          <div className="h-8 rounded-[var(--radius-md)] mb-2" style={{ backgroundColor: primaryColor }} />
          <div className="h-4 w-2/3 rounded-[var(--radius-sm)]" style={{ backgroundColor: accentColor }} />
        </div>
      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-text-secondary mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-[var(--radius-md)] border border-border-default cursor-pointer touch-target"
          style={{ padding: 0 }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field !py-1.5 font-mono text-xs flex-1"
        />
      </div>
    </div>
  );
}

// ============================================================================
// Step 3: Menu Setup
// ============================================================================

function Step3Menu({
  template,
  setTemplate,
}: {
  template: string;
  setTemplate: (v: 'coffee_shop' | 'restaurant' | 'blank') => void;
}) {
  const templates = [
    {
      id: 'coffee_shop' as const,
      title: 'Coffee Shop',
      description: 'Start with beverages, pastries, and light bites',
      categories: ['Hot Drinks', 'Cold Drinks', 'Pastries', 'Sandwiches'],
    },
    {
      id: 'restaurant' as const,
      title: 'Restaurant',
      description: 'Appetizers, entrees, desserts, and drinks',
      categories: ['Appetizers', 'Entrees', 'Desserts', 'Beverages'],
    },
    {
      id: 'blank' as const,
      title: 'Start Fresh',
      description: 'Begin with default categories: Beverages, Food, Specials',
      categories: ['Beverages', 'Food', 'Specials'],
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Menu Setup</h2>
        <p className="text-sm text-text-secondary mt-1">
          Choose a starting template. You can customize everything after launch.
        </p>
      </div>

      <div className="space-y-3">
        {templates.map((t) => {
          const isSelected = template === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              className={`w-full text-left p-4 rounded-[var(--radius-lg)] border-2 transition-all touch-target ${
                isSelected
                  ? 'border-brand bg-brand/5'
                  : 'border-border-default bg-surface-card hover:border-brand/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">{t.title}</h3>
                  <p className="text-sm text-text-secondary mt-0.5">{t.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {t.categories.map((cat) => (
                      <span key={cat} className="px-2 py-0.5 text-xs font-medium bg-surface-elevated text-text-secondary rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                  isSelected ? 'border-brand bg-brand' : 'border-border-default'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// Step 4: Review & Launch
// ============================================================================

function Step4Review({
  name, slug, phone, email, address,
  hours, primaryColor, secondaryColor, accentColor, template,
}: {
  name: string; slug: string; phone: string; email: string; address: string;
  hours: HoursData; primaryColor: string; secondaryColor: string; accentColor: string;
  template: string;
}) {
  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const openDays = Object.entries(hours).filter(([, v]) => !v.closed);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Review & Launch</h2>
        <p className="text-sm text-text-secondary mt-1">
          Everything looks good? Hit launch to go live!
        </p>
      </div>

      {/* Preview Card */}
      <div className="rounded-[var(--radius-xl)] overflow-hidden border border-border-default shadow-sm">
        {/* Mock restaurant header */}
        <div className="p-5" style={{ backgroundColor: primaryColor }}>
          <h3 className="text-xl font-bold text-white">{name || 'Your Restaurant'}</h3>
          {address && (
            <div className="flex items-center gap-1.5 text-white/80 text-sm mt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{address}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center gap-1.5 text-white/80 text-sm mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              <span>{phone}</span>
            </div>
          )}
        </div>

        {/* Preview label */}
        <div className="flex items-center gap-2 px-5 py-2 bg-surface-elevated">
          <Eye className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-xs text-text-muted font-medium">Preview of your ordering page</span>
        </div>

        {/* Mock menu */}
        <div className="p-5 space-y-3" style={{ backgroundColor: secondaryColor }}>
          {['Featured Item', 'Popular Choice', 'Chef Special'].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-[var(--radius-md)]">
              <div>
                <div className="font-medium text-sm" style={{ color: primaryColor }}>{item}</div>
                <div className="text-xs text-text-muted mt-0.5">Delicious description here</div>
              </div>
              <span className="text-sm font-semibold" style={{ color: accentColor }}>
                ${(5.99 + i * 3).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-3">
        <div className="bg-surface-card rounded-[var(--radius-lg)] border border-border-default p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">URL</span>
            <span className="font-mono text-brand text-sm">/{slug}</span>
          </div>
          {email && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Email</span>
              <span className="text-text-primary">{email}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Template</span>
            <span className="text-text-primary capitalize">{template.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Open Days</span>
            <span className="text-text-primary">{openDays.length} / 7</span>
          </div>
          {openDays.length > 0 && (
            <div className="pt-2 border-t border-border-subtle space-y-1">
              {openDays.map(([day, data]) => (
                <div key={day} className="flex justify-between text-xs text-text-secondary">
                  <span className="capitalize">{day}</span>
                  <span>{formatTime(data.open)} – {formatTime(data.close)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
