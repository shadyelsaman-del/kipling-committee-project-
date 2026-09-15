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

export interface Order {
  id: string;
  student_name: string;
  student_class: string;
  student_phone: string;
  restaurant_id: string;
  delivery_date: string;
  status: OrderStatus;
  payment_screenshot_path: string;
  total_amount: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  item_price: number;
  quantity: number;
  subtotal: number;
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
