import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Calendar, Users, DollarSign, MapPin,
  Clock, Building2, UtensilsCrossed, MessageSquare,
  Send, CheckCircle, AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import { pageTransition, pageTransitionConfig } from '../utils/motion';

interface CateringPageProps {
  slug: string;
}

interface CateringInfo {
  event_types: string[];
  budget_ranges: string[];
  minimum_lead_days: number;
  locations: { id: number; name: string; address: string }[];
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  wedding: '💒 Wedding',
  corporate: '🏢 Corporate Event',
  party: '🎉 Party / Celebration',
  graduation: '🎓 Graduation',
  funeral: '🕯️ Funeral / Memorial',
  memorial: '🕯️ Memorial Service',
  other: '📋 Other'
};

export function CateringPage({ slug }: CateringPageProps) {
  const navigate = useNavigate();
  const [info, setInfo] = useState<CateringInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [eventType, setEventType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [guestCount, setGuestCount] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [menuPreferences, setMenuPreferences] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');

  useEffect(() => {
    // Fetch catering info
    fetch(`${import.meta.env.VITE_API_URL}/restaurants/${slug}/catering/info`)
      .then(res => res.json())
      .then(setInfo)
      .catch(() => toast.error('Failed to load catering options'));
  }, [slug]);

  // Calculate minimum date (3 days from now)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + (info?.minimum_lead_days || 3));
  const minDateStr = minDate.toISOString().split('T')[0];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!contactName.trim()) errs.contactName = 'Name is required';
    if (!contactEmail.trim()) errs.contactEmail = 'Email is required';
    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      errs.contactEmail = 'Invalid email address';
    }
    if (!eventType) errs.eventType = 'Please select an event type';
    if (!eventDate) errs.eventDate = 'Event date is required';
    if (!guestCount || parseInt(guestCount) <= 0) errs.guestCount = 'Guest count is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/restaurants/${slug}/catering`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inquiry: {
              contact_name: contactName.trim(),
              contact_email: contactEmail.trim(),
              contact_phone: contactPhone.trim() || undefined,
              company_name: companyName.trim() || undefined,
              event_type: eventType,
              event_date: eventDate,
              event_time: eventTime || undefined,
              guest_count: parseInt(guestCount),
              budget_range: budgetRange || undefined,
              venue_address: venueAddress.trim() || undefined,
              menu_preferences: menuPreferences.trim() || undefined,
              special_requests: specialRequests.trim() || undefined,
              dietary_restrictions: dietaryRestrictions.trim() || undefined
            }
          })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.errors?.join(', ') || 'Failed to submit inquiry');
      }

      setSubmitted(true);
      toast.success('Catering inquiry submitted!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        className="min-h-screen bg-surface flex items-center justify-center p-4"
        {...pageTransition}
        transition={pageTransitionConfig}
      >
        <div className="max-w-md text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-success" />
          </motion.div>
          <h1 className="text-2xl font-bold text-text-primary mb-3">
            Thank You!
          </h1>
          <p className="text-text-secondary mb-6">
            We've received your catering inquiry and will get back to you within 24-48 hours
            with a custom quote.
          </p>
          <Button onClick={() => navigate(`/${slug}`)} variant="primary">
            Back to Menu
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-surface"
      {...pageTransition}
      transition={pageTransitionConfig}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 bg-brand text-white">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate(`/${slug}`)}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors touch-target"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Catering Services</h1>
            <p className="text-sm text-white/80">Request a custom quote</p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-brand/5 border-b border-brand/10 px-4 py-6">
        <div className="max-w-lg mx-auto">
          <h2 className="text-xl font-bold text-text-primary mb-2">
            Let Us Cater Your Event
          </h2>
          <p className="text-text-secondary">
            From intimate gatherings to large corporate events, Three Squares brings
            authentic Chamorro cuisine and local favorites to your special occasion.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6 max-w-lg mx-auto pb-8">
        {/* Contact Info */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand" />
            Contact Information
          </legend>

          <div>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Your Name *"
              className={`input-field ${errors.contactName ? 'border-error' : ''}`}
            />
            {errors.contactName && <p className="mt-1 text-xs text-error">{errors.contactName}</p>}
          </div>

          <div>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Email Address *"
              className={`input-field ${errors.contactEmail ? 'border-error' : ''}`}
            />
            {errors.contactEmail && <p className="mt-1 text-xs text-error">{errors.contactEmail}</p>}
          </div>

          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="Phone Number"
            className="input-field"
          />

          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Company / Organization (if applicable)"
            className="input-field"
          />
        </fieldset>

        {/* Event Details */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-brand" />
            Event Details
          </legend>

          <div>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className={`input-field ${errors.eventType ? 'border-error' : ''} ${!eventType ? 'text-text-muted' : ''}`}
            >
              <option value="">Select Event Type *</option>
              {info?.event_types.map(type => (
                <option key={type} value={type}>
                  {EVENT_TYPE_LABELS[type] || type}
                </option>
              ))}
            </select>
            {errors.eventType && <p className="mt-1 text-xs text-error">{errors.eventType}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  min={minDateStr}
                  className={`input-field pl-10 ${errors.eventDate ? 'border-error' : ''}`}
                />
              </div>
              {errors.eventDate && <p className="mt-1 text-xs text-error">{errors.eventDate}</p>}
            </div>

            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="number"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  placeholder="# Guests *"
                  min="1"
                  className={`input-field pl-10 ${errors.guestCount ? 'border-error' : ''}`}
                />
              </div>
              {errors.guestCount && <p className="mt-1 text-xs text-error">{errors.guestCount}</p>}
            </div>

            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              <select
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className={`input-field pl-10 ${!budgetRange ? 'text-text-muted' : ''}`}
              >
                <option value="">Budget Range</option>
                {info?.budget_ranges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-text-muted pointer-events-none" />
            <textarea
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Event Venue Address"
              rows={2}
              className="input-field pl-10 resize-none"
            />
          </div>
        </fieldset>

        {/* Menu Preferences */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand" />
            Menu & Special Requests
          </legend>

          <textarea
            value={menuPreferences}
            onChange={(e) => setMenuPreferences(e.target.value)}
            placeholder="Menu preferences (e.g., 'Local Chamorro dishes', 'Chicken & Waffles for everyone')"
            rows={3}
            className="input-field resize-none"
          />

          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Special requests or notes"
            rows={2}
            className="input-field resize-none"
          />

          <textarea
            value={dietaryRestrictions}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
            placeholder="Dietary restrictions (allergies, vegetarian, gluten-free, etc.)"
            rows={2}
            className="input-field resize-none"
          />
        </fieldset>

        {/* Lead time notice */}
        <div className="flex items-start gap-2.5 p-3 bg-warning/5 rounded-lg border border-warning/10">
          <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary leading-relaxed">
            <strong>Please note:</strong> We require at least 3 days notice for catering orders.
            Some specialty items may require additional lead time.
          </p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Catering Request
        </Button>
      </form>
    </motion.div>
  );
}
