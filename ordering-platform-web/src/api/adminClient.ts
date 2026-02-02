import type {
  OrdersResponse,
  AdminOrder,
  AdminCategory,
  AdminMenuItem,
  AdminModifierGroup,
  AdminModifier,
  AdminRestaurant,
  OrderStatus,
} from '../types/admin';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

function getToken(): string {
  return localStorage.getItem('admin_token') || '';
}

async function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}/admin${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Token': getToken(),
      ...options?.headers,
    },
    ...options,
  });

  if (res.status === 401) {
    localStorage.removeItem('admin_token');
    window.location.href = '/admin';
    throw new Error('Unauthorized');
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const adminApi = {
  // ── Orders ──────────────────────────────────────────────────────────
  getOrders: (params?: { status?: string; search?: string; page?: number; per_page?: number }) => {
    const search = new URLSearchParams();
    if (params?.status) search.set('status', params.status);
    if (params?.search) search.set('search', params.search);
    if (params?.page) search.set('page', String(params.page));
    if (params?.per_page) search.set('per_page', String(params.per_page));
    const qs = search.toString();
    return adminRequest<OrdersResponse>(`/orders${qs ? `?${qs}` : ''}`);
  },

  updateOrderStatus: (orderId: number, status: OrderStatus) =>
    adminRequest<AdminOrder>(`/orders/${orderId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // ── Restaurant ──────────────────────────────────────────────────────
  getRestaurant: () =>
    adminRequest<AdminRestaurant>('/restaurant'),

  updateRestaurant: (data: Partial<AdminRestaurant> & { hours?: Record<string, unknown> }) =>
    adminRequest<AdminRestaurant>('/restaurant', {
      method: 'PATCH',
      body: JSON.stringify({ restaurant: data }),
    }),

  // ── Categories ──────────────────────────────────────────────────────
  getCategories: () =>
    adminRequest<AdminCategory[]>('/categories'),

  createCategory: (data: { name: string; active?: boolean }) =>
    adminRequest<AdminCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify({ category: data }),
    }),

  updateCategory: (id: number, data: Partial<{ name: string; active: boolean; position: number }>) =>
    adminRequest<AdminCategory>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ category: data }),
    }),

  deleteCategory: (id: number) =>
    adminRequest<void>(`/categories/${id}`, { method: 'DELETE' }),

  reorderCategories: (ids: number[]) =>
    adminRequest<void>('/categories/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ ids }),
    }),

  // ── Menu Items ──────────────────────────────────────────────────────
  createMenuItem: (categoryId: number, data: Partial<AdminMenuItem>) =>
    adminRequest<AdminMenuItem>('/menu_items', {
      method: 'POST',
      body: JSON.stringify({ menu_category_id: categoryId, menu_item: data }),
    }),

  updateMenuItem: (id: number, data: Partial<AdminMenuItem>) =>
    adminRequest<AdminMenuItem>(`/menu_items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ menu_item: data }),
    }),

  deleteMenuItem: (id: number) =>
    adminRequest<void>(`/menu_items/${id}`, { method: 'DELETE' }),

  reorderMenuItems: (categoryId: number, ids: number[]) =>
    adminRequest<void>('/menu_items/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ menu_category_id: categoryId, ids }),
    }),

  // ── Modifier Groups ─────────────────────────────────────────────────
  createModifierGroup: (menuItemId: number, data: Partial<AdminModifierGroup>) =>
    adminRequest<AdminModifierGroup>('/modifier_groups', {
      method: 'POST',
      body: JSON.stringify({ menu_item_id: menuItemId, modifier_group: data }),
    }),

  updateModifierGroup: (id: number, data: Partial<AdminModifierGroup>) =>
    adminRequest<AdminModifierGroup>(`/modifier_groups/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ modifier_group: data }),
    }),

  deleteModifierGroup: (id: number) =>
    adminRequest<void>(`/modifier_groups/${id}`, { method: 'DELETE' }),

  // ── Modifiers ───────────────────────────────────────────────────────
  createModifier: (groupId: number, data: Partial<AdminModifier>) =>
    adminRequest<AdminModifier>('/modifiers', {
      method: 'POST',
      body: JSON.stringify({ modifier_group_id: groupId, modifier: data }),
    }),

  updateModifier: (id: number, data: Partial<AdminModifier>) =>
    adminRequest<AdminModifier>(`/modifiers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ modifier: data }),
    }),

  deleteModifier: (id: number) =>
    adminRequest<void>(`/modifiers/${id}`, { method: 'DELETE' }),
};
