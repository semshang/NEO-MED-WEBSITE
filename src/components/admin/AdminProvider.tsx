"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { SITE } from "@/config/site";
import type { CartItem, CustomerMeta, Message, Order, OrderStatus, Product, Settings } from "@/lib/store-types";

export type { CartItem, CustomerMeta, Message, Order, OrderStatus, Product, Settings } from "@/lib/store-types";

type CustomerMetaResponse = CustomerMeta & { email: string };
type OrderCustomer = { name: string; email: string; phone: string; address: string; notes: string };

interface AdminContextType {
  orders: Order[];
  products: Product[];
  messages: Message[];
  customerMeta: Record<string, CustomerMeta>;
  settings: Settings;
  cart: CartItem[];
  seenNotifications: string[];
  isLoading: boolean;
  error: string | null;
  markNotificationsSeen: (ids: string[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderNotes: (orderId: string, notes: string) => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "isActive">) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateCustomerMeta: (email: string, meta: Partial<CustomerMeta>) => Promise<void>;
  updateSettings: (settings: Settings) => Promise<void>;
  addToCart: (product: Product, quantity: number) => void;
  updateCartItem: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (customer: OrderCustomer) => Promise<string>;
}

const defaultSettings: Settings = {
  phone: SITE.phone,
  email: SITE.email,
  whatsapp: SITE.whatsapp,
  address: SITE.address,
  notificationEmail: SITE.email,
  lowStockThreshold: 5,
};

const AdminContext = createContext<AdminContextType | null>(null);

function messageFromUnknown(value: unknown, fallback: string) {
  if (value instanceof Error) return value.message;
  return fallback;
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
      ? body.message
      : "The request could not be completed.";
    throw new Error(message);
  }

  return body as T;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customerMeta, setCustomerMeta] = useState<Record<string, CustomerMeta>>({});
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [seenNotifications, setSeenNotifications] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.role === "admin";

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const catalog = await requestJson<Product[]>("/api/products");
      setProducts(catalog);

      if (status !== "authenticated") {
        setOrders([]);
        setMessages([]);
        setCustomerMeta({});
        return;
      }

      const orderRequest = requestJson<Order[]>("/api/orders");
      const messageRequest = requestJson<Message[]>("/api/contact");
      const [nextOrders, nextMessages] = await Promise.all([orderRequest, messageRequest]);
      setOrders(nextOrders);
      setMessages(nextMessages);

      if (isAdmin) {
        const [nextSettings, customers] = await Promise.all([
          requestJson<Settings>("/api/settings"),
          requestJson<CustomerMetaResponse[]>("/api/admin/customers"),
        ]);
        setSettings(nextSettings);
        setCustomerMeta(Object.fromEntries(customers.map(({ email, vip, notes }) => [email, { vip, notes }])));
      } else {
        setCustomerMeta({});
      }
    } catch (loadError) {
      setError(messageFromUnknown(loadError, "Unable to load live store data."));
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      void refreshData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshData]);

  const updateOrder = useCallback(async (orderId: string, patch: Pick<Partial<Order>, "status" | "adminNotes">) => {
    const order = await requestJson<Order>(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setOrders((current) => current.map((item) => (item.id === orderId ? order : item)));
  }, []);

  const addProduct = useCallback(async (product: Omit<Product, "id" | "isActive">) => {
    const created = await requestJson<Product>("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    setProducts((current) => [...current, created].sort((left, right) => left.name.localeCompare(right.name)));
  }, []);

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    const updated = await requestJson<Product>(`/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    setProducts((current) => current.map((item) => (item.id === id ? updated : item)));
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    await requestJson<Product>(`/api/products/${id}`, { method: "DELETE" });
    setProducts((current) => current.filter((item) => item.id !== id));
    setCart((current) => current.filter((item) => item.productId !== id));
  }, []);

  const updateCustomerMeta = useCallback(async (email: string, patch: Partial<CustomerMeta>) => {
    const updated = await requestJson<CustomerMetaResponse>("/api/admin/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ...patch }),
    });
    setCustomerMeta((current) => ({ ...current, [updated.email]: { vip: updated.vip, notes: updated.notes } }));
  }, []);

  const updateSettings = useCallback(async (nextSettings: Settings) => {
    const updated = await requestJson<Settings>("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextSettings),
    });
    setSettings(updated);
  }, []);

  const addToCart = useCallback((product: Product, quantity: number) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) => item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...current, { productId: product.id, name: product.name, price: product.price, quantity, image: product.image }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const updateCartItem = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((current) => current.map((item) => item.productId === productId ? { ...item, quantity } : item));
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const placeOrder = useCallback(async (customer: OrderCustomer) => {
    const order = await requestJson<Order>("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...customer, items: cart.map(({ productId, quantity }) => ({ productId, quantity })) }),
    });
    setOrders((current) => [order, ...current]);
    clearCart();
    return order.id;
  }, [cart, clearCart]);

  const value = useMemo<AdminContextType>(() => ({
    orders,
    products,
    messages,
    customerMeta,
    settings,
    cart,
    seenNotifications,
    isLoading,
    error,
    markNotificationsSeen: (ids) => setSeenNotifications((current) => [...new Set([...current, ...ids])]),
    updateOrderStatus: (orderId, statusValue) => updateOrder(orderId, { status: statusValue }),
    updateOrderNotes: (orderId, notes) => updateOrder(orderId, { adminNotes: notes }),
    addProduct,
    updateProduct,
    deleteProduct,
    updateCustomerMeta,
    updateSettings,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    placeOrder,
  }), [addProduct, addToCart, cart, clearCart, customerMeta, deleteProduct, error, isLoading, messages, orders, placeOrder, products, removeFromCart, seenNotifications, settings, updateCartItem, updateCustomerMeta, updateOrder, updateProduct, updateSettings]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProvider");
  return context;
}
