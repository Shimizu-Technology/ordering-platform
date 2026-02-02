// ============================================================================
// Admin API Types
// ============================================================================

export interface AdminOrder {
  id: number;
  customer_name: string;
  phone: string | null;
  email: string | null;
  order_type: string;
  status: OrderStatus;
  total: number;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
  items: AdminOrderItem[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface AdminOrderItem {
  id: number;
  menu_item_name: string;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_instructions: string | null;
  modifiers: { name: string; price_adjustment: number }[];
}

export interface OrdersResponse {
  orders: AdminOrder[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface AdminCategory {
  id: number;
  name: string;
  position: number;
  active: boolean;
  items_count: number;
  items: AdminMenuItem[];
}

export interface AdminMenuItem {
  id: number;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  available: boolean;
  position: number;
  menu_category_id?: number;
  modifier_groups_count: number;
  modifier_groups: AdminModifierGroup[];
}

export interface AdminModifierGroup {
  id: number;
  name: string;
  required: boolean;
  min_select: number;
  max_select: number | null;
  position: number;
  menu_item_id?: number;
  modifiers: AdminModifier[];
}

export interface AdminModifier {
  id: number;
  name: string;
  price_adjustment: number;
  default_selected: boolean;
  position: number;
  modifier_group_id?: number;
}

export interface AdminRestaurant {
  id: number;
  name: string;
  slug: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  description: string | null;
  hours: Record<string, { open?: string; close?: string; closed?: boolean }>;
  branding: {
    primary_color: string | null;
    secondary_color: string | null;
    accent_color: string | null;
    font_family: string | null;
    logo_url: string | null;
  };
  active: boolean;
}
