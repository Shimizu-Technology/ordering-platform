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

export const api = {
  getRestaurant: (slug: string) =>
    request<import('../types').Restaurant>(`/restaurants/${slug}`),

  getMenu: (slug: string) =>
    request<import('../types').MenuResponse>(`/restaurants/${slug}/menu`),

  createOrder: (slug: string, order: import('../types').OrderPayload) =>
    request<import('../types').Order>(`/restaurants/${slug}/orders`, {
      method: 'POST',
      body: JSON.stringify({ order }),
    }),

  getOrder: (slug: string, orderId: number) =>
    request<import('../types').Order>(`/restaurants/${slug}/orders/${orderId}`),

  payOrder: (slug: string, orderId: number) =>
    request<{ client_secret: string; payment_intent_id: string; amount: number }>(
      `/restaurants/${slug}/orders/${orderId}/pay`,
      { method: 'POST' }
    ),
};
