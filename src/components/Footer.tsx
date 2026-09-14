"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";

import { SITE } from "@/config/site";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.includes("/admin")) return null;

  return (
    <footer className="bg-brand-navy text-slate-300 pt-10 pb-6">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-8">
          {/* Brand & About */}
          <div className="lg:col-span-4 space-y-4">
            <div className="text-sm text-slate-400 leading-relaxed"><h3 className="text-white font-bold mb-6 text-lg">Neomeditech Biomedical Solutions</h3><p className="lg:pr-12 xl:pr-20">Medical equipment supplier in Nepal. Neomeditech provides medical and hospital equipment throughout Nepal with technical service support.</p></div>
            <div className="flex space-x-4 pt-2">
              <a href={SITE.social.facebook} target="_blank" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-blue transition-colors text-white">
                <FaFacebook size={22} />
              </a>
              <a href={SITE.social.instagram} target="_blank" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-blue transition-colors text-white">
                <FaInstagram size={22} />
              </a>
              <a href="https://www.youtube.com/channel/UCS_HxVBxzyCs5ojtAcno3tQ" target="_blank" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-blue transition-colors text-white">
                <FaYoutube size={22} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="hover:text-brand-green transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-brand-green transition-colors">About Us</Link></li>
              <li><Link href="/shop" className="hover:text-brand-green transition-colors">Shop Equipment</Link></li>
              <li><Link href="/faq" className="hover:text-brand-green transition-colors">FAQs</Link></li>
              <li><Link href="/contact" className="hover:text-brand-green transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="lg:col-span-3">
            <h3 className="text-white font-bold mb-6 text-lg">Legal</h3>
            <ul className="space-y-4">
              <li><Link href="/terms-of-service" className="hover:text-brand-green transition-colors">Terms of use</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-brand-green transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3">
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

        <div className="border-t border-slate-800 pt-6 mt-6 flex flex-col md:flex-row justify-center text-center text-sm text-slate-500">
          <p>&copy; Copyright {new Date().getFullYear()} Neomeditech. All Rights Reserved. Developed by <a href="https://unifiedsolutions.com.np/" target="_blank" rel="noopener noreferrer" className="text-[#0268d3] hover:underline">Unified Solutions</a>.</p>
          </div>
      </div>
    </footer>
  );
}
