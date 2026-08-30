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
  address?: string;
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

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
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
  cart: CartItem[];
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrderNotes: (orderId: string, notes: string) => void;
  addProduct: (p: Omit<Product, "id">) => void;
  updateProduct: (id: number, p: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  updateCustomerMeta: (email: string, meta: Partial<CustomerMeta>) => void;
  updateSettings: (s: Partial<Settings>) => void;
  addToCart: (product: Product, quantity: number) => void;
  updateCartItem: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  placeOrder: (customer: { name: string; email: string; phone: string; address: string; notes: string }) => string;
}

const AdminContext = createContext<AdminContextType | null>(null);

const initialProducts = RAW_PRODUCTS.map((p, i) => ({
  ...p,
  stock: i % 5 === 0 ? 3 : (i % 7 === 0 ? 0 : 25),
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerMeta, setCustomerMeta] = useState<Record<string, CustomerMeta>>({
    "rajendra@example.com": { vip: true, notes: "Kathmandu General Hospital - bulk buyer" }
  });
  const [settings, setSettings] = useState<Settings>({
    phone: "+977 9712011758, +977 9712011757",
    email: "contact@neomeditech.com.np",
    whatsapp: "+977 9712011758",
    address: "Tarkeshwor-6, Kathmandu, Nepal",
    notificationEmail: "contact@neomeditech.com.np",
    lowStockThreshold: 5,
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem("neo_products");
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      
      const savedOrders = localStorage.getItem("neo_orders");
      if (savedOrders) setOrders(JSON.parse(savedOrders));

      const savedSettings = localStorage.getItem("neo_settings");
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedCustomers = localStorage.getItem("neo_customers");
      if (savedCustomers) setCustomerMeta(JSON.parse(savedCustomers));

      const savedCart = localStorage.getItem("neo_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      console.error("Failed to load from local storage", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("neo_products", JSON.stringify(products));
  }, [products, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("neo_orders", JSON.stringify(orders));
  }, [orders, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("neo_settings", JSON.stringify(settings));
  }, [settings, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("neo_customers", JSON.stringify(customerMeta));
  }, [customerMeta, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("neo_cart", JSON.stringify(cart));
  }, [cart, isLoaded]);

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
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

  const addToCart = (product: Product, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity, image: product.image }];
    });
  };

  const updateCartItem = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity } : item));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (customer: { name: string; email: string; phone: string; address: string; notes: string }) => {
    // 1. Input Validation
    if (!customer.name || customer.name.length < 2 || customer.name.length > 100) throw new Error("Invalid name");
    if (!customer.phone || customer.phone.length < 7 || customer.phone.length > 20) throw new Error("Invalid phone");
    if (!customer.address || customer.address.length < 5 || customer.address.length > 200) throw new Error("Invalid address");
    
    // Email validation (optional but if provided must be valid)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (customer.email && !emailRegex.test(customer.email)) throw new Error("Invalid email format");

    // 2. Data Isolation & Security - Non-sequential hard-to-guess IDs
    const orderId = `#ORD-${crypto.randomUUID().split('-')[0].toUpperCase()}`;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // 3. Sanitization (basic manual stripping for now to prevent script injection in notes/names)
    const sanitize = (str: string) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();

    const newOrder: Order = {
      id: orderId,
      customerName: sanitize(customer.name),
      customerEmail: sanitize(customer.email),
      customerPhone: sanitize(customer.phone),
      address: sanitize(customer.address),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: "New",
      total,
      adminNotes: customer.notes ? `Customer Notes: ${sanitize(customer.notes)}` : "",
      items: cart.map(c => ({
        productId: c.productId,
        quantity: c.quantity,
        price: c.price,
        name: c.name
      }))
    };
    
    setOrders([newOrder, ...orders]);
    clearCart();
    return orderId;
  };

  return (
    <AdminContext.Provider value={{
      orders, products, customerMeta, settings, cart,
      updateOrderStatus, updateOrderNotes, addProduct, updateProduct, deleteProduct, updateCustomerMeta, updateSettings: updateSettingsLocal,
      addToCart, updateCartItem, removeFromCart, clearCart, placeOrder
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
