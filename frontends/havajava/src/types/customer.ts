// ============================================================================
// Customer API Types
// ============================================================================

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface CustomerOrderItem {
  id: number;
  menu_item_name: string;
  menu_item_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  special_instructions: string | null;
  modifiers: { name: string; price_adjustment: number }[];
}

export interface CustomerOrder {
  id: number;
  customer_name: string;
  order_type: string;
  status: string;
  total: number;
  special_instructions: string | null;
  created_at: string;
  items: CustomerOrderItem[];
}

export interface CustomerOrdersResponse {
  customer: Customer;
  orders: CustomerOrder[];
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  phone?: string;
}
