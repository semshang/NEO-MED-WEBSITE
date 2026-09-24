"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useSession } from "next-auth/react";
import { SITE } from "@/config/site";
import { PRODUCT_SEED } from "@/data/products";
import type { CustomerMeta, Message, Order, OrderStatus, Product, Settings } from "@/lib/store-types";

export type { CustomerMeta, Message, Order, OrderStatus, Product, Settings } from "@/lib/store-types";

const INITIAL_PRODUCTS: Product[] =
  process.env.NODE_ENV === "production"
    ? []
    : PRODUCT_SEED.map((p) => ({
        id: String(p.id),
        name: p.name,
        slug: p.slug,
        category: p.category,
        image: p.image,
        stock: p.stock,
        price: p.price,
        description: p.description,
        isActive: p.isActive,
      }));

type CustomerMetaResponse = CustomerMeta & { email: string };

interface AdminContextType {
  orders: Order[];
  products: Product[];
  messages: Message[];
  customerMeta: Record<string, CustomerMeta>;
  settings: Settings;
  seenNotifications: string[];
  isLoading: boolean;
  error: string | null;
  markNotificationsSeen: (ids: string[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderNotes: (orderId: string, notes: string) => Promise<void>;
  addProduct: (product: Omit<Product, "id" | "slug"> & { isActive?: boolean; active?: boolean }) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateCustomerMeta: (email: string, meta: Partial<CustomerMeta>) => Promise<void>;
  updateSettings: (settings: Settings) => Promise<void>;
  updateMessage: (id: string, update: Partial<Message>) => Promise<void>;
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
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [customerMeta, setCustomerMeta] = useState<Record<string, CustomerMeta>>({});
  const [settings, setSettings] = useState<Settings>(defaultSettings);
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
        try {
          const [nextSettings, customers] = await Promise.all([
            requestJson<Settings>("/api/settings"),
            requestJson<CustomerMetaResponse[]>("/api/admin/customers"),
          ]);
          setSettings(nextSettings);
          setCustomerMeta(Object.fromEntries(customers.map(({ email, vip, notes }) => [email, { vip, notes }])));
        } catch (adminLoadError) {
          setSettings(defaultSettings);
          setCustomerMeta({});
          throw adminLoadError;
        }
      } else {
        setSettings(defaultSettings);
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

  const addProduct = useCallback(async (product: Omit<Product, "id" | "slug"> & { isActive?: boolean; active?: boolean }) => {
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
  }, []);

  const updateCustomerMeta = useCallback(async (email: string, patch: Partial<CustomerMeta>) => {
    const updated = await requestJson<CustomerMetaResponse>("/api/admin/customers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, ...patch }),
    });
    setCustomerMeta((current) => ({ ...current, [updated.email]: { vip: updated.vip, notes: updated.notes } }));
  }, []);

  const updateMessage = useCallback(async (id: string, patch: Partial<Message>) => {
    const updated = await requestJson<Message>(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setMessages((current) => current.map((item) => (item.id === id ? updated : item)));
  }, []);

  const updateSettings = useCallback(async (nextSettings: Settings) => {
    const updated = await requestJson<Settings>("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextSettings),
    });
    setSettings(updated);
  }, []);

  const value = useMemo<AdminContextType>(() => ({
    orders,
    products,
    messages,
    customerMeta,
    settings,
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
    updateMessage,
  }), [addProduct, customerMeta, deleteProduct, error, isLoading, messages, orders, products, seenNotifications, settings, updateCustomerMeta, updateOrder, updateProduct, updateSettings, updateMessage]);

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("useAdmin must be used within AdminProvider");
  return context;
}
