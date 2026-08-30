"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, ShoppingBag, Mail, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "./AdminProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NotificationItem {
  id: string;
  type: "order" | "message" | "stock";
  title: string;
  link: string;
  date: number;
}

export function AdminNotifications() {
  const { orders, messages, products, settings, seenNotifications, markNotificationsSeen } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derive notifications
  const notifications: NotificationItem[] = [];

  // 1. New Orders
  orders.forEach(order => {
    if (order.status === 'New') {
      notifications.push({
        id: `order-${order.id}`,
        type: 'order',
        title: `New order ${order.id} from ${order.customerName}`,
        link: '/admin/orders',
        date: new Date(order.date).getTime() || Date.now(),
      });
    }
  });

  // 2. Unread Messages
  messages.forEach(msg => {
    if (msg.unread) {
      notifications.push({
        id: `msg-${msg.id}`,
        type: 'message',
        title: `New message from ${msg.senderName}: ${msg.subject}`,
        link: '/admin/messages',
        date: new Date(msg.date).getTime() || Date.now(),
      });
    }
  });

  // 3. Low Stock
  products.forEach(product => {
    if (product.stock < settings.lowStockThreshold) {
      notifications.push({
        id: `stock-${product.id}`,
        type: 'stock',
        title: `${product.name} is low on stock (${product.stock} left)`,
        link: '/admin/products',
        date: Date.now() - 3600000, // mock as slightly older
      });
    }
  });

  // Sort newest first
  notifications.sort((a, b) => b.date - a.date);

  // Unread count
  const unreadCount = notifications.filter(n => !seenNotifications.includes(n.id)).length;

  // Trigger shake animation when unreadCount increases
  useEffect(() => {
    if (unreadCount > 0) {
      setHasNew(true);
      const timer = setTimeout(() => setHasNew(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notifications.length > 0) {
      // Mark all current notifications as seen
      const unseenIds = notifications.filter(n => !seenNotifications.includes(n.id)).map(n => n.id);
      if (unseenIds.length > 0) {
        markNotificationsSeen(unseenIds);
      }
    }
  };

  const getRelativeTime = (timestamp: number) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDifference = Math.round((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysDifference === 0) return "Today";
    if (daysDifference > -7) return rtf.format(daysDifference, 'day');
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={handleOpen}
        animate={hasNew ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
        className="relative p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/5 rounded-full transition-colors focus:outline-none"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-brand-navy">Notifications</h3>
              {notifications.length > 0 && (
                <button 
                  onClick={() => markNotificationsSeen(notifications.map(n => n.id))}
                  className="text-xs font-bold text-brand-blue hover:text-blue-700 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="text-green-500" size={24} />
                  </div>
                  <p className="font-bold text-brand-navy">You&apos;re all caught up</p>
                  <p className="text-sm text-slate-500 mt-1">No new notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map(notification => {
                    const isUnread = !seenNotifications.includes(notification.id);
                    return (
                      <Link 
                        key={notification.id}
                        href={notification.link}
                        className={`p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors ${isUnread ? 'bg-brand-blue/5' : ''}`}
                      >
                        <div className={`mt-0.5 p-2 rounded-full shrink-0 ${
                          notification.type === 'order' ? 'bg-blue-100 text-blue-600' :
                          notification.type === 'message' ? 'bg-purple-100 text-purple-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {notification.type === 'order' && <ShoppingBag size={16} />}
                          {notification.type === 'message' && <Mail size={16} />}
                          {notification.type === 'stock' && <AlertTriangle size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${isUnread ? 'font-bold text-brand-navy' : 'font-medium text-slate-600'}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">{getRelativeTime(notification.date)}</p>
                        </div>
                        {isUnread && (
                          <div className="w-2 h-2 bg-brand-blue rounded-full shrink-0 mt-1.5"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
