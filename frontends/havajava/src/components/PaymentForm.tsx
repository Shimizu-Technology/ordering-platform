import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { formatPrice } from '../utils/price';

interface PaymentFormProps {
  amount: number;
  orderId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaymentForm({ amount, orderId, onSuccess, onCancel }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message ?? 'Payment failed');
        setLoading(false);
        return;
      }

      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}${window.location.pathname}`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message ?? 'Payment failed');
        setLoading(false);
        return;
      }

      // Payment successful!
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-card rounded-lg border border-border-default overflow-hidden">
      {/* Header */}
      <div className="bg-brand/5 border-b border-brand/10 px-4 py-3 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-brand" />
        </div>
        <div>
          <h3 className="font-semibold text-text-primary">Payment</h3>
          <p className="text-sm text-text-secondary">Order #{orderId}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-text-muted">Amount</p>
          <p className="font-bold text-text-primary">{formatPrice(amount)}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />

        {error && (
          <div className="flex items-start gap-2 p-3 bg-error/10 border border-error/20 rounded-md">
            <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Security note */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
          <Lock className="w-3.5 h-3.5" />
          <span>Payments secured by Stripe</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            className="flex-1"
            loading={loading}
            disabled={!stripe || !elements}
          >
            Pay {formatPrice(amount)}
          </Button>
        </div>
      </form>
    </div>
  );
}
