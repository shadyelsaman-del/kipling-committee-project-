export type OrderStatus = "pending_review" | "confirmed" | "ready_for_pickup";

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  created_at: string;
}

export interface OrderLineItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  created_at: string;
  student_name: string;
  student_class: string;
  student_phone: string;
  restaurant_id: string;
  restaurant_name: string;
  delivery_date: string;
  status: OrderStatus;
  screenshot_url: string;
  total_amount: number;
  items: OrderLineItem[];
}

export interface CartLine {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  restaurantId: string;
  restaurantName: string;
  lines: CartLine[];
}
