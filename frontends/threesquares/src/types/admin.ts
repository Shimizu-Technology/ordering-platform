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
  notifications_enabled: boolean;
  webhook_url: string | null;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  active: boolean;
  sms_configured: boolean;
  smtp_configured: boolean;
}

export interface AdminPromotion {
  id: number;
  name: string;
  promotion_type: 'percentage_off' | 'fixed_off' | 'bogo' | 'happy_hour_price';
  value: number;
  start_time: string;
  end_time: string;
  days_of_week: string[];
  active: boolean;
  applies_to: 'all' | 'category' | 'item';
  applies_to_id: number | null;
  currently_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StripeConnectStatus {
  configured: boolean;
  connected: boolean;
  onboarding_complete: boolean;
  account_id?: string;
  charges_enabled?: boolean;
  payouts_enabled?: boolean;
  error?: string;
}

export interface NotifyReadyResponse {
  message?: string;
  sid?: string;
  error?: string;
}

// ============================================================================
// Catering Types
// ============================================================================

export type CateringStatus = 'pending' | 'quoted' | 'accepted' | 'declined' | 'cancelled';

export interface CateringInquiry {
  id: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  company_name: string | null;
  event_type: string;
  event_date: string;
  event_time: string | null;
  guest_count: number;
  budget_range: string | null;
  status: CateringStatus;
  quoted_amount: number | null;
  quoted_at: string | null;
  days_until_event: number;
  urgent: boolean;
  created_at: string;
  // Full details (when fetching single inquiry)
  venue_address?: string | null;
  menu_preferences?: string | null;
  special_requests?: string | null;
  dietary_restrictions?: string | null;
  admin_notes?: string | null;
  location?: { id: number; name: string } | null;
  responded_by?: { id: number; name: string } | null;
}

export interface CateringInquiriesResponse {
  inquiries: CateringInquiry[];
  counts: {
    pending: number;
    quoted: number;
    upcoming: number;
  };
}

// ============================================================================
// Merchandise Types (Cookie Store)
// ============================================================================

export interface MerchandiseVariant {
  id: number;
  name: string;
  price: number;
  sku: string | null;
  available: boolean;
  position: number;
  track_inventory: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  in_stock: boolean;
  low_stock: boolean;
}

export interface MerchandiseItem {
  id: number;
  name: string;
  description: string | null;
  base_price: number | null;
  image_url: string | null;
  available: boolean;
  position: number;
  category_id: number;
  has_variants: boolean;
  variants: MerchandiseVariant[];
}

export interface MerchandiseCategory {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  position: number;
  items: MerchandiseItem[];
}

export interface MerchandiseResponse {
  categories: MerchandiseCategory[];
}
