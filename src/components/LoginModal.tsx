"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Headset, Truck, Shield, X, Globe, ChevronDown, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, User } from "lucide-react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useEffect, useState, FormEvent } from "react";
import { signIn } from "next-auth/react";

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.3, 
      ease: "easeOut" as any,
      staggerChildren: 0.1 
    }
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const leftPanelVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" as any } }
};

const rightPanelVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      duration: 0.4,
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as any } }
};

type AuthMode = "login" | "register" | "forgot";

export function LoginModal() {
  const tAuth = useTranslations("auth");
  const tHero = useTranslations("hero");
  const tTrust = useTranslations("trust");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (searchParams.get("login") === "true") {
      setIsOpen(true);
      setMode("login");
      setError("");
      setSuccessMsg("");
      document.body.style.overflow = "hidden";
    } else {
      setIsOpen(false);
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [searchParams]);

  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("login");
    params.delete("callbackUrl");
    const newPath = `${pathname}${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(newPath, { scroll: false });
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    const callbackUrl = searchParams.get("callbackUrl") || "/account";
    signIn("google", { callbackUrl });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    if (mode === "login") {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      } else {
        const callbackUrl = searchParams.get("callbackUrl") || "/account";
        router.push(callbackUrl);
        router.refresh();
      }
    } else if (mode === "register") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setIsLoading(false);
        return;
      }
      
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || "Registration failed");
        }
        
        // Auto sign-in after registration
        const signInRes = await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
        
        if (signInRes?.error) {
          setError("Account created, but auto-login failed. Please sign in.");
          setMode("login");
        } else {
          const callbackUrl = searchParams.get("callbackUrl") || "/account";
          router.push(callbackUrl);
          router.refresh();
        }
      } catch (err: any) {
        setError(err.message);
      }
      setIsLoading(false);
    } else if (mode === "forgot") {
      try {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        
        if (res.ok) {
          setSuccessMsg("If an account exists, a reset link has been sent to your email.");
        } else {
          setError("Failed to send reset link.");
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden my-auto max-h-[98vh] md:max-h-[95vh]"
          >
            

            {/* Left Panel - Marketing */}
              <motion.div variants={leftPanelVariants} className="hidden md:flex flex-col w-1/2 bg-gradient-to-b from-[#eff5f9] to-[#e1edf4] p-6 lg:p-8 relative overflow-hidden">
                
                {/* Background decorative elements (faint circles) */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <div className="absolute top-[20%] left-[-10%] w-[120%] h-[120%] rounded-full border-[1px] border-white/40"></div>
                  <div className="absolute top-[30%] left-[5%] w-[90%] h-[90%] rounded-full border-[1px] border-white/20"></div>
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  {/* Logo (Top Left) */}
                  <div className="mb-4 lg:mb-6">
                    <Image 
                      src="/logo-transparent.png" 
                      alt="Neomeditech" 
                      width={140} 
                      height={70} 
                      className="h-8 lg:h-10 w-auto object-contain"
                    />
                  </div>
  
                  {/* Copy (Centered) */}
                  <div className="mb-4 lg:mb-6 text-center">
                    <h2 className="text-2xl lg:text-3xl font-black text-brand-navy mb-2 leading-tight">
                      {tAuth("qualityEquip")}<br />
                      <span className="text-brand-blue">{tAuth("better")}</span>
                      <span className="text-[#10b981]"> {tAuth("outcomes")}</span>
                    </h2>
                    <p className="text-slate-600 text-xs lg:text-sm leading-snug mx-auto max-w-sm">
                      {tAuth("trustedBy")}
                    </p>
                  </div>
  
                  {/* Trust Points (Block centered, items left-aligned) */}
                  <div className="mx-auto w-fit space-y-3 lg:space-y-4 mb-2 lg:mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-white rounded-full p-1.5 shadow-sm text-brand-blue shrink-0">
                        <ShieldCheck size={16} className="lg:w-5 lg:h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy text-[11px] lg:text-[13px] leading-none">{tTrust("genuine")}</h4>
                        <p className="text-slate-500 text-[10px] lg:text-xs mt-1 leading-none">{tTrust("genuineDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white rounded-full p-1.5 shadow-sm text-brand-blue shrink-0">
                        <Headset size={16} className="lg:w-5 lg:h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy text-[11px] lg:text-[13px] leading-none">{tTrust("support")}</h4>
                        <p className="text-slate-500 text-[10px] lg:text-xs mt-1 leading-none">{tTrust("supportDesc")}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-white rounded-full p-1.5 shadow-sm text-brand-green shrink-0">
                        <Truck size={16} className="lg:w-5 lg:h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-brand-navy text-[11px] lg:text-[13px] leading-none">{tTrust("delivery")}</h4>
                        <p className="text-slate-500 text-[10px] lg:text-xs mt-1 leading-none">{tTrust("deliveryDesc")}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Image (Huge, Flex-1, pushed to edges) */}
                  <div className="w-full flex-1 flex justify-center items-end min-h-[160px] relative -mx-4 lg:-mx-8 px-4 lg:px-8">
                    <motion.img 
                      initial={{ y: 0 }}
                      animate={{ y: [-5, 5, -5] }}
                      transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                      src="/login-podium-transparent.png" 
                      alt="Neomeditech Equipment" 
                      className="w-full h-full object-contain object-bottom drop-shadow-2xl scale-[1.15] origin-bottom"
                    />

                    {/* Certified Badge (Absolute floating over bottom left of image) */}
                    <div className="absolute bottom-2 left-6 lg:left-8 bg-white/95 p-2 lg:p-3 rounded-xl shadow-lg flex items-center space-x-2 lg:space-x-3 border border-slate-100 z-20">
                      <div className="bg-[#e6f8f3] p-1.5 lg:p-2 rounded-lg text-[#10b981] shrink-0">
                        <Shield size={16} className="lg:w-5 lg:h-5" />
                      </div>
                      <div>
                        <div className="text-brand-navy font-bold text-[10px] lg:text-xs leading-none">{tTrust("certified")}</div>
                        <div className="text-slate-500 text-[9px] lg:text-[11px] mt-1 leading-none">{tTrust("certifiedDesc")}</div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
  
              {/* Right Panel - Form */}
            <div className="w-full md:w-1/2 p-5 sm:p-6 lg:p-8 flex flex-col justify-start md:justify-center overflow-y-auto custom-scrollbar">
              {/* Top Bar */}
              <div className="flex justify-end items-center mb-1 lg:mb-2 w-full gap-4">
                <LanguageSwitcher />
                <button 
                  onClick={closeModal}
                  className="w-8 h-8 lg:w-10 lg:h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <motion.div variants={rightPanelVariants} className="flex-1 flex flex-col justify-center w-full max-w-[360px] mx-auto mt-4">
                
                {/* Mobile Logo (hidden on desktop) */}
                <motion.div variants={formItemVariants} className="flex md:hidden items-center space-x-2.5 mb-4">
                  <Image 
                    src="/logo-transparent.png" 
                    alt="Neomeditech" 
                    width={96} 
                    height={48} 
                    className="h-9 w-auto object-contain -mt-1.5"
                  />
                  <div className="flex flex-col">
                    <span className="font-black tracking-widest leading-none text-[15px]">
                      <span className="text-[#0d52bc]">NEOMEDI</span>
                      <span className="text-[#10b981]">TECH</span>
                    </span>
                    <span className="text-slate-400 font-semibold text-[8px] tracking-[0.2em] uppercase mt-0.5">Biomedical Solutions</span>
                  </div>
                </motion.div>

                <motion.div variants={formItemVariants} className="mb-4">
                  <h3 className="text-2xl lg:text-3xl font-black text-brand-navy mb-2">
                    {mode === "login" ? tAuth("welcomeBack") : mode === "register" ? tAuth("createAccount") : "Reset Password"}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {mode === "login" ? tAuth("signInToAccess") : mode === "register" ? "Fill in your details to create an account" : "Enter your email to receive a reset link"}
                  </p>
                </motion.div>

                {error && (
                  <motion.div variants={formItemVariants} className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                  </motion.div>
                )}

                {successMsg && (
                  <motion.div variants={formItemVariants} className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">
                    {successMsg}
                  </motion.div>
                )}

                <motion.form variants={formItemVariants} onSubmit={handleSubmit} className="space-y-3">
                  {mode === "register" && (
                    <div>
                      <label className="block text-xs font-bold text-brand-navy mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-brand-navy mb-1.5">{tAuth("email")}</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                        placeholder={tAuth("emailPlaceholder")}
                        required
                      />
                    </div>
                  </div>

                  {mode !== "forgot" && (
                    <div>
                      <label className="block text-xs font-bold text-brand-navy mb-1.5">{tAuth("password")}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                          placeholder={tAuth("passwordPlaceholder")}
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-blue transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === "register" && (
                    <div>
                      <label className="block text-xs font-bold text-brand-navy mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                          placeholder="Confirm password"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {mode === "login" && (
                    <div className="flex items-center justify-between mt-2">
                      <label className="flex items-center space-x-2 cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/20" />
                        <span className="text-xs text-slate-500 font-medium group-hover:text-brand-navy transition-colors">{tAuth("rememberMe")}</span>
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setMode("forgot")}
                        className="text-xs font-bold text-brand-blue hover:text-brand-navy transition-colors"
                      >
                        {tAuth("forgotPassword")}
                      </button>
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 text-white font-bold py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 mt-4 flex items-center justify-center space-x-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <span>
                          {mode === "login" ? tAuth("login") : mode === "register" ? tAuth("createAccount") : "Send Reset Link"}
                        </span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.form>

                {mode !== "forgot" && (
                  <>
                    <motion.div variants={formItemVariants} className="flex items-center justify-center space-x-4 my-4">
                      <div className="h-px bg-slate-200 flex-1"></div>
                      <span className="text-[10px] lg:text-xs text-slate-500 font-bold bg-white px-2">
                        {tAuth("continueWith")}
                      </span>
                      <div className="h-px bg-slate-200 flex-1"></div>
                    </motion.div>

                    <motion.div variants={formItemVariants} className="space-y-3">
                      <button 
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.81 15.69 17.61V20.36H19.26C21.35 18.44 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                          <path d="M12 23C14.97 23 17.46 22.02 19.26 20.36L15.69 17.61C14.7 18.27 13.46 18.68 12 18.68C9.17 18.68 6.78 16.77 5.92 14.21H2.22V17.07C4.02 20.65 7.72 23 12 23Z" fill="#34A853"/>
                          <path d="M5.92 14.21C5.7 13.55 5.58 12.86 5.58 12.15C5.58 11.44 5.7 10.75 5.92 10.09V7.23H2.22C1.48 8.71 1.05 10.39 1.05 12.15C1.05 13.91 1.48 15.59 2.22 17.07L5.92 14.21Z" fill="#FBBC05"/>
                          <path d="M12 5.62C13.62 5.62 15.06 6.18 16.2 7.27L19.34 4.13C17.46 2.37 14.97 1.3 12 1.3C7.72 1.3 4.02 3.65 2.22 7.23L5.92 10.09C6.78 7.53 9.17 5.62 12 5.62Z" fill="#EA4335"/>
                        </svg>
                        <span>{tAuth("continueGoogle")}</span>
                      </button>
                    </motion.div>
                  </>
                )}

                <motion.div variants={formItemVariants} className="mt-4 lg:mt-auto text-center">
                  <p className="text-xs text-slate-500 font-medium">
                    {mode === "login" ? tAuth("noAccount") : mode === "register" ? "Already have an account?" : "Remembered your password?"}{" "}
                    <button 
                      onClick={() => setMode(mode === "login" ? "register" : "login")}
                      className="text-brand-blue hover:text-brand-navy font-bold transition-colors"
                    >
                      {mode === "login" ? tAuth("createAccount") : tAuth("login")}
                    </button>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2 flex items-center justify-center space-x-1">
                    <Shield size={12} className="text-brand-green" />
                    <span>{tAuth("secureData")}</span>
                  </p>
                </motion.div>

              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}