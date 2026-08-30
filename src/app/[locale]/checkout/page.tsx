"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Package, ShieldCheck, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useAdmin } from "@/components/admin/AdminProvider";

type Profile = { name: string; email: string; phone: string; address: string };

export default function CheckoutPage() {
  const { cart, placeOrder } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", phone: "", address: "" });

  const loadProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/account/profile", { cache: "no-store" });
      if (!response.ok) return;
      const nextProfile: Profile = await response.json();
      setProfile(nextProfile);
    } catch {
      setError("We could not load your saved profile. You can still enter your details below.");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  const pricedTotal = cart.every((item) => item.price !== null)
    ? cart.reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0)
    : null;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const order = await placeOrder({ ...profile, notes: new FormData(event.currentTarget).get("notes")?.toString() ?? "" });
      setOrderId(order);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We could not send your order request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (cart.length === 0 && !orderId) {
    return <EmptyOrder />;
  }

  if (orderId) {
    return (
      <div className="min-h-[calc(100vh-160px)] bg-brand-gray flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-10 max-w-lg w-full text-center shadow-xl border border-slate-100">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
          <h1 className="text-3xl font-extrabold text-brand-navy mb-4">Request received</h1>
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 inline-block"><span className="text-slate-500 text-sm block mb-1">Request ID</span><span className="text-2xl font-bold text-brand-blue">{orderId}</span></div>
          <p className="text-slate-600 mb-8">Our team will confirm specifications, availability, pricing, and delivery options with you.</p>
          <Link href="/shop" className="inline-block w-full bg-brand-blue text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors">Continue browsing</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Link href="/shop" className="inline-flex items-center text-slate-500 hover:text-brand-blue font-medium mb-8"><ArrowLeft size={16} className="mr-2" />Back to products</Link>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <form id="checkout-form" onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-6">
              <div><h1 className="text-3xl font-extrabold text-brand-navy mb-2">Request a quote</h1><p className="text-slate-500">Send your contact details and selected equipment to our team.</p></div>
              {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Full name" value={profile.name} onChange={(name) => setProfile((current) => ({ ...current, name }))} required />
                <Field label="Phone number" value={profile.phone} onChange={(phone) => setProfile((current) => ({ ...current, phone }))} required type="tel" />
              </div>
              <Field label="Email address" value={profile.email} onChange={(email) => setProfile((current) => ({ ...current, email }))} required type="email" />
              <Field label="Delivery address" value={profile.address} onChange={(address) => setProfile((current) => ({ ...current, address }))} required />
              <div><label htmlFor="notes" className="block text-sm font-bold text-slate-700 mb-2">Order notes (optional)</label><textarea id="notes" name="notes" rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue" placeholder="Tell us about your requirements, facility, or preferred delivery date." /></div>
            </form>
          </div>
          <aside className="lg:w-1/3"><div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sticky top-24"><h2 className="text-xl font-bold text-brand-navy mb-6">Your request</h2>
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">{cart.map((item) => <div key={item.productId} className="flex gap-4"><ProductImage image={item.image} name={item.name} /><div><h3 className="font-bold text-brand-navy text-sm line-clamp-2">{item.name}</h3><p className="text-slate-500 text-xs mt-1">Quantity: {item.quantity}</p><p className="text-brand-blue font-bold text-sm mt-1">{item.price === null ? "Quote required" : `Rs ${(item.price * item.quantity).toLocaleString()}`}</p></div></div>)}</div>
            <div className="border-t border-slate-100 pt-6 space-y-3 mb-6"><div className="flex justify-between text-slate-500"><span>Items</span><span>{totalItems}</span></div><div className="flex justify-between text-brand-navy font-bold text-lg pt-2 border-t border-slate-50"><span>{pricedTotal === null ? "Pricing" : "Estimated total"}</span><span>{pricedTotal === null ? "Quote required" : `Rs ${pricedTotal.toLocaleString()}`}</span></div></div>
            <button form="checkout-form" type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-brand-blue to-brand-green text-white py-4 rounded-xl font-bold flex items-center justify-center shadow-lg disabled:opacity-70">{isSubmitting ? "Sending request…" : <><span>Send request</span><ArrowRight size={18} className="ml-2" /></>}</button>
            <div className="mt-6 bg-slate-50 rounded-xl p-4 flex items-start space-x-3 text-sm text-slate-600"><ShieldCheck size={20} className="text-brand-blue shrink-0 mt-0.5" /><p>No payment is collected online. We will confirm all commercial terms before processing.</p></div>
          </div></aside>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text" }: { label: string; value: string; onChange: (value: string) => void; required: boolean; type?: "text" | "email" | "tel" }) {
  const id = label.toLowerCase().replaceAll(" ", "-");
  return <div><label htmlFor={id} className="block text-sm font-bold text-slate-700 mb-2">{label}{required ? " *" : ""}</label><input id={id} required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue" /></div>;
}

function ProductImage({ image, name }: { image: string; name: string }) {
  return image ? <Image src={image} alt={name} width={64} height={64} sizes="64px" className="w-16 h-16 object-contain rounded-lg bg-slate-50 border border-slate-100" /> : <div aria-label={`${name} image pending`} className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400"><Package size={20} /></div>;
}

function EmptyOrder() {
  return <div className="min-h-[calc(100vh-160px)] bg-brand-gray flex items-center justify-center p-6"><div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-sm border border-slate-100"><ShoppingCart size={48} className="text-slate-300 mx-auto mb-6" /><h1 className="text-2xl font-bold text-brand-navy mb-3">Your request list is empty</h1><p className="text-slate-500 mb-8">Choose medical equipment before submitting a quote request.</p><Link href="/shop" className="inline-block w-full bg-brand-blue text-white font-bold py-4 rounded-xl hover:bg-blue-700">Browse products</Link></div></div>;
}
