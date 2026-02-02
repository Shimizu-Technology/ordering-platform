// ============================================================================
// API Response Types
// ============================================================================

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  phone: string;
  address: string;
  description: string;
  hours: Record<string, { open?: string; close?: string; closed?: boolean }>;
  branding: Branding;
  active: boolean;
}

export interface Branding {
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  font_family: string | null;
  logo_url: string | null;
}

export interface MenuCategory {
  id: number;
  name: string;
  position: number;
  items: MenuItem[];
}

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  available: boolean;
  position: number;
  modifier_groups: ModifierGroup[];
}

export interface ModifierGroup {
  id: number;
  name: string;
  required: boolean;
  min_select: number;
  max_select: number | null;
  selection_label: string;
  position: number;
  modifiers: Modifier[];
}

export interface Modifier {
  id: number;
  name: string;
  price_adjustment: number;
  display_price: string | null;
  default_selected: boolean;
  position: number;
}

export interface MenuResponse {
  restaurant: Pick<Restaurant, 'id' | 'name' | 'slug'> & { branding: Branding };
  categories: MenuCategory[];
}

// ============================================================================
// Cart Types
// ============================================================================

export interface CartItem {
  id: string; // UUID for cart tracking
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  specialInstructions: string;
}

export interface SelectedModifier {
  groupId: number;
  groupName: string;
  modifier: Modifier;
}

// ============================================================================
// Order Types
// ============================================================================

export interface OrderPayload {
  customer_name: string;
  phone?: string;
  email?: string;
  order_type: 'pickup' | 'dine_in';
  special_instructions?: string;
  items: OrderItemPayload[];
}

export interface OrderItemPayload {
  menu_item_id: number;
  quantity: number;
  special_instructions?: string;
  modifier_ids: number[];
}

export interface Order {
  id: number;
  customer_name: string;
  phone: string | null;
  email: string | null;
  order_type: string;
  status: string;
  total: number;
  special_instructions: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  items: OrderItemResponse[];
}

export interface OrderItemResponse {
  id: number;
  menu_item_name: string;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_instructions: string | null;
  modifiers: { name: string; price_adjustment: number }[];
}
