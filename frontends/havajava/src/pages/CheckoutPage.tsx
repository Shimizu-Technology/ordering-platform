import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {
  ArrowLeft, User, Phone, Mail, MessageSquare,
  Store, UtensilsCrossed, ShieldCheck, Bookmark,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PaymentForm } from '../components/PaymentForm';
import { useCartStore } from '../stores/cartStore';
import { useRestaurantStore } from '../stores/restaurantStore';
import { useCustomerStore } from '../stores/customerStore';
import { formatPrice, calculateItemTotal } from '../utils/price';
import { api } from '../api/client';
import { toast } from '../components/ui/Toast';
import { pageTransition, pageTransitionConfig } from '../utils/motion';
import type { OrderPayload, Order } from '../types';

// Initialize Stripe (only if key is available)
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

interface CheckoutPageProps {
  slug: string;
}

export function CheckoutPage({ slug }: CheckoutPageProps) {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCartStore();
  const { loadRestaurant } = useRestaurantStore();
  const { savedInfo, saveEnabled, setSaveEnabled, updateFromCustomer } = useCustomerStore();

  const [name, setName] = useState(savedInfo?.name ?? '');
  const [phone, setPhone] = useState(savedInfo?.phone ?? '');
  const [email, setEmail] = useState(savedInfo?.email ?? '');
  const [saveInfo, setSaveInfo] = useState(saveEnabled);
  const [orderType, setOrderType] = useState<'pickup' | 'dine_in'>('pickup');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Payment state
  const [showPayment, setShowPayment] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Check if Stripe is configured
  const stripeEnabled = !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

  useEffect(() => {
    loadRestaurant(slug);
  }, [slug, loadRestaurant]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !pendingOrder) {
      navigate(`/${slug}`, { replace: true });
    }
  }, [items.length, navigate, slug, pendingOrder]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Invalid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      // Create/lookup customer if saving info
      let customerId: number | undefined;
      if (saveInfo && email.trim()) {
        try {
          const customer = await api.createCustomer(slug, {
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
          });
          customerId = customer.id;
          updateFromCustomer(customer);
          setSaveEnabled(true);
        } catch {
          // Non-critical; continue with order
        }
      } else if (!saveInfo) {
        setSaveEnabled(false);
      }

      const payload: OrderPayload = {
        customer_name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        order_type: orderType,
        special_instructions: instructions.trim() || undefined,
        customer_id: customerId,
        items: items.map((cartItem) => ({
          menu_item_id: cartItem.menuItem.id,
          quantity: cartItem.quantity,
          special_instructions: cartItem.specialInstructions || undefined,
          modifier_ids: cartItem.selectedModifiers.map((sm) => sm.modifier.id),
        })),
      };

      // Create the order
      const order = await api.createOrder(slug, payload);
      setPendingOrder(order);

      // If Stripe is enabled, get payment intent
      if (stripeEnabled && order.total > 0) {
        try {
          const paymentData = await api.payOrder(slug, order.id);
          setClientSecret(paymentData.client_secret);
          setShowPayment(true);
        } catch {
          // Payment setup failed - order is still created
          toast.error('Payment setup failed. Please try again or pay at counter.');
          clearCart();
          navigate(`/${slug}/confirmation/${order.id}`, { replace: true });
        }
      } else {
        // No payment needed (free order or Stripe not configured)
        clearCart();
        navigate(`/${slug}/confirmation/${order.id}`, { replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    if (pendingOrder) {
      clearCart();
      navigate(`/${slug}/confirmation/${pendingOrder.id}`, { replace: true });
    }
  };

  const handlePaymentCancel = () => {
    // Cancel the payment flow - order remains pending
    setShowPayment(false);
    setClientSecret(null);
    toast.info('Payment cancelled. You can pay at the counter.');
    if (pendingOrder) {
      clearCart();
      navigate(`/${slug}/confirmation/${pendingOrder.id}`, { replace: true });
    }
  };

  // Stripe Elements appearance
  const stripeAppearance = useMemo(() => ({
    theme: 'stripe' as const,
    variables: {
      colorPrimary: 'var(--brand-primary)',
      colorBackground: 'var(--surface-card)',
      colorText: 'var(--text-primary)',
      colorDanger: 'var(--error)',
      fontFamily: 'system-ui, sans-serif',
      borderRadius: '8px',
    },
  }), []);

  return (
    <motion.div
      className="min-h-screen bg-surface"
      {...pageTransition}
      transition={pageTransitionConfig}
    >
      {/* Payment Modal */}
      <AnimatePresence>
        {showPayment && clientSecret && pendingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && handlePaymentCancel()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md"
            >
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: stripeAppearance,
                }}
              >
                <PaymentForm
                  amount={pendingOrder.total}
                  orderId={pendingOrder.id}
                  onSuccess={handlePaymentSuccess}
                  onCancel={handlePaymentCancel}
                />
              </Elements>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-sm border-b border-border-default">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(`/${slug}`)}
            className="p-2 -ml-2 rounded-full hover:bg-surface-elevated transition-colors touch-target"
            aria-label="Back to menu"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="text-lg font-bold text-text-primary">Checkout</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-6 max-w-lg mx-auto pb-8">
        {/* Order Type Toggle */}
        <fieldset>
          <legend className="block text-sm font-semibold text-text-primary mb-2.5">
            Order Type
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'pickup' as const, label: 'Pickup', icon: Store },
              { value: 'dine_in' as const, label: 'Dine In', icon: UtensilsCrossed },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setOrderType(value)}
                className={`
                  flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium
                  rounded-[var(--radius-md)] border-2 transition-all duration-[var(--duration-fast)]
                  touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40
                  ${orderType === value
                    ? 'bg-brand text-white border-brand shadow-sm shadow-brand/15'
                    : 'bg-surface-card text-text-secondary border-border-default hover:border-brand/30 hover:text-text-primary'
                  }
                `}
                aria-pressed={orderType === value}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Customer Info */}
        <fieldset className="space-y-3">
          <legend className="block text-sm font-semibold text-text-primary mb-2.5">
            Your Info
          </legend>

          <div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                placeholder="Name *"
                required
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className={`w-full pl-10 pr-3 py-3 text-sm border rounded-[var(--radius-md)] bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors ${
                  errors.name ? 'border-error' : 'border-border-default'
                }`}
              />
            </div>
            {errors.name && (
              <p id="name-error" className="mt-1 text-xs text-error">{errors.name}</p>
            )}
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (for order updates)"
              className="w-full pl-10 pr-3 py-3 text-sm border border-border-default rounded-[var(--radius-md)] bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            />
          </div>

          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })); }}
                placeholder="Email (for receipt)"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full pl-10 pr-3 py-3 text-sm border rounded-[var(--radius-md)] bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors ${
                  errors.email ? 'border-error' : 'border-border-default'
                }`}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-error">{errors.email}</p>
            )}
          </div>
        </fieldset>

        {/* Save Info Checkbox */}
        {email.trim() && (
          <label className="flex items-center gap-3 px-4 py-3 bg-surface-elevated rounded-[var(--radius-md)] cursor-pointer touch-target">
            <input
              type="checkbox"
              checked={saveInfo}
              onChange={(e) => setSaveInfo(e.target.checked)}
              className="w-5 h-5 rounded border-border-default text-brand focus:ring-brand/30 accent-[var(--brand-primary)]"
            />
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Bookmark className="w-4 h-4" />
              Save my info for faster checkout next time
            </div>
          </label>
        )}

        {/* Special Instructions */}
        <div>
          <label htmlFor="checkout-instructions" className="block text-sm font-semibold text-text-primary mb-2.5">
            Special Instructions
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3.5 w-4 h-4 text-text-muted" />
            <textarea
              id="checkout-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Any special requests for the restaurant..."
              rows={2}
              className="w-full pl-10 pr-3 py-3 text-sm border border-border-default rounded-[var(--radius-md)] bg-surface-card resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-surface-elevated rounded-[var(--radius-lg)] p-4">
          <h3 className="text-sm font-bold text-text-primary mb-3">Order Summary</h3>
          <div className="space-y-2.5">
            {items.map((cartItem) => {
              const itemTotal = calculateItemTotal(
                cartItem.menuItem.base_price,
                cartItem.selectedModifiers.map((sm) => sm.modifier),
                cartItem.quantity
              );
              return (
                <div key={cartItem.id} className="flex justify-between text-sm gap-3">
                  <div className="flex-1 min-w-0">
                    <span className="text-text-primary">
                      {cartItem.quantity}x {cartItem.menuItem.name}
                    </span>
                    {cartItem.selectedModifiers.length > 0 && (
                      <p className="text-xs text-text-muted mt-0.5 truncate">
                        {cartItem.selectedModifiers.map((sm) => sm.modifier.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="text-text-primary font-medium tabular-nums shrink-0">
                    {formatPrice(itemTotal)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-border-default mt-3 pt-3 flex justify-between items-center">
            <span className="font-bold text-text-primary">Total</span>
            <span className="font-bold text-text-primary text-lg tabular-nums">
              {formatPrice(cartTotal())}
            </span>
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{stripeEnabled ? 'Payments secured by Stripe' : 'Your information is secure'}</span>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
        >
          {stripeEnabled ? `Continue to Payment · ${formatPrice(cartTotal())}` : `Place Order · ${formatPrice(cartTotal())}`}
        </Button>
      </form>
    </motion.div>
  );
}
