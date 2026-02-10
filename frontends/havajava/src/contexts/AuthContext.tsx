/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';

interface AuthContextType {
  getToken: () => Promise<string | null>;
  isSignedIn: boolean;
  isLoading: boolean;
  userId: string | null;
  userEmail: string | null;
  userName: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Check if Clerk is configured
const clerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Provider for Clerk auth
function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn, isLoaded, userId } = useClerkAuth();
  const { user } = useUser();

  const wrappedGetToken = useCallback(async () => {
    try {
      return await getToken();
    } catch {
      return null;
    }
  }, [getToken]);

  const value: AuthContextType = {
    getToken: wrappedGetToken,
    isSignedIn: isSignedIn ?? false,
    isLoading: !isLoaded,
    userId: userId ?? null,
    userEmail: user?.primaryEmailAddress?.emailAddress ?? null,
    userName: user?.fullName ?? user?.firstName ?? null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Provider for token-based auth (fallback)
function TokenAuthProvider({ children }: { children: ReactNode }) {
  const getToken = useCallback(async () => {
    return localStorage.getItem('admin_token');
  }, []);

  const value: AuthContextType = {
    getToken,
    isSignedIn: !!localStorage.getItem('admin_token'),
    isLoading: false,
    userId: null,
    userEmail: null,
    userName: null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  if (clerkEnabled) {
    return <ClerkAuthProvider>{children}</ClerkAuthProvider>;
  }
  return <TokenAuthProvider>{children}</TokenAuthProvider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Global token getter for use outside React components
let globalGetToken: (() => Promise<string | null>) | null = null;

export function setGlobalTokenGetter(getter: () => Promise<string | null>) {
  globalGetToken = getter;
}

export function getGlobalToken(): Promise<string | null> {
  if (globalGetToken) {
    return globalGetToken();
  }
  // Fallback to localStorage token
  return Promise.resolve(localStorage.getItem('admin_token'));
}
