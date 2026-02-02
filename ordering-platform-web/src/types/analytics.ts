// ============================================================================
// Analytics API Types
// ============================================================================

export interface AnalyticsOverview {
  date: string;
  revenue: number;
  order_count: number;
  avg_order_value: number;
  top_items: { name: string; quantity: number }[];
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  order_count: number;
  label?: string;
}

export interface RevenueResponse {
  start_date: string;
  end_date: string;
  granularity: string;
  total_revenue: number;
  data_points: RevenueDataPoint[];
}

export interface TopItemData {
  item_id: number;
  item_name: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
}

export interface ItemsResponse {
  start_date: string;
  end_date: string;
  items: TopItemData[];
}

export interface HourData {
  hour: number;
  label: string;
  order_count: number;
  revenue: number;
}

export interface HoursResponse {
  start_date: string;
  end_date: string;
  hours: HourData[];
}
