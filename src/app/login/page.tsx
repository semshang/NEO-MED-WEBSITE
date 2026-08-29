"use client";

import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function LoginCard() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, delay: 0.3, ease: "easeOut" } 
    },
    errorShake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      animate={error ? ["visible", "errorShake"] : "visible"}
      className="bg-white p-8 md:p-12 rounded-2xl w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:shadow-none flex flex-col justify-center"
    >
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-3xl font-bold text-brand-navy mb-2 relative inline-block">
          Welcome to Neomeditech
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="h-1 bg-gradient-to-r from-brand-blue to-brand-green mt-1 rounded-full absolute bottom-0 left-0 -mb-2"
          />
        </h2>
        <p className="text-slate-500 mt-4 text-sm font-medium">
          Sign in to manage your orders and account
        </p>
      </div>

      <motion.button 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 hover:border-brand-blue rounded-full py-4 px-4 font-bold text-slate-700 transition-colors shadow-lg shadow-slate-200/50 disabled:opacity-70 disabled:cursor-not-allowed group"
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
        <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
      </motion.button>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="mt-8 flex items-center before:flex-1 before:border-t before:border-slate-100 before:mr-4 after:flex-1 after:border-t after:border-slate-100 after:ml-4"
      >
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
          New here? Signing in creates your account automatically
        </span>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium text-center"
        >
          Login failed or was cancelled. Please try again.
        </motion.div>
      )}
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Left Branding Panel */}
      <div className="w-full md:w-[55%] lg:w-[55%] bg-brand-navy flex flex-col justify-center px-8 py-16 md:p-16 lg:p-24 relative overflow-hidden shrink-0 shadow-2xl z-10 md:min-h-full md:[clip-path:polygon(0_0,100%_0,92%_100%,0_100%)]">
        {/* Animated Background Blobs (Desktop Only) */}
        <div className="absolute inset-0 z-0 hidden md:block overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-96 h-96 bg-brand-blue opacity-[0.15] rounded-full blur-3xl mix-blend-screen animate-blob-1" />
          <div className="absolute bottom-[10%] right-[20%] w-80 h-80 bg-brand-green opacity-[0.15] rounded-full blur-3xl mix-blend-screen animate-blob-2" />
          <div className="absolute top-[40%] right-[10%] w-72 h-72 bg-brand-blue opacity-[0.15] rounded-full blur-3xl mix-blend-screen animate-blob-3" />
        </div>

        <div className="relative z-10 md:-mr-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Link href="/">
              <Image 
                src="/logo-transparent.png" 
                alt="Neomeditech" 
                width={240} 
                height={80} 
                className="h-12 md:h-16 w-auto object-contain brightness-0 invert opacity-90"
                priority
              />
            </Link>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
            className="mt-6 text-slate-300 text-lg md:text-xl font-medium max-w-sm"
          >
            Trusted biomedical equipment, one login away.
          </motion.p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="w-full md:flex-1 flex items-center justify-center p-8 md:p-12 relative bg-white">
        <Suspense fallback={
          <div className="w-full max-w-md h-64 bg-slate-50 rounded-2xl animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-brand-blue border-t-transparent animate-spin"></div>
          </div>
        }>
          <LoginCard />
        </Suspense>
      </div>
    </div>
  );
}
