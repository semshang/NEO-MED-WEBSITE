"use client";
import Link from "next/link";
import { Phone, MapPin, Mail, Menu, X } from "lucide-react";
import { useState } from "react";

import Image from "next/image";
import { useEffect } from "react";

import { motion } from "framer-motion";
import { SITE } from "@/config/site";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`w-full sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white/80 backdrop-blur-sm shadow-sm'}`}>
      {/* Top Bar */}
      <div className="bg-brand-gray text-brand-navy py-2 px-4 text-sm border-b border-slate-200">
        <div className="container mx-auto flex justify-between items-center max-w-7xl">
          <div className="flex items-center space-x-6 hidden md:flex">
            <div className="flex items-center space-x-2">
              <Phone size={14} className="text-brand-green" />
              <span>{SITE.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail size={14} className="text-brand-green" />
              <span>{SITE.email}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-center w-full md:w-auto md:text-right text-xs md:text-sm">
            <MapPin size={14} className="inline mr-1 text-brand-green" />
            <span>{SITE.fullAddress}</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 py-4 max-w-7xl flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="Neomeditech Logo" 
            width={200} 
            height={60} 
            className="h-16 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8 font-medium text-brand-navy">
          <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
          <Link href="/shop" className="hover:text-brand-blue transition-colors">Shop</Link>
          <Link href="/about" className="hover:text-brand-blue transition-colors">About Us</Link>
          <Link href="/faq" className="hover:text-brand-blue transition-colors">FAQs</Link>
          <Link href="/contact" className="hover:text-brand-blue transition-colors">Contact</Link>
        </nav>

        {/* CTA */}
        <div className="hidden md:block">
          <motion.div whileTap={{ scale: 0.97 }}>
            <Link href="/contact" className="bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 text-white px-6 py-2.5 rounded-full font-medium transition-opacity shadow-sm block text-center">
              Get a Quote
            </Link>
          </motion.div>
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
          <nav className="flex flex-col p-4 space-y-4 font-medium text-brand-navy">
            <Link href="/" className="hover:text-brand-blue" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link href="/shop" className="hover:text-brand-blue" onClick={() => setIsMenuOpen(false)}>Shop</Link>
            <Link href="/about" className="hover:text-brand-blue" onClick={() => setIsMenuOpen(false)}>About Us</Link>
            <Link href="/faq" className="hover:text-brand-blue" onClick={() => setIsMenuOpen(false)}>FAQs</Link>
            <Link href="/contact" className="hover:text-brand-blue" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            <Link href="/contact" className="bg-gradient-to-r from-brand-blue to-brand-green text-white text-center px-4 py-3 rounded-xl font-medium w-full mt-2" onClick={() => setIsMenuOpen(false)}>
              Get a Quote
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
