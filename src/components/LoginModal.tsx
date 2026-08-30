"use client";

import { signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Headset, Truck, Shield, X, Globe, ChevronDown, Mail, Lock, Eye, ArrowRight } from "lucide-react";

export function LoginModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const isOpen = searchParams.get("login") === "true";
  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/auth-success";
  
  const [isLoading, setIsLoading] = useState(false);

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
    const params = new URLSearchParams(searchParams.toString());
    params.delete("login");
    params.delete("error");
    const newQuery = params.toString();
    router.push(pathname + (newQuery ? `?${newQuery}` : ""), { scroll: false });
  };

  const handleSignIn = async () => {
    setIsLoading(true);
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
              x: { duration: 0.4 }
            }}
            className="relative w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden z-10 h-auto max-h-[95vh] md:h-[650px]"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Left Panel (Marketing) */}
            <div className="hidden md:flex flex-col w-1/2 bg-gradient-to-br from-[#eaf4fb] to-[#f4f9fd] p-12 relative overflow-hidden">
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center space-x-2 mb-12">
                  <Image 
                    src="/logo-transparent.png" 
                    alt="Neomeditech" 
                    width={40} 
                    height={40} 
                    className="w-10 h-10 object-contain"
                  />
                  <div className="flex flex-col">
                    <span className="text-brand-blue font-black tracking-widest leading-none text-[15px]">NEOMEDITECH</span>
                    <span className="text-slate-400 font-medium text-[8px] tracking-[0.2em] uppercase mt-0.5">Biomedical Solutions</span>
                  </div>
                </div>
                
                <h2 className="text-3xl font-extrabold text-brand-navy leading-tight mb-2">
                  Quality Equipment.<br />
                  <span className="text-brand-green">Better </span><span className="text-brand-blue">Outcomes.</span>
                </h2>
                
                <p className="text-sm text-slate-600 mb-8 max-w-[90%]">
                  Trusted by hospitals and healthcare professionals across Nepal for reliable biomedical solutions.
                </p>

                <div className="space-y-6 mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="text-brand-blue mt-0.5">
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-navy">100% Genuine Equipment</h4>
                      <p className="text-xs text-slate-500 mt-0.5">All equipment is original and quality certified.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="text-brand-blue mt-0.5">
                      <Headset size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-navy">24/7 Expert Support</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Our experts are always here to help you.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="text-brand-green mt-0.5">
                      <Truck size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-brand-navy">Nationwide Delivery</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Fast and safe delivery across Nepal.</p>
                    </div>
                  </div>
                </div>

                {/* Product Platforms - Redesigned to match new image */}
                <div className="mt-auto flex-1 relative flex items-end justify-center pb-8 pt-12 min-h-[160px]">
                  {/* Left Platform */}
                  <div className="absolute bottom-8 left-0 w-32 h-10 bg-[#b8dbf2] rounded-[50%] shadow-[0_8px_16px_rgba(0,0,0,0.1)]"></div>
                  {/* Center Platform */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-14 bg-[#93c5e8] rounded-[50%] shadow-[0_12px_24px_rgba(0,0,0,0.15)] z-10"></div>
                  {/* Right Platform */}
                  <div className="absolute bottom-6 right-0 w-28 h-10 bg-[#a1dfbb] rounded-[50%] shadow-[0_6px_12px_rgba(0,0,0,0.08)]"></div>

                  <div className="relative z-20 flex items-end justify-center w-full space-x-2">
                    <img 
                      src="/products/oxygen-concentrator.png" 
                      alt="Oxygen Concentrator" 
                      className="w-24 object-contain mb-8 relative z-10 drop-shadow-lg -ml-4"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <img 
                      src="/products/patient-monitor.png" 
                      alt="Patient Monitor" 
                      className="w-40 object-contain mb-8 relative z-20 drop-shadow-xl"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <img 
                      src="/products/infusion-pump.png" 
                      alt="Infusion Pump" 
                      className="w-20 object-contain mb-6 relative z-10 drop-shadow-lg -mr-4"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute bottom-6 left-12 bg-white/95 p-3.5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center space-x-3 z-30 min-w-[240px]">
                  <div className="text-brand-green bg-brand-green/10 p-1.5 rounded-full">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-navy leading-tight">Certified Biomedical Experts</h5>
                    <p className="text-[10px] text-slate-500 leading-tight mt-0.5">Backed by years of industry experience.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel (Auth) */}
            <div className="w-full md:w-1/2 p-8 sm:p-12 md:p-14 flex flex-col relative bg-white">
              
              {/* Top Right Globe */}
              <div className="absolute top-8 right-12 hidden md:flex items-center text-slate-500 hover:text-brand-navy cursor-pointer transition-colors text-sm font-medium">
                <Globe size={16} className="mr-1.5" />
                <span>English</span>
                <ChevronDown size={14} className="ml-1" />
              </div>

              <div className="flex-1 flex flex-col justify-center h-full">
                <div className="w-full max-w-[360px] mx-auto">
                  {/* Mobile Logo (hidden on desktop) */}
                  <Image 
                    src="/logo-transparent.png" 
                    alt="Neomeditech" 
                    width={160} 
                    height={50} 
                    className="h-10 w-auto object-contain mb-8 md:hidden"
                    style={{ width: 'auto' }}
                  />

                  <h3 className="text-[32px] font-bold text-brand-navy mb-1 tracking-tight">Welcome Back</h3>
                  <p className="text-sm text-slate-500 mb-8">Sign in to access your account</p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="email" placeholder="Enter your email" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all text-sm" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="password" placeholder="Enter your password" className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all text-sm" />
                        <Eye className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 cursor-pointer transition-colors" size={18} />
                      </div>
                      <div className="flex justify-end mt-2">
                        <a href="#" className="text-xs text-brand-blue font-bold hover:underline">Forgot Password?</a>
                      </div>
                    </div>

                    <div className="flex items-center mt-2 mb-6">
                      <input type="checkbox" id="remember" className="rounded text-brand-blue focus:ring-brand-blue border-slate-300 w-4 h-4" />
                      <label htmlFor="remember" className="ml-2 text-xs text-slate-600 font-medium">Remember me</label>
                    </div>

                    <button 
                      onClick={() => alert("Credentials login not implemented for mock.")}
                      className="w-full bg-gradient-to-r from-brand-blue to-brand-green text-white rounded-xl py-3.5 font-bold shadow-md hover:shadow-lg hover:opacity-95 transition-all flex items-center justify-center space-x-2"
                    >
                      <span>Sign In</span>
                      <ArrowRight size={18} />
                    </button>

                    <div className="relative flex items-center py-6">
                      <div className="flex-grow border-t border-slate-100"></div>
                      <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium">or continue with</span>
                      <div className="flex-grow border-t border-slate-100"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={handleSignIn} disabled={isLoading} className="flex items-center justify-center space-x-2 border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50 transition-colors disabled:opacity-50">
                        {isLoading ? (
                          <svg className="animate-spin h-4 w-4 text-brand-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                        )}
                        <span className="text-xs font-bold text-slate-700">Continue with Google</span>
                      </button>
                      <button onClick={() => alert("Microsoft login not configured")} className="flex items-center justify-center space-x-2 border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50 transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                          <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                          <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                          <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                          <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                        </svg>
                        <span className="text-xs font-bold text-slate-700">Continue with Microsoft</span>
                      </button>
                    </div>

                    <p className="text-center text-xs text-slate-600 mt-8">
                      Don't have an account? <a href="#" className="text-brand-blue font-bold hover:underline">Create Account</a>
                    </p>
                  </div>
                </div>
              </div>

              {/* Secure Footer */}
              <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center space-x-1.5 text-slate-400">
                <ShieldCheck size={14} />
                <span className="text-[11px] font-medium">Your data is secure and encrypted</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
