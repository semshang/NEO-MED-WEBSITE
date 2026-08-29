import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

import Image from "next/image";
import { SITE } from "@/config/site";

export default function Footer() {
  return (
    <footer className="bg-brand-navy text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand & About */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100 max-w-fit">
              <Image 
                src="/logo.png" 
                alt="Neomeditech Logo" 
                width={200} 
                height={60} 
                className="h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-slate-400 mt-4 leading-relaxed">
              Your trusted partner in providing premium medical and hospital equipment in Nepal. Genuine products, expert service, nationwide delivery.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-blue transition-colors text-white">
                <FaFacebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-blue transition-colors text-white">
                <FaTwitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-blue transition-colors text-white">
                <FaLinkedin size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-blue transition-colors text-white">
                <FaInstagram size={16} />
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
              <li><Link href="/shop?category=oxygen" className="hover:text-brand-green transition-colors">Oxygen Concentrators</Link></li>
              <li><Link href="/shop?category=ecg" className="hover:text-brand-green transition-colors">ECG Machines</Link></li>
              <li><Link href="/shop?category=monitors" className="hover:text-brand-green transition-colors">Patient Monitors</Link></li>
              <li><Link href="/shop?category=ultrasound" className="hover:text-brand-green transition-colors">Ultrasound Machines</Link></li>
              <li><Link href="/shop?category=cpap" className="hover:text-brand-green transition-colors">CPAP / BiPAP</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin size={20} className="text-brand-green shrink-0 mt-0.5" />
                <span>{SITE.address.split(',')[0]}<br />{SITE.address.split(',')[1]?.trim() || ''}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={20} className="text-brand-green shrink-0" />
                <span>{SITE.phone}<br />+977 {SITE.whatsapp}</span>
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
            <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
