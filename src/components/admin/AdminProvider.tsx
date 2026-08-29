"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as RAW_PRODUCTS } from '@/data/products';

export type OrderStatus = "New" | "Confirmed" | "Processing" | "Delivered" | "Cancelled";

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
  name: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  adminNotes: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  stock: number;
  price: number;
  description: string;
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

interface AdminContextType {
  orders: Order[];
  products: Product[];
  customerMeta: Record<string, CustomerMeta>;
  settings: Settings;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderNotes: (orderId: string, notes: string) => void;
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: number, p: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  updateCustomerMeta: (email: string, meta: Partial<CustomerMeta>) => void;
  updateSettings: (s: Partial<Settings>) => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

const initialProducts = RAW_PRODUCTS.map((p, i) => ({
  ...p,
  stock: i % 5 === 0 ? 3 : (i % 7 === 0 ? 0 : 25), // some low stock, some out of stock
  price: 50000 + (i * 1000),
  description: "Premium medical equipment."
}));

const initialOrders: Order[] = [
  { id: "#ORD-089", customerName: "Rajendra Thapa", customerEmail: "rajendra@example.com", customerPhone: "+977 9800000001", date: "Aug 29, 2026", status: "New", total: 105000, adminNotes: "", items: [{ productId: 1, quantity: 2, price: 50000, name: initialProducts[0].name }] },
  { id: "#ORD-088", customerName: "Sita Sharma", customerEmail: "sita@example.com", customerPhone: "+977 9800000002", date: "Aug 28, 2026", status: "Confirmed", total: 65000, adminNotes: "Called to confirm delivery address.", items: [{ productId: 2, quantity: 1, price: 65000, name: initialProducts[1].name }] },
  { id: "#ORD-087", customerName: "Bikash Gurung", customerEmail: "bikash@example.com", customerPhone: "+977 9800000003", date: "Aug 27, 2026", status: "Delivered", total: 12000, adminNotes: "", items: [{ productId: 3, quantity: 1, price: 12000, name: initialProducts[2].name }] },
  { id: "#ORD-086", customerName: "Anita Maharjan", customerEmail: "anita@example.com", customerPhone: "+977 9800000004", date: "Aug 25, 2026", status: "Delivered", total: 54000, adminNotes: "", items: [{ productId: 4, quantity: 1, price: 54000, name: initialProducts[3].name }] },
  { id: "#ORD-085", customerName: "Prakash Shrestha", customerEmail: "prakash@example.com", customerPhone: "+977 9800000005", date: "Aug 22, 2026", status: "Processing", total: 200000, adminNotes: "Awaiting supplier restock for one item.", items: [{ productId: 5, quantity: 4, price: 50000, name: initialProducts[4].name }] },
];

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [customerMeta, setCustomerMeta] = useState<Record<string, CustomerMeta>>({
    "rajendra@example.com": { vip: true, notes: "Kathmandu General Hospital — bulk buyer" }
  });
  const [settings, setSettings] = useState<Settings>({
    phone: "+977 9712011758, +977 9712011757",
    email: "contact@neomeditech.com.np",
    whatsapp: "+977 9712011758",
    address: "Tarkeshwor-6, Kathmandu, Nepal",
    notificationEmail: "contact@neomeditech.com.np",
    lowStockThreshold: 5,
  });

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        // Decrease stock if changed to Confirmed
        if (status === 'Confirmed' && o.status !== 'Confirmed') {
          setProducts(prods => prods.map(p => {
            const item = o.items.find(i => i.productId === p.id);
            if (item) return { ...p, stock: Math.max(0, p.stock - item.quantity) };
            return p;
          }));
        }
        return { ...o, status };
      }
      return o;
    }));
  };

  const updateOrderNotes = (orderId: string, notes: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, adminNotes: notes } : o));
  };

  const addProduct = (p: Omit<Product, "id">) => {
    const newId = Math.max(0, ...products.map(x => x.id)) + 1;
    setProducts([{ ...p, id: newId }, ...products]);
  };

  const updateProduct = (id: number, p: Partial<Product>) => {
    setProducts(prev => prev.map(x => x.id === id ? { ...x, ...p } : x));
  };

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(x => x.id !== id));
  };

  const updateCustomerMeta = (email: string, meta: Partial<CustomerMeta>) => {
    setCustomerMeta(prev => ({
      ...prev,
      [email]: { ...(prev[email] || { vip: false, notes: "" }), ...meta }
    }));
  };

  const updateSettingsLocal = (s: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...s }));
  };

  return (
    <AdminContext.Provider value={{
      orders, products, customerMeta, settings,
      updateOrderStatus, updateOrderNotes, addProduct, updateProduct, deleteProduct, updateCustomerMeta, updateSettings: updateSettingsLocal
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};
