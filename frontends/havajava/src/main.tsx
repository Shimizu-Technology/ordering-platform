import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import './index.css';
import App from './App';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Clerk is optional - if not configured, admin uses token-based auth
const AppWithAuth = clerkPubKey ? (
  <ClerkProvider publishableKey={clerkPubKey}>
    <App />
  </ClerkProvider>
) : (
  <App />
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {AppWithAuth}
  </StrictMode>
);
