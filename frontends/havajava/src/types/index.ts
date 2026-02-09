// ============================================================================
// API Response Types
// ============================================================================

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  phone: string;
  email?: string;
  address: string;
  description: string;
  hours: Record<string, { open?: string; close?: string; closed?: boolean }>;
  timezone?: string;
  branding: Branding;
  default_prep_time_minutes?: number;
  active: boolean;
  status?: string;
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
  // Promotion fields (present when a promo is active)
  original_price?: number;
  discounted_price?: number;
  promotion?: MenuItemPromotion;
  // Inventory fields (present when tracking is enabled)
  stock_status?: 'in_stock' | 'low_stock' | 'sold_out';
  sold_out?: boolean;
}

export interface MenuItemPromotion {
  id: number;
  name: string;
  promotion_type: string;
  value: number;
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
  customer_id?: number;
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
  subtotal: number;
  tip_amount: number;
  tip_percentage: number | null;
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

// ============================================================================
// Promotion Types
// ============================================================================

export interface Promotion {
  id: number;
  name: string;
  promotion_type: PromotionType;
  value: number;
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
  days_of_week: string[];
  active: boolean;
  applies_to: 'all' | 'category' | 'item';
  applies_to_id: number | null;
  currently_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PromotionType = 'percentage_off' | 'fixed_off' | 'bogo' | 'happy_hour_price';

// ============================================================================
// Onboarding Types
// ============================================================================

export interface OnboardingRestaurantPayload {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
}

export interface OnboardingSetupPayload {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  logo_url?: string;
  hours?: Record<string, { open?: string; close?: string; closed?: boolean }>;
}
