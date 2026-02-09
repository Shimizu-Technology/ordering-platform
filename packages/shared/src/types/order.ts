export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'completed' 
  | 'cancelled';

export interface Order {
  id: number;
  customer_name: string;
  phone: string | null;
  email: string | null;
  order_type: string;
  status: OrderStatus;
  total: number;
  special_instructions: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  menu_item_name: string;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_instructions: string | null;
  modifiers: OrderItemModifier[];
}

export interface OrderItemModifier {
  name: string;
  price_adjustment: number;
}

export interface OrderPayload {
  customer_name: string;
  phone?: string;
  email?: string;
  order_type: 'pickup' | 'dine_in';
  special_instructions?: string;
  customer_id?: number;
  location_id?: number;
  items: OrderItemPayload[];
}

export interface OrderItemPayload {
  menu_item_id: number;
  quantity: number;
  special_instructions?: string;
  modifier_ids: number[];
}
