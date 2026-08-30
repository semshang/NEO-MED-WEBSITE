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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Blurred Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
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
            className="relative w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden z-10 max-h-[95vh] md:max-h-[90vh] overflow-y-auto"
          >

            {/* Left Panel (Marketing) */}
            <div className="hidden md:flex flex-col w-1/2 bg-[#eff5f9] p-8 relative overflow-hidden">
              <div className="relative z-10 flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center space-x-2 mb-6">
                  <Image 
                    src="/logo-transparent.png" 
                    alt="Neomeditech" 
                    width={80} 
                    height={40} 
                    className="h-7 lg:h-8 w-auto object-contain"
                  />
                  <div className="flex flex-col">
                    <span className="font-black tracking-widest leading-none text-xs lg:text-sm">
                      <span className="text-[#0d52bc]">NEOMEDI</span>
                      <span className="text-[#10b981]">TECH</span>
                    </span>
                    <span className="text-slate-400 font-semibold text-[7px] tracking-[0.2em] uppercase mt-0.5">Biomedical Solutions</span>
                  </div>
                </div>
                
                <h2 className="text-2xl lg:text-[28px] font-extrabold text-brand-navy leading-tight mb-2">
                  Quality Equipment.<br />
                  <span className="text-[#0d52bc]">Better </span><span className="text-[#10b981]">Outcomes.</span>
                </h2>
                
                <p className="text-[11px] lg:text-xs text-slate-600 mb-5 max-w-[95%] leading-relaxed">
                  Trusted by hospitals and healthcare professionals across Nepal for reliable biomedical solutions.
                </p>

                <div className="space-y-3 mb-2 relative z-20">
                  <div className="flex items-start space-x-3">
                    <div className="text-[#0d52bc] mt-0.5">
                      <ShieldCheck size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[11px] lg:text-xs text-brand-navy">100% Genuine Equipment</h4>
                      <p className="text-[10px] lg:text-[11px] text-slate-500 mt-0.5">All equipment is original and quality certified.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-[#0d52bc] mt-0.5">
                      <Headset size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[11px] lg:text-xs text-brand-navy">24/7 Expert Support</h4>
                      <p className="text-[10px] lg:text-[11px] text-slate-500 mt-0.5">Our experts are always here to help you.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="text-[#10b981] mt-0.5">
                      <Truck size={18} strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[11px] lg:text-xs text-brand-navy">Nationwide Delivery</h4>
                      <p className="text-[10px] lg:text-[11px] text-slate-500 mt-0.5">Fast and safe delivery across Nepal.</p>
                    </div>
                  </div>
                </div>

                {/* Product Platforms & Badge */}
                <div className="mt-auto flex-1 relative flex items-end justify-center w-full min-h-[160px] lg:min-h-[200px] pt-4">
                  <img 
                    src="/login-podium-transparent.png" 
                    alt="Neomeditech Equipment" 
                    className="w-full max-h-[180px] lg:max-h-[240px] object-contain object-bottom relative z-10 drop-shadow-xl"
                  />

                  {/* Floating Badge */}
                  <div className="absolute bottom-2 lg:bottom-4 left-0 bg-white/95 p-2.5 lg:p-3 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex items-center space-x-2.5 z-30 min-w-[180px] lg:min-w-[200px] border border-slate-100">
                    <div className="text-[#10b981] bg-[#10b981]/10 p-1.5 rounded-full">
                      <ShieldCheck size={14} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h5 className="text-[10px] lg:text-[11px] font-bold text-brand-navy leading-tight">Certified Biomedical Experts</h5>
                      <p className="text-[8px] lg:text-[9px] text-slate-500 leading-tight mt-0.5">Backed by years of industry experience.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel (Auth) */}
            <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col relative bg-white">
              
              {/* Top Right Controls */}
              <div className="absolute top-6 right-6 flex items-center space-x-4">
                <div className="flex items-center text-slate-500 hover:text-brand-navy cursor-pointer transition-colors text-xs font-medium">
                  <Globe size={14} className="mr-1.5" />
                  <span>English</span>
                  <ChevronDown size={12} className="ml-1" />
                </div>
                <button 
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={22} strokeWidth={2} />
                </button>
              </div>

              <div className="flex-1 flex flex-col justify-center w-full max-w-[360px] mx-auto mt-4">
                
                {/* Mobile Logo (hidden on desktop) */}
                <div className="flex md:hidden items-center space-x-2 mb-6">
                  <Image 
                    src="/logo-transparent.png" 
                    alt="Neomeditech" 
                    width={80} 
                    height={40} 
                    className="h-7 w-auto object-contain"
                  />
                  <div className="flex flex-col">
                    <span className="font-black tracking-widest leading-none text-sm">
                      <span className="text-[#0d52bc]">NEOMEDI</span>
                      <span className="text-[#10b981]">TECH</span>
                    </span>
                    <span className="text-slate-400 font-semibold text-[8px] tracking-[0.2em] uppercase mt-0.5">Biomedical Solutions</span>
                  </div>
                </div>

                <h3 className="text-2xl lg:text-[28px] font-bold text-brand-navy mb-1 tracking-tight">Welcome Back</h3>
                <p className="text-xs lg:text-[13px] text-slate-500 mb-6">Sign in to access your account</p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="email" placeholder="Enter your email" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0d52bc] focus:ring-1 focus:ring-[#0d52bc] transition-all text-xs lg:text-sm" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input type="password" placeholder="Enter your password" className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-[#0d52bc] focus:ring-1 focus:ring-[#0d52bc] transition-all text-xs lg:text-sm" />
                      <Eye className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 cursor-pointer transition-colors" size={16} />
                    </div>
                    <div className="flex justify-end mt-1.5">
                      <a href="#" className="text-[10px] lg:text-[11px] text-[#0d52bc] font-bold hover:underline">Forgot Password?</a>
                    </div>
                  </div>

                  <div className="flex items-center mt-1 mb-4">
                    <input type="checkbox" id="remember" className="rounded text-[#0d52bc] focus:ring-[#0d52bc] border-slate-300 w-3.5 h-3.5" />
                    <label htmlFor="remember" className="ml-2 text-[10px] lg:text-[11px] text-slate-600 font-medium">Remember me</label>
                  </div>

                  <button 
                    onClick={() => alert("Credentials login not implemented for mock.")}
                    className="w-full bg-gradient-to-r from-[#0d52bc] to-[#10b981] text-white rounded-xl py-3 font-bold shadow-md hover:shadow-lg hover:opacity-95 transition-all flex items-center justify-center space-x-2"
                  >
                    <span className="text-sm">Sign In</span>
                    <ArrowRight size={16} />
                  </button>

                  <div className="relative flex items-center py-4 lg:py-5">
                    <div className="flex-grow border-t border-slate-100"></div>
                    <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] lg:text-[11px] font-medium">or continue with</span>
                    <div className="flex-grow border-t border-slate-100"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={handleSignIn} disabled={isLoading} className="flex items-center justify-center space-x-2 border border-slate-200 rounded-xl py-2 hover:bg-slate-50 transition-colors disabled:opacity-50">
                      {isLoading ? (
                        <svg className="animate-spin h-4 w-4 text-[#0d52bc]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      )}
                      <span className="text-[10px] lg:text-[11px] font-bold text-slate-700">Continue with Google</span>
                    </button>
                    <button onClick={() => alert("Microsoft login not configured")} className="flex items-center justify-center space-x-2 border border-slate-200 rounded-xl py-2 hover:bg-slate-50 transition-colors">
                      <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                        <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                        <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                        <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                        <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                      </svg>
                      <span className="text-[10px] lg:text-[11px] font-bold text-slate-700">Continue with Microsoft</span>
                    </button>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="mt-6 flex flex-col items-center">
                  <p className="text-[10px] lg:text-[11px] text-slate-600 mb-2">
                    Don't have an account? <a href="#" className="text-[#0d52bc] font-bold hover:underline">Create Account</a>
                  </p>
                  
                  <div className="flex items-center space-x-1.5 text-slate-400">
                    <ShieldCheck size={14} />
                    <span className="text-[9px] lg:text-[10px] font-medium">Your data is secure and encrypted</span>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
