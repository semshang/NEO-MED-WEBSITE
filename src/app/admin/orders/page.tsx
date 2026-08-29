"use client";
import { useState, useMemo } from "react";
import { useAdmin, OrderStatus } from "@/components/admin/AdminProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, X, Check, FileText } from "lucide-react";

export default function OrdersPage() {
  const { orders, updateOrderStatus, updateOrderNotes } = useAdmin();
  const [filter, setFilter] = useState<OrderStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchFilter = filter === "All" || o.status === filter;
      const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [orders, filter, search]);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const exportCSV = () => {
    console.log("Exporting CSV...", filteredOrders);
    alert("Export triggered! Check console for simulated output.");
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Confirmed': return 'bg-amber-100 text-amber-800';
      case 'Processing': return 'bg-purple-100 text-purple-800';
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="px-6 py-10 lg:px-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Orders</h1>
          <p className="text-slate-500 mt-1">Manage and process customer orders</p>
        </div>
        <button onClick={exportCSV} className="flex items-center space-x-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm font-medium">
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex overflow-x-auto space-x-2 pb-2 md:pb-0 hide-scrollbar">
            {["All", "New", "Confirmed", "Processing", "Delivered", "Cancelled"].map(t => (
              <button
                key={t}
                onClick={() => setFilter(t as any)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === t ? 'bg-brand-navy text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="relative relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers or ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Order ID</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Product(s)</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Total</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">No orders found.</td></tr>
              ) : filteredOrders.map((order, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={order.id} 
                  onClick={() => setSelectedOrderId(order.id)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6 text-sm font-medium text-brand-navy">{order.id}</td>
                  <td className="py-4 px-6 text-sm text-slate-600">{order.customerName}</td>
                  <td className="py-4 px-6 text-sm text-slate-600 max-w-[200px] truncate">
                    {order.items.map(it => it.name).join(", ")}
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">{order.date}</td>
                  <td className="py-4 px-6 text-sm font-medium">Rs {order.total.toLocaleString()}</td>
                  <td className="py-4 px-6 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-brand-navy">Order {selectedOrder.id}</h2>
                  <p className="text-sm text-slate-500">{selectedOrder.date}</p>
                </div>
                <button onClick={() => setSelectedOrderId(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center"><FileText className="w-4 h-4 mr-2"/> Customer Info</h3>
                    <p className="font-medium text-brand-navy text-lg">{selectedOrder.customerName}</p>
                    <p className="text-slate-600">{selectedOrder.customerEmail}</p>
                    <p className="text-slate-600">{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Order Status</h3>
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value as OrderStatus)}
                      className="w-full bg-white border border-slate-300 text-slate-700 py-2 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                    >
                      <option value="New">New</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Processing">Processing</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {selectedOrder.status === 'Confirmed' && (
                      <p className="text-xs text-amber-600 mt-2 flex items-center">
                        <Check className="w-3 h-3 mr-1" /> Stock has been deducted
                      </p>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Order Items</h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden mb-8">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="py-2 px-4 font-semibold text-slate-600">Product</th>
                        <th className="py-2 px-4 font-semibold text-slate-600 text-right">Qty</th>
                        <th className="py-2 px-4 font-semibold text-slate-600 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedOrder.items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="py-3 px-4 text-brand-navy">{it.name}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{it.quantity}</td>
                          <td className="py-3 px-4 text-right font-medium">Rs {it.price.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold">
                        <td colSpan={2} className="py-3 px-4 text-right">Total:</td>
                        <td className="py-3 px-4 text-right text-brand-blue">Rs {selectedOrder.total.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Admin Notes</h3>
                <textarea 
                  value={selectedOrder.adminNotes}
                  onChange={(e) => updateOrderNotes(selectedOrder.id, e.target.value)}
                  placeholder="Add private notes for this order..."
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue min-h-[100px]"
                />
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button onClick={() => setSelectedOrderId(null)} className="px-6 py-2 bg-brand-navy text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
