"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

import { SITE } from "@/config/site";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-brand-navy text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & About */}
          <div className="space-y-4">
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              {SITE.tagline}
            </p>
            <div className="flex space-x-4 pt-2">
              <a href={SITE.social.facebook} target="_blank" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-blue transition-colors text-white">
                <FaFacebook size={16} />
              </a>
              <a href={SITE.social.instagram} target="_blank" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-blue transition-colors text-white">
                <FaInstagram size={16} />
              </a>
              <a href={SITE.social.youtube} target="_blank" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-blue transition-colors text-white">
                <FaYoutube size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="hover:text-brand-green transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-brand-green transition-colors">About Us</Link></li>
              <li><Link href="/shop" className="hover:text-brand-green transition-colors">Shop Equipment</Link></li>
              <li><Link href="/faq" className="hover:text-brand-green transition-colors">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-brand-green transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Equipment</h3>
            <ul className="space-y-3">
              <li><Link href="/shop" className="hover:text-brand-green transition-colors">Respiratory Care</Link></li>
              <li><Link href="/shop" className="hover:text-brand-green transition-colors">Cardiology Diagnostic Devices</Link></li>
              <li><Link href="/shop" className="hover:text-brand-green transition-colors">Emergency & Critical Care</Link></li>
              <li><Link href="/shop" className="hover:text-brand-green transition-colors">Ultrasound & Sonography</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-brand-green shrink-0 mt-0.5" />
                <span>{SITE.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-brand-green shrink-0" />
                <span>{SITE.phone.split(',')[0]}<br />{SITE.phone.split(',')[1]?.trim()}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={20} className="text-brand-green shrink-0" />
                <span>{SITE.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} {SITE.shortName} Biomedical Solutions. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
