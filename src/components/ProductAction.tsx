"use client";

import { useState } from 'react';
import { Product, useAdmin } from './admin/AdminProvider';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductAction({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const { addToCart, cart } = useAdmin();
  const [addedState, setAddedState] = useState(false);

  const handleAdd = () => {
    addToCart(product, qty);
    setAddedState(true);
    setQty(1);
    setTimeout(() => setAddedState(false), 2000);
  };

  const decrement = () => setQty(prev => Math.max(1, prev - 1));
  const increment = () => setQty(prev => prev + 1);

  if (product.stock === 0) {
    return (
      <div className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl font-bold flex items-center justify-center cursor-not-allowed">
        <span className="text-red-500">Out of Stock</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3 w-full">
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-full px-2 py-1">
        <button 
          onClick={decrement}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="font-bold text-slate-700 w-8 text-center text-sm">{qty}</span>
        <button 
          onClick={increment}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>

      <motion.button 
        whileTap={{ scale: 0.97 }}
        onClick={handleAdd}
        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-sm transition-all duration-300 ${
          addedState 
            ? 'bg-green-500 text-white' 
            : 'bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 text-white'
        }`}
      >
        <ShoppingCart size={18} />
        <span>{addedState ? 'Added to Order!' : 'Add to Order'}</span>
      </motion.button>
    </div>
  );
}
