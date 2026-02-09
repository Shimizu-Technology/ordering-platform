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
// Inventory Types
// ============================================================================

export interface InventoryItem {
  id: number;
  type: 'MenuItem' | 'MerchandiseVariant';
  name: string;
  category_name: string;
  track_inventory: boolean;
  stock_quantity: number | null;
  low_stock_threshold: number;
  stock_status: 'in_stock' | 'low_stock' | 'sold_out' | null;
  available: boolean;
  base_price: number;
}

export interface InventoryResponse {
  items: InventoryItem[];
  meta: {
    total: number;
    tracked: number;
    low_stock: number;
    sold_out: number;
  };
}

export interface StockAdjustment {
  id: number;
  adjustable_type: string;
  adjustable_id: number;
  item_name: string;
  quantity_before: number;
  quantity_after: number;
  adjustment: number;
  reason: string;
  notes: string | null;
  user_email: string | null;
  created_at: string;
}

export interface AuditLogResponse {
  adjustments: StockAdjustment[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

// ============================================================================
// Refund Types
// ============================================================================

export type RefundReason = 
  | 'customer_request'
  | 'item_unavailable'
  | 'quality_issue'
  | 'wrong_item'
  | 'never_picked_up'
  | 'duplicate_charge'
  | 'other';

export type RefundType = 'full' | 'partial';
export type RefundStatus = 'pending' | 'completed' | 'failed';

export interface Refund {
  id: number;
  order_id: number;
  amount: number;
  refund_type: RefundType;
  reason: RefundReason;
  notes: string | null;
  status: RefundStatus;
  stripe_refund_id: string | null;
  restore_inventory: boolean;
  error_message: string | null;
  user_email: string | null;
  created_at: string;
}

export interface RefundRequest {
  amount?: number;
  refund_type: RefundType;
  reason: RefundReason;
  notes?: string;
  restore_inventory?: boolean;
}

export interface RefundResponse {
  refund: Refund;
  order: {
    id: number;
    total: number;
    refunded_amount: number;
    refund_status: 'partial' | 'full' | null;
    net_amount: number;
  };
}

// Extended AdminOrder with refund info
export interface AdminOrderWithRefunds extends AdminOrder {
  refunded_amount: number;
  refund_status: 'partial' | 'full' | null;
  stripe_payment_intent_id: string | null;
  refunds: Refund[];
}
