"use client";

import { useState } from 'react';
import { useAdmin } from './admin/AdminProvider';
import { ShoppingCart, X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CartOverlay() {
  const { cart, updateCartItem, removeFromCart } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Don't show floating cart in admin panel
  if (pathname.startsWith('/admin')) return null;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      {/* Floating Button */}
      <motion.button 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-brand-blue to-brand-green text-white p-4 rounded-full shadow-2xl flex items-center justify-center hover:shadow-brand-blue/30 transition-shadow"
      >
        <div className="relative">
          <ShoppingCart size={24} />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {totalItems}
            </span>
          )}
        </div>
      </motion.button>

      {/* Slide-out Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-brand-blue/10 rounded-lg text-brand-blue">
                    <ShoppingCart size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-brand-navy">Your Order</h2>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <ShoppingCart size={48} className="text-slate-300 mb-4" />
                    <p className="text-lg font-medium">Your order list is empty.</p>
                    <p className="text-sm mt-2 text-center max-w-[250px]">Browse our products and add items to your order to request a quote.</p>
                    <button onClick={() => setIsOpen(false)} className="mt-6 text-brand-blue font-bold hover:underline">
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="flex gap-4 p-4 border border-slate-100 rounded-xl bg-white shadow-sm relative group">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-contain rounded-lg bg-slate-50 border border-slate-100" />
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h3 className="font-bold text-brand-navy text-sm line-clamp-2 pr-6">{item.name}</h3>
                          <p className="text-brand-blue font-medium text-sm mt-1">Rs {item.price.toLocaleString()}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-full px-2 py-1 w-fit">
                            <button 
                              onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="font-bold text-slate-700 text-xs w-4 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.productId)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-medium text-slate-500">Estimated Subtotal</span>
                    <span className="text-xl font-bold text-brand-navy">Rs {totalPrice.toLocaleString()}</span>
                  </div>
                  <Link href="/checkout" onClick={() => setIsOpen(false)}>
                    <motion.button 
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-brand-blue to-brand-green text-white py-4 rounded-xl font-bold flex items-center justify-center shadow-lg hover:shadow-brand-blue/30 transition-all"
                    >
                      <span>Proceed to Order</span>
                      <ArrowRight size={18} className="ml-2" />
                    </motion.button>
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
