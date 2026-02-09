import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LandingPage } from './pages/LandingPage';
import { MenuPage } from './pages/MenuPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
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

          {/* Landing page */}
          <Route path="/:slug/home" element={<RestaurantLanding />} />

          {/* Restaurant routes */}
          <Route path="/:slug" element={<RestaurantMenu />} />
          <Route path="/:slug/menu" element={<RestaurantMenu />} />
          <Route path="/:slug/checkout" element={<RestaurantCheckout />} />
          <Route path="/:slug/orders" element={<RestaurantMyOrders />} />
          <Route path="/:slug/track" element={<RestaurantTracking />} />
          <Route path="/:slug/track/:orderId" element={<RestaurantTracking />} />
          <Route path="/:slug/confirmation/:orderId" element={<RestaurantConfirmation />} />

          {/* Default redirect to HavaJava landing */}
          <Route path="/" element={<Navigate to="/havajava/home" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

function RestaurantLanding() {
  const { slug } = useParams<{ slug: string }>();
  return <LandingPage slug={slug!} />;
}

function RestaurantMenu() {
  const { slug } = useParams<{ slug: string }>();
  return <MenuPage slug={slug!} />;
}

function RestaurantCheckout() {
  const { slug } = useParams<{ slug: string }>();
  return <CheckoutPage slug={slug!} />;
}

function RestaurantMyOrders() {
  const { slug } = useParams<{ slug: string }>();
  return <MyOrdersPage slug={slug!} />;
}

function RestaurantConfirmation() {
  const { slug, orderId } = useParams<{ slug: string; orderId: string }>();
  return <ConfirmationPage slug={slug!} orderId={parseInt(orderId!, 10)} />;
}

function RestaurantTracking() {
  const { slug } = useParams<{ slug: string }>();
  return <OrderTrackingPage slug={slug!} />;
}

export default App;
