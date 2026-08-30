"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Clock, Package, Users, Plus, List, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAdmin } from "@/components/admin/AdminProvider";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { orders, products } = useAdmin();

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'New').length;
  const totalProducts = products.length;
  const totalCustomers = new Set(orders.map(o => o.customerEmail)).size;

  const stats = [
    { name: "Total Orders", value: totalOrders.toString(), icon: ShoppingBag, change: "+5 this week", color: "text-brand-navy" },
    { name: "Pending Orders", value: pendingOrders.toString(), icon: Clock, highlight: pendingOrders > 0, color: pendingOrders > 0 ? "text-amber-500" : "text-brand-navy" },
    { name: "Total Products", value: totalProducts.toString(), icon: Package, color: "text-brand-navy" },
    { name: "Total Customers", value: totalCustomers.toString(), icon: Users, color: "text-brand-navy" },
  ];

  const recentOrders = [...orders].reverse().slice(0, 5);

  if (status === "loading") {
    return (
      <div className="px-6 py-10 lg:px-10">
        <div className="flex items-center space-x-4 mb-12 pb-6 border-b border-slate-200/60">
          <div className="w-14 h-14 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="px-6 py-10 lg:px-10">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-brand-navy via-brand-navy to-brand-blue rounded-3xl p-8 shadow-lg shadow-brand-blue/20 mb-10 relative">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" as any }}
              className="relative"
            >
              <motion.button 
                initial={{ boxShadow: "0 0 0 0 rgba(27, 110, 194, 0)" }}
                animate={{ boxShadow: ["0 0 0 0 rgba(27, 110, 194, 0)", "0 0 0 4px rgba(255, 255, 255, 0.4)", "0 0 0 10px rgba(255, 255, 255, 0)"] }}
                transition={{ duration: 0.2, delay: 0.4, ease: "easeOut" as any }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="focus:outline-none rounded-full ring-4 ring-white/20 focus:ring-white transition-all block bg-white"
              >
                {session?.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt="Admin Avatar" 
                    className="w-16 h-16 rounded-full object-cover shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-brand-blue text-white flex items-center justify-center text-xl font-bold shadow-sm">
                    {session?.user?.name ? session.user.name.charAt(0) : "A"}
                  </div>
                )}
              </motion.button>

              {isDropdownOpen && (
                <div className="absolute top-20 left-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="text-sm font-bold text-brand-navy truncate">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
                  </div>
                  <button 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </motion.div>
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" as any }}
                className="text-2xl md:text-3xl font-bold text-white tracking-tight"
              >
                Welcome back, {session?.user?.name || "Admin"}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.25, ease: "easeOut" as any }}
                className="text-brand-blue/30 text-white/80 text-sm md:text-base mt-2 font-medium"
              >
                Here is what is happening today &mdash; {today}
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + (i * 0.05), ease: "easeOut" as any }}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 border border-gray-200 hover:border-brand-blue/30 p-6 flex flex-col justify-between transition-all duration-300 group"
          >
            <div className="flex justify-between items-start mb-4">
              <p className="text-slate-500 font-medium group-hover:text-brand-navy transition-colors">{stat.name}</p>
              <div className={`p-3 rounded-xl transition-colors duration-300 shadow-sm ${stat.highlight ? 'bg-gradient-to-br from-amber-100 to-amber-50 group-hover:from-amber-200 group-hover:to-amber-100' : 'bg-gradient-to-br from-brand-blue/10 to-brand-green/5 group-hover:from-brand-blue/20 group-hover:to-brand-green/10'}`}>
                <stat.icon className={`w-6 h-6 ${stat.highlight ? 'text-amber-600' : 'text-brand-blue'}`} />
              </div>
            </div>
            <div>
              <h3 className={`text-4xl font-bold tracking-tight ${stat.color}`}>{stat.value}</h3>
              {stat.change && (
                <p className="text-brand-green text-sm font-bold mt-2 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green mr-2 animate-pulse"></span>
                  {stat.change}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" as any }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-200 overflow-hidden transition-shadow duration-300"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-brand-navy">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-blue/5 transition-colors group">
                    <td className="py-4 px-6 text-sm font-bold text-brand-navy">{order.id}</td>
                    <td className="py-4 px-6 text-sm text-slate-600 font-medium group-hover:text-brand-navy transition-colors">{order.customerName}</td>
                    <td className="py-4 px-6 text-sm text-slate-600 max-w-[200px] truncate" title={order.items.map(i=>i.name).join(", ")}>{order.items.map(i=>i.name).join(", ")}</td>
                    <td className="py-4 px-6 text-sm text-slate-500 font-medium">{order.date}</td>
                    <td className="py-4 px-6 text-sm">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        order.status === 'New' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        order.status === 'Confirmed' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        order.status === 'Processing' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-green-100 text-green-800 border border-green-200'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50">
            <Link href="/admin/orders" className="text-sm font-bold text-brand-blue flex items-center hover:text-brand-navy transition-colors">
              View all orders <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55, ease: "easeOut" as any }}
          className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-6 h-full"
        >
          <Link href="/admin/products" className="flex-1 bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition-all hover:border-brand-blue/30 group min-h-[160px]">
            <div className="p-4 bg-gradient-to-br from-brand-blue/10 to-brand-green/5 rounded-2xl text-brand-blue group-hover:from-brand-blue group-hover:to-brand-green group-hover:text-white transition-all duration-300 shadow-sm mb-4">
              <Plus className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-brand-navy group-hover:text-brand-blue transition-colors text-lg">Manage Products</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">Add or edit catalog items</p>
            </div>
          </Link>
          
          <Link href="/admin/orders" className="flex-1 bg-white rounded-2xl shadow-md border border-gray-200 p-6 flex flex-col items-center justify-center text-center hover:shadow-xl hover:-translate-y-1 transition-all hover:border-brand-blue/30 group min-h-[160px]">
            <div className="p-4 bg-gradient-to-br from-amber-100 to-amber-50 rounded-2xl text-amber-600 group-hover:from-brand-blue group-hover:to-brand-green group-hover:text-white transition-all duration-300 shadow-sm mb-4">
              <List className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-brand-navy group-hover:text-brand-blue transition-colors text-lg">View Orders</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium">Process pending requests</p>
            </div>
          </Link>
        </motion.div>
      </div>

    </div>
  );
}
