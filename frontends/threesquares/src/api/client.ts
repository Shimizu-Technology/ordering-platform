import type {
  Restaurant,
  Location,
  MenuResponse,
  OrderPayload,
  Order,
  OnboardingRestaurantPayload,
  OnboardingSetupPayload,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const apiClient = {
  getRestaurant: (slug: string) =>
    request<Restaurant>(`/restaurants/${slug}`),

  getMenu: (slug: string) =>
    request<MenuResponse>(`/restaurants/${slug}/menu`),

  getLocations: (slug: string) =>
    request<{ locations: Location[] }>(`/restaurants/${slug}/locations`),

  createOrder: (slug: string, order: OrderPayload) =>
    request<Order>(`/restaurants/${slug}/orders`, {
      method: 'POST',
      body: JSON.stringify({ order }),
    }),

  getOrder: (slug: string, orderId: number) =>
    request<Order>(`/restaurants/${slug}/orders/${orderId}`),

  payOrder: (slug: string, orderId: number) =>
    request<{ client_secret: string; payment_intent_id: string; amount: number }>(
      `/restaurants/${slug}/orders/${orderId}/pay`,
      { method: 'POST' }
    ),

  // ── Onboarding ────────────────────────────────────────────────────
  createRestaurant: (data: OnboardingRestaurantPayload) =>
    request<Restaurant>('/restaurants', {
      method: 'POST',
      body: JSON.stringify({ restaurant: data }),
    }),

  setupRestaurant: (slug: string, data: OnboardingSetupPayload) =>
    request<Restaurant>(`/restaurants/${slug}/setup`, {
      method: 'POST',
      body: JSON.stringify({ restaurant: data }),
    }),

  // ── Customers ────────────────────────────────────────────────────────
  createCustomer: (slug: string, data: import('../types/customer').CreateCustomerPayload) =>
    request<import('../types/customer').Customer>(`/restaurants/${slug}/customers`, {
      method: 'POST',
      body: JSON.stringify({ customer: data }),
    }),

  getCustomerOrders: (slug: string, customerId: number) =>
    request<import('../types/customer').CustomerOrdersResponse>(
      `/restaurants/${slug}/customers/${customerId}/orders`
    ),

  reorder: (slug: string, orderId: number) =>
    request<Order>(`/restaurants/${slug}/orders/${orderId}/reorder`, {
      method: 'POST',
    }),
};

// Alias for backward compatibility
export const api = apiClient;
