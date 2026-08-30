"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "@/components/admin/AdminProvider";
import Link from "next/link";
import { Package, User, MessageSquare, ArrowRight, CheckCircle2, ShoppingBag, Mail, Clock } from "lucide-react";
import Image from "next/image";

const MOCK_MESSAGES: any[] = [];

export default function MyAccount() {
  const { data: session, status } = useSession();
  const { orders } = useAdmin();
  const [activeTab, setActiveTab] = useState("orders");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("neomeditech_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProfile({
          name: parsed.name || session?.user?.name || "",
          phone: parsed.phone || "",
          address: parsed.address || ""
        });
      } catch (e) {}
    } else if (session?.user?.name) {
      setProfile(prev => ({ ...prev, name: session.user!.name! }));
    }
  }, [session]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("neomeditech_profile", JSON.stringify(profile));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (status === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const myOrders = orders.filter(o => o.customerEmail?.toLowerCase() === session?.user?.email?.toLowerCase());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-100 text-blue-700";
      case "Processing": return "bg-blue-100 text-blue-700";
      case "Confirmed": return "bg-amber-100 text-amber-700";
      case "Delivered": return "bg-green-100 text-green-700";
      case "Cancelled": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 mb-8 flex items-center space-x-6 mt-16"
        >
          {session?.user?.image ? (
            <Image src={session.user.image} alt="Profile" width={80} height={80} className="rounded-full border-4 border-slate-50" />
          ) : (
            <div className="w-20 h-20 bg-brand-blue/10 text-brand-blue rounded-full flex items-center justify-center text-3xl font-bold shrink-0">
              {session?.user?.name?.charAt(0) || "U"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-brand-navy">Welcome back, {session?.user?.name?.split(' ')[0]}</h1>
            <p className="text-slate-500 mt-1">Manage your orders, profile details, and messages.</p>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <nav className="space-y-2">
                <button 
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'orders' ? 'bg-brand-blue/5 text-brand-blue' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-navy'}`}
                >
                  <Package size={20} />
                  <span>My Orders</span>
                </button>
                <button 
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'profile' ? 'bg-brand-blue/5 text-brand-blue' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-navy'}`}
                >
                  <User size={20} />
                  <span>Profile Details</span>
                </button>
                <button 
                  onClick={() => setActiveTab("messages")}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'messages' ? 'bg-brand-blue/5 text-brand-blue' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-navy'}`}
                >
                  <MessageSquare size={20} />
                  <span>My Messages</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:w-3/4">
            <AnimatePresence mode="wait">
              
              {/* ORDERS TAB */}
              {activeTab === "orders" && (
                <motion.div 
                  key="orders"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-brand-navy mb-6">Order History</h2>
                  
                  {myOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
                      <ShoppingBag size={48} className="text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-brand-navy mb-2">You haven&apos;t placed any orders yet</h3>
                      <p className="text-slate-500 mb-6">Browse our catalog to find premium medical equipment.</p>
                      <Link href="/shop" className="inline-flex items-center justify-center bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    myOrders.map(order => (
                      <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div 
                          className="p-6 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                          onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                          <div>
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="font-bold text-brand-navy">{order.id}</h3>
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500">{order.date} &bull; {order.items.length} {order.items.length === 1 ? 'item' : 'items'}</p>
                          </div>
                          <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end sm:space-x-6">
                            <span className="font-bold text-brand-navy text-lg">Rs. {order.total.toLocaleString()}</span>
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                              <ArrowRight size={16} className={`transform transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
                            </div>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedOrder === order.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-gray-100 overflow-hidden"
                            >
                              <div className="p-6 bg-slate-50/50">
                                <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4">Items</h4>
                                <div className="space-y-4 mb-6">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                      <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 shrink-0">
                                          <Package size={20} />
                                        </div>
                                        <div>
                                          <p className="font-bold text-brand-navy text-sm sm:text-base line-clamp-1">{item.name}</p>
                                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                        </div>
                                      </div>
                                      <span className="font-bold text-brand-navy whitespace-nowrap ml-4">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                                <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-2">Delivery Address</h4>
                                <p className="text-sm text-brand-navy bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                  {order.address || "No address provided"}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <motion.div 
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-brand-navy mb-6">Profile Details</h2>
                    <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
                      <div>
                        <label className="block text-sm font-bold text-brand-navy mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                          <input 
                            type="email" 
                            disabled 
                            value={session?.user?.email || ""} 
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Email is linked to your Google account and cannot be changed.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-brand-navy mb-2">Full Name</label>
                        <input 
                          type="text" 
                          value={profile.name}
                          onChange={e => setProfile({...profile, name: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue shadow-sm outline-none transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-brand-navy mb-2">Phone Number</label>
                        <input 
                          type="tel" 
                          value={profile.phone}
                          onChange={e => setProfile({...profile, phone: e.target.value})}
                          placeholder="+977"
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue shadow-sm outline-none transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-brand-navy mb-2">Delivery Address</label>
                        <textarea 
                          rows={3}
                          value={profile.address}
                          onChange={e => setProfile({...profile, address: e.target.value})}
                          className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue shadow-sm outline-none transition-colors resize-none"
                        ></textarea>
                      </div>

                      <div className="pt-4 flex items-center space-x-4">
                        <button 
                          type="submit"
                          className="bg-brand-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          Save Changes
                        </button>
                        <AnimatePresence>
                          {saveSuccess && (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0 }}
                              className="flex items-center text-green-600 text-sm font-bold bg-green-50 border border-green-200 px-4 py-2.5 rounded-xl shadow-sm"
                            >
                              <CheckCircle2 size={18} className="mr-2" />
                              Profile updated successfully
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* MESSAGES TAB */}
              {activeTab === "messages" && (
                <motion.div 
                  key="messages"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-brand-navy mb-6">My Messages</h2>
                  
                  {MOCK_MESSAGES.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
                      <MessageSquare size={48} className="text-slate-300 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-brand-navy mb-2">You haven&apos;t sent us any messages yet</h3>
                      <p className="text-slate-500 mb-6">Need help? Feel free to reach out to our support team.</p>
                      <Link href="/contact" className="inline-flex items-center justify-center bg-brand-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">
                        Contact Us
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                      {MOCK_MESSAGES.map((msg, idx) => (
                        <div key={msg.id} className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between ${idx !== MOCK_MESSAGES.length - 1 ? 'border-b border-gray-100' : ''}`}>
                          <div>
                            <h3 className="font-bold text-brand-navy text-lg mb-1">{msg.subject}</h3>
                            <p className="text-sm text-slate-500">{msg.date} &bull; Ticket: {msg.id}</p>
                          </div>
                          <div className="mt-4 sm:mt-0">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold inline-flex items-center ${msg.status === 'Received' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                              {msg.status === 'Received' ? <Clock size={12} className="mr-1.5" /> : <CheckCircle2 size={12} className="mr-1.5" />}
                              {msg.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
