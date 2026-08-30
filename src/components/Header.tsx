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
    <header className={`w-full sticky top-0 z-50 transition-all duration-300 border-b border-slate-200 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
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
          <span className="text-2xl md:text-3xl font-black text-brand-navy tracking-tight hidden sm:block">
            Neomeditech
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-10 font-medium text-brand-navy tracking-[0.01em]">
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
        <div className="hidden md:flex items-center space-x-4">
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href="/contact" className="bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 text-white px-6 py-2.5 rounded-full font-bold transition-opacity shadow-sm block text-center">
              {t('getQuote')}
            </Link>
          </motion.div>
          
          <LanguageSwitcher />

          {session ? (
            <div className="flex items-center space-x-4 ml-2 pl-4 border-l border-slate-200">
              <div className="flex items-center space-x-2">
                {session.user?.image && (
                  <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200" />
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
              <button onClick={() => signOut()} className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
                {tAuth('logout')}
              </button>
            </div>
          ) : (
            <button onClick={() => router.push('?login=true', { scroll: false })} className="text-sm font-bold text-brand-navy hover:text-brand-blue transition-colors ml-2">
              {tAuth('login')}
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-brand-navy"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 absolute w-full left-0 shadow-lg">
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
