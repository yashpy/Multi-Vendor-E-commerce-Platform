export interface Vendor {
  id: string;
  name: string;
  email: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  inventory: number;
  created_at: string;
}

export interface OrderItemInput {
  product_id: string;
  quantity: number;
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_cents: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  vendor_id: string;
  quantity: number;
  unit_price_cents: number;
}

export type OrderStatus =
  | 'created'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface CartItem {
  productId: string;
  quantity: number;
  unitPriceCents: number;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}

export interface TrackingEvent {
  orderId: string;
  status: OrderStatus;
  location: string;
  timestamp: string;
}

export interface AnalyticsEvent {
  type: 'order_created' | 'order_status_changed' | 'product_event';
  payload: Record<string, unknown>;
}
