import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { MenuPage } from './pages/MenuPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ToastContainer } from './components/ui/Toast';
import { AdminPage } from './pages/admin/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <AnimatePresence mode="wait">
        <Routes>
          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminPage />} />

          {/* Onboarding */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* Restaurant routes */}
          <Route path="/:slug" element={<RestaurantMenu />} />
          <Route path="/:slug/checkout" element={<RestaurantCheckout />} />
          <Route path="/:slug/confirmation/:orderId" element={<RestaurantConfirmation />} />

          {/* Default redirect to HavaJava */}
          <Route path="/" element={<Navigate to="/havajava" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

function RestaurantMenu() {
  const { slug } = useParams<{ slug: string }>();
  return <MenuPage slug={slug!} />;
}

function RestaurantCheckout() {
  const { slug } = useParams<{ slug: string }>();
  return <CheckoutPage slug={slug!} />;
}

function RestaurantConfirmation() {
  const { slug, orderId } = useParams<{ slug: string; orderId: string }>();
  return <ConfirmationPage slug={slug!} orderId={parseInt(orderId!, 10)} />;
}

export default App;
