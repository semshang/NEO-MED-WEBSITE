"use client";
import { Link } from "@/i18n/routing";
import { Phone, MapPin, Mail, Menu, X } from "lucide-react";
import { useState } from "react";

import Image from "next/image";
import { useEffect } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

import { motion } from "framer-motion";
import { SITE } from "@/config/site";

const NAV_LINKS = [
  { key: "home", href: "/" },
  { key: "shop", href: "/shop" },
  { key: "about", href: "/about" },
  { key: "faq", href: "/faq" },
  { key: "contact", href: "/contact" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`w-full sticky top-0 z-50 transition-all duration-300 border-b border-gray-200 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/90 backdrop-blur-sm'}`}>
      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-5 max-w-7xl flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <Image 
            src="/logo-transparent.png" 
            alt="Neomeditech Logo" 
            width={80} 
            height={80} 
            className="h-16 md:h-20 w-auto object-contain"
            style={{ width: 'auto' }}
            priority
          />
          <div className="hidden sm:flex flex-col justify-center">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green tracking-tight leading-none pb-0.5">
              Neomeditech
            </span>
            <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green uppercase tracking-[0.2em] mt-0.5 leading-none">
              Biomedical Solutions
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center space-x-6 xl:space-x-10 font-medium text-brand-navy tracking-[0.01em]">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.key}
                href={link.href as any} 
                className={`relative group py-2 transition-colors duration-200 ${isActive ? 'text-brand-blue' : 'hover:text-brand-blue'}`}
              >
                {t(link.key as any)}
                {/* Active Indicator / Hover Underline */}
                <span 
                  className={`absolute bottom-0 left-0 h-[2px] bg-brand-blue transition-all duration-200 ease-out ${
                    isActive ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* CTA & Auth */}
        <div className="hidden xl:flex items-center space-x-4">
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href="/contact" className="bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 text-white px-6 py-2.5 rounded-full font-bold transition-opacity shadow-sm block text-center">
              {t('getQuote')}
            </Link>
          </motion.div>
          
          <LanguageSwitcher />

          {session ? (
            <div className="flex items-center space-x-4 ml-2 pl-4 border-l border-slate-200">
              <div className="flex items-center space-x-2">
                {session.user?.image ? (
                  <Image src={session.user.image} alt="Profile" width={32} height={32} className="rounded-full ring-2 ring-brand-blue/20" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-sm">
                    {session.user?.name?.charAt(0) || "U"}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-brand-navy leading-none">
                    {session.user?.email === "semshangtmg46@gmail.com" ? "Semshang" : session.user?.name?.split(' ')[0]}
                  </span>
                  {session.user?.role === "admin" ? (
                    <div className="flex items-center space-x-2 text-[10px] uppercase tracking-wider font-bold">
                      <Link href="/admin" className="text-brand-blue hover:underline">Admin</Link>
                      <span className="text-slate-300">|</span>
                      <Link href="/account" className="text-slate-500 hover:text-brand-blue transition-colors">Account</Link>
                    </div>
                  ) : (
                    <Link href="/account" className="text-[10px] text-brand-blue hover:underline uppercase tracking-wider font-bold">Account</Link>
                  )}
                </div>
              </div>
              <button onClick={() => signOut()} className="text-slate-400 hover:text-brand-blue transition-colors p-2" title="Sign Out">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              </button>
            </div>
          ) : (
            <button onClick={() => router.push('?login=true', { scroll: false })} className="text-brand-navy hover:text-brand-blue font-bold px-4 py-2 transition-colors">
              {tAuth('login')}
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="xl:hidden text-brand-navy"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="xl:hidden bg-white border-t border-slate-100 absolute w-full left-0 shadow-lg">
          <nav className="flex flex-col p-4 space-y-4 font-medium text-brand-navy tracking-[0.01em]">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.key}
                  href={link.href as any} 
                  className={`transition-colors ${isActive ? 'text-brand-blue font-bold' : 'hover:text-brand-blue'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t(link.key as any)}
                </Link>
              );
            })}
            <Link href="/contact" className="bg-gradient-to-r from-brand-blue to-brand-green text-white text-center px-4 py-3 rounded-xl font-bold w-full mt-2 shadow-sm" onClick={() => setIsMenuOpen(false)}>
              {t('getQuote')}
            </Link>
            
            <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col space-y-4">
              {session ? (
                <>
                  {session.user?.role === "admin" ? (
                    <>
                      <Link href="/admin" className="hover:text-brand-blue transition-colors font-bold" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
                      <Link href="/account" className="hover:text-brand-blue transition-colors font-bold" onClick={() => setIsMenuOpen(false)}>My Account</Link>
                    </>
                  ) : (
                    <Link href="/account" className="hover:text-brand-blue transition-colors font-bold" onClick={() => setIsMenuOpen(false)}>My Account</Link>
                  )}
                  <button onClick={() => { signOut(); setIsMenuOpen(false); }} className="text-left hover:text-brand-blue transition-colors text-slate-500">
                    {tAuth('logout')} ({session.user?.email === "semshangtmg46@gmail.com" ? "Semshang" : session.user?.name})
                  </button>
                </>
              ) : (
                <button onClick={() => { router.push('?login=true', { scroll: false }); setIsMenuOpen(false); }} className="text-left hover:text-brand-blue transition-colors font-bold">
                  {tAuth('continueGoogle')}
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
