export const ORDER_STATUSES = ["New", "Confirmed", "Processing", "Delivered", "Cancelled"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  stock: number | null;
  price: number | null;
  description: string;
  isActive: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number | null;
  quantity: number;
  image: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number | null;
  name: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  date: string;
  status: OrderStatus;
  total: number | null;
  items: OrderItem[];
  adminNotes: string;
}

export interface CustomerMeta {
  vip: boolean;
  notes: string;
}

export interface Settings {
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  notificationEmail: string;
  lowStockThreshold: number;
}

export interface Message {
  id: string;
  senderName: string;
  email: string;
  subject: string;
  body: string;
  date: string;
  unread: boolean;
}
