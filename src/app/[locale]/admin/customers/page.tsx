"use client";
import { useState, useMemo } from "react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { motion } from "framer-motion";
import { Search, Star, Edit2, Check } from "lucide-react";

export default function CustomersPage() {
  const { orders, customerMeta, updateCustomerMeta } = useAdmin();
  const [search, setSearch] = useState("");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");

  const customers = useMemo(() => {
    const map = new Map<string, { email: string, name: string, phone: string, ordersCount: number, totalValue: number }>();
    
    orders.forEach(o => {
      if (!map.has(o.customerEmail)) {
        map.set(o.customerEmail, { email: o.customerEmail, name: o.customerName, phone: o.customerPhone, ordersCount: 0, totalValue: 0 });
      }
      const c = map.get(o.customerEmail)!;
      c.ordersCount += 1;
      c.totalValue += o.total;
    });

    return Array.from(map.values()).map(c => ({
      ...c,
      vip: customerMeta[c.email]?.vip || false,
      notes: customerMeta[c.email]?.notes || ""
    })).filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));
  }, [orders, customerMeta, search]);

  const handleSaveNotes = (email: string) => {
    updateCustomerMeta(email, { notes: tempNotes });
    setEditingNotes(null);
  };

  return (
    <div className="px-6 py-10 lg:px-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Customers</h1>
          <p className="text-slate-500 mt-1">View and manage customer directory</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="p-4 border-b border-slate-100">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Customer</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase text-center">Orders</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase text-right">Lifetime Value</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Admin Notes</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase text-center">VIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">No customers found.</td></tr>
              ) : customers.map((c, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={c.email} 
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <p className="font-bold text-brand-navy">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.email}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{c.phone}</td>
                  <td className="py-4 px-6 text-sm text-center font-medium text-slate-700">{c.ordersCount}</td>
                  <td className="py-4 px-6 text-sm text-right font-medium text-brand-navy">Rs {c.totalValue.toLocaleString()}</td>
                  <td className="py-4 px-6 text-sm">
                    {editingNotes === c.email ? (
                      <div className="flex items-center space-x-2">
                        <input 
                          type="text"
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          className="border border-brand-blue rounded px-2 py-1 text-xs w-full focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveNotes(c.email)}
                        />
                        <button onClick={() => handleSaveNotes(c.email)} className="text-green-600 p-1 hover:bg-green-50 rounded"><Check className="w-4 h-4"/></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between group">
                        <span className="text-slate-600 truncate max-w-[150px]" title={c.notes}>{c.notes || <span className="text-slate-400 italic">No notes</span>}</span>
                        <button 
                          onClick={() => { setEditingNotes(c.email); setTempNotes(c.notes); }} 
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-brand-blue p-1 rounded transition-all"
                        >
                          <Edit2 className="w-3 h-3"/>
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button 
                      onClick={() => updateCustomerMeta(c.email, { vip: !c.vip })}
                      className={`p-1.5 rounded-full transition-colors ${c.vip ? 'bg-amber-100 text-amber-500' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      <Star className="w-4 h-4" fill={c.vip ? "currentColor" : "none"} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
