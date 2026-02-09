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
