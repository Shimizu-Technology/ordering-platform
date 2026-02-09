import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { SignIn, SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';
import { useAdminStore } from '../../stores/adminStore';
import { adminApi } from '../../api/adminClient';

// Check if Clerk is configured
const clerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

interface AdminLoginProps {
  onSuccess: () => void;
}

// Token-based login component
function TokenLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAdminStore((s) => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    setError('');

    localStorage.setItem('admin_token', password);

    try {
      await adminApi.getRestaurant();
      login(password);
      onSuccess();
    } catch {
      localStorage.removeItem('admin_token');
      setError('Invalid admin password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Access</h1>
          <p className="mt-2 text-text-secondary text-sm">
            Enter the admin password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              autoFocus
              className="w-full px-4 py-3 bg-surface-elevated border border-border-default rounded-[var(--radius-md)] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-error"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand text-white rounded-[var(--radius-md)] font-medium transition-all hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// Clerk-based login component
function ClerkLogin({ onSuccess }: AdminLoginProps) {
  const { loaded } = useClerk();
  const login = useAdminStore((s) => s.login);

  // Show loading while Clerk initializes
  if (!loaded) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-brand" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Admin Access</h1>
          <p className="mt-2 text-text-secondary text-sm">
            Sign in with your account to continue
          </p>
        </div>
        
        <SignedOut>
          <SignIn 
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border border-border-default rounded-xl',
                formButtonPrimary: 'bg-brand hover:bg-brand-hover',
              }
            }}
            fallbackRedirectUrl="/admin"
          />
        </SignedOut>
        
        <SignedIn>
          <div className="text-center">
            <p className="text-text-secondary mb-4">You're signed in!</p>
            <button
              onClick={() => {
                login('clerk');
                onSuccess();
              }}
              className="px-6 py-3 bg-brand text-white rounded-lg font-medium"
            >
              Continue to Admin
            </button>
          </div>
        </SignedIn>
      </motion.div>
    </div>
  );
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  // Use Clerk login if configured, otherwise fall back to token-based
  if (clerkEnabled) {
    return <ClerkLogin onSuccess={onSuccess} />;
  }
  return <TokenLogin onSuccess={onSuccess} />;
}
