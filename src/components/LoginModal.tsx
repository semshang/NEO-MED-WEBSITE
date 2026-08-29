"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Headset, Truck, Shield, X } from "lucide-react";

export function LoginModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const isOpen = searchParams.get("login") === "true";
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/auth-success";
  
  const [isLoading, setIsLoading] = useState(false);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClose = () => {
    // Navigate to the same path but without the login=true query param
    const params = new URLSearchParams(searchParams.toString());
    params.delete("login");
    params.delete("error");
    const newQuery = params.toString();
    router.push(pathname + (newQuery ? `?${newQuery}` : ""), { scroll: false });
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    // callbackUrl will be /auth-success which will handle role-based redirection
    await signIn("google", { callbackUrl });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Blurred Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-[8px]"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={error ? { opacity: 1, scale: 1, x: [0, -10, 10, -10, 10, 0] } : { opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ 
              duration: 0.3, 
              ease: "easeOut",
              x: { duration: 0.4 } // Shake animation duration
            }}
            className="relative w-full max-w-[900px] bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden z-10 max-h-[90vh] md:max-h-[600px]"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            {/* Left Panel (Marketing) */}
            <div className="hidden md:flex flex-col w-1/2 bg-gradient-to-br from-[#e8f1f9] to-[#d1e3f3] p-10 relative overflow-hidden">
              <div className="relative z-10 flex flex-col h-full">
                <Image 
                  src="/logo-transparent.png" 
                  alt="Neomeditech" 
                  width={160} 
                  height={50} 
                  className="h-10 w-auto object-contain mb-8"
                />
                
                <h2 className="text-3xl font-bold text-brand-navy leading-tight mb-4">
                  Quality Equipment.<br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-brand-green">
                    Better Outcomes.
                  </span>
                </h2>
                
                <p className="text-sm text-slate-600 mb-8 max-w-[90%]">
                  Trusted by hospitals and healthcare professionals across Nepal for reliable biomedical solutions.
                </p>

                <div className="space-y-5 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-full shadow-sm text-brand-blue mt-0.5">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-navy">100% Genuine Equipment</h4>
                      <p className="text-xs text-slate-500">All equipment is original and quality certified.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-full shadow-sm text-brand-blue mt-0.5">
                      <Headset size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-navy">24/7 Expert Support</h4>
                      <p className="text-xs text-slate-500">Our experts are always here to help you.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-white rounded-full shadow-sm text-brand-blue mt-0.5">
                      <Truck size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-navy">Nationwide Delivery</h4>
                      <p className="text-xs text-slate-500">Fast and safe delivery across Nepal.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto relative h-32 flex items-end">
                  {/* Decorative product platform placeholder */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-brand-blue/10 to-transparent rounded-full blur-xl"></div>
                  <Image 
                    src="/products/equipment.png" 
                    alt="Biomedical Equipment" 
                    fill
                    className="object-contain object-bottom"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg flex items-center space-x-3 border border-white/50 max-w-[85%]">
                  <div className="text-brand-green bg-brand-green/10 p-1.5 rounded-lg">
                    <Shield size={16} />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-brand-navy leading-tight">Certified Biomedical Experts</h5>
                    <p className="text-[9px] text-slate-500 leading-tight mt-0.5">Backed by years of industry experience.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel (Auth) */}
            <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col items-center justify-center relative bg-white">
              <div className="w-full max-w-[320px] flex flex-col items-center">
                {/* Mobile Logo (hidden on desktop) */}
                <Image 
                  src="/logo-transparent.png" 
                  alt="Neomeditech" 
                  width={160} 
                  height={50} 
                  className="h-10 w-auto object-contain mb-8 md:hidden"
                />

                <h3 className="text-2xl font-bold text-brand-navy text-center w-full">Welcome Back</h3>
                <p className="text-sm text-slate-500 mt-2 mb-10 text-center">Sign in to access your account</p>

                <button 
                  onClick={handleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 hover:border-brand-blue rounded-full py-3.5 px-4 font-bold text-slate-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  )}
                  <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
                </button>

                {error && (
                  <div className="mt-4 w-full p-2.5 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-medium text-center">
                    Login failed. Please try again.
                  </div>
                )}
              </div>

              {/* Secure Footer */}
              <div className="absolute bottom-6 flex items-center justify-center space-x-1.5 text-slate-400">
                <ShieldCheck size={14} />
                <span className="text-[11px]">Your data is secure and encrypted</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
