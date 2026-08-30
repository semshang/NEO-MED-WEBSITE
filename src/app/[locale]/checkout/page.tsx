"use client";

import { useState } from 'react';
import { useAdmin } from '@/components/admin/AdminProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, ShieldCheck, ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, placeOrder } = useAdmin();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const customer = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      notes: formData.get('notes') as string,
    };

    // Simulate API delay
    setTimeout(() => {
      try {
        const newOrderId = placeOrder(customer);
        setOrderId(newOrderId);
      } catch (err: any) {
        alert(err.message || "Failed to process order. Please check your inputs.");
      } finally {
        setIsSubmitting(false);
      }
    }, 1500);
  };

  if (cart.length === 0 && !orderId) {
    return (
      <div className="min-h-[calc(100vh-160px)] bg-brand-gray flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-sm border border-slate-100">
          <ShoppingCart size={48} className="text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-brand-navy mb-3">Your order is empty</h2>
          <p className="text-slate-500 mb-8">You haven't added any products to your order yet.</p>
          <Link href="/shop" className="inline-block w-full bg-brand-blue text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="min-h-[calc(100vh-160px)] bg-brand-gray flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-xl border border-slate-100"
        >
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-brand-navy mb-4">Order Received!</h2>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 inline-block">
            <span className="text-slate-500 text-sm block mb-1">Your Order ID</span>
            <span className="text-2xl font-bold text-brand-blue">{orderId}</span>
          </div>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Thank you for your request. We have successfully received your order details. 
            <strong className="text-brand-navy block mt-2">We will contact you shortly to confirm pricing, availability, and delivery options.</strong>
          </p>
          <Link href="/shop" className="inline-block w-full bg-brand-blue text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors">
            Continue Browsing
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/shop" className="inline-flex items-center text-slate-500 hover:text-brand-blue font-medium mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Shop
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Order Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h1 className="text-3xl font-extrabold text-brand-navy mb-2">Checkout Details</h1>
              <p className="text-slate-500 mb-8">Please provide your contact information so our team can get in touch regarding this order.</p>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                    <input name="name" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number *</label>
                    <input name="phone" required type="tel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all" placeholder="+977 98XXXXXXXX" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address (Optional)</label>
                  <input name="email" type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all" placeholder="john@example.com" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Delivery Address *</label>
                  <input name="address" required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all" placeholder="Hospital Name, Street, City" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Order Notes (Optional)</label>
                  <textarea name="notes" rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all" placeholder="Any specific requirements or questions?"></textarea>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sticky top-24">
              <h2 className="text-xl font-bold text-brand-navy mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain rounded-lg bg-slate-50 border border-slate-100" />
                    <div>
                      <h4 className="font-bold text-brand-navy text-sm line-clamp-2">{item.name}</h4>
                      <p className="text-slate-500 text-xs mt-1">Qty: {item.quantity}</p>
                      <p className="text-brand-blue font-bold text-sm mt-1">Rs {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-slate-100 pt-6 space-y-3 mb-6">
                <div className="flex justify-between text-slate-500">
                  <span>Items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex justify-between text-brand-navy font-bold text-lg pt-2 border-t border-slate-50">
                  <span>Estimated Total</span>
                  <span>Rs {totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  * Pricing is estimated. Final pricing and shipping costs will be confirmed by our team.
                </p>
              </div>

              <button 
                form="checkout-form"
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-brand-blue to-brand-green text-white py-4 rounded-xl font-bold flex items-center justify-center shadow-lg hover:shadow-brand-blue/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Submit Request</span>
                    <ArrowRight size={18} className="ml-2" />
                  </>
                )}
              </button>

              <div className="mt-6 bg-slate-50 rounded-xl p-4 flex items-start space-x-3 text-sm text-slate-600">
                <ShieldCheck size={20} className="text-brand-blue shrink-0 mt-0.5" />
                <p>Your request is secure. No payment is required at this stage.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
