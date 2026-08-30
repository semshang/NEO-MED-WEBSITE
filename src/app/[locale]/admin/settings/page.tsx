"use client";
import { useState, useEffect } from "react";
import { useAdmin, Settings } from "@/components/admin/AdminProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Save, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings } = useAdmin();
  const [form, setForm] = useState<Settings>(settings);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setForm(settings), 0);
    return () => window.clearTimeout(timer);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="px-6 py-10 lg:px-10 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy">Settings</h1>
        <p className="text-slate-500 mt-1">Manage business information and preferences</p>
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit} 
        className="space-y-6"
      >
        {/* Business Info Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-bold text-brand-navy">Business Information</h2>
            <p className="text-sm text-slate-500">Contact details shown to customers</p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Numbers</label>
              <input 
                type="text" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-blue focus:outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
              <input 
                type="text" 
                value={form.whatsapp} 
                onChange={e => setForm({...form, whatsapp: e.target.value})} 
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-blue focus:outline-none" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Business Email</label>
              <input 
                type="email" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-blue focus:outline-none" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              <input 
                type="text" 
                value={form.address} 
                onChange={e => setForm({...form, address: e.target.value})} 
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-blue focus:outline-none" 
              />
            </div>
          </div>
        </div>

        {/* Notifications & Inventory Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-brand-navy">Notifications</h2>
              <p className="text-sm text-slate-500">Where to send new order alerts</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Alert Email Address</label>
              <input 
                type="email" 
                value={form.notificationEmail} 
                onChange={e => setForm({...form, notificationEmail: e.target.value})} 
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-blue focus:outline-none" 
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-brand-navy">Inventory</h2>
              <p className="text-sm text-slate-500">Configure stock thresholds</p>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Alert Threshold</label>
              <input 
                type="number" 
                min="0"
                value={form.lowStockThreshold} 
                onChange={e => setForm({...form, lowStockThreshold: parseInt(e.target.value) || 0})} 
                className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-blue focus:outline-none" 
              />
              <p className="text-xs text-slate-500 mt-2">Triggers the amber badge on the products page.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="flex items-center px-6 py-3 bg-brand-blue text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Save className="w-5 h-5 mr-2" />
            Save Changes
          </button>
        </div>
      </motion.form>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-10 left-1/2 flex items-center bg-green-600 text-white px-6 py-3 rounded-full shadow-xl z-50 font-medium"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Settings saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
