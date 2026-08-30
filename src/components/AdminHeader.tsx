"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { AdminNotifications } from "./admin/AdminNotifications";

export function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-6 py-3 max-w-full flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3">
          <Image 
            src="/logo-transparent.png" 
            alt="Neomeditech Logo" 
            width={70} 
            height={70}
            className="w-auto h-12"
            style={{ width: 'auto', height: 'auto' }}
            priority
          />
          <div className="hidden sm:flex flex-col justify-center">
            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green tracking-tight leading-none pb-0.5">
              Neomeditech
            </span>
            <span className="text-[10px] font-bold text-brand-navy tracking-widest uppercase">
              Biomedical Solutions
            </span>
          </div>
        </Link>

        {/* Notifications & Profile & Auth */}
        <div className="flex items-center space-x-4">
          <AdminNotifications />
          <div className="h-6 border-l border-slate-200"></div>
          
          <div className="flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            {session?.user?.image ? (
              <Image src={session.user.image} alt="Profile" width={28} height={28} className="rounded-full ring-2 ring-brand-blue/20" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold text-xs">
                {session?.user?.name?.charAt(0) || "A"}
              </div>
            )}
            <div className="flex flex-col pr-2">
              <span className="text-xs font-bold text-brand-navy leading-none">
                {session?.user?.name?.split(' ')[0] || "Admin"}
              </span>
              <span className="text-[9px] text-brand-blue uppercase tracking-wider font-bold">
                Admin
              </span>
            </div>
          </div>
          <div className="h-6 border-l border-slate-200"></div>
          <button 
            onClick={() => signOut({ callbackUrl: "/" })} 
            className="flex items-center space-x-2 text-sm font-bold text-slate-400 hover:text-red-600 transition-colors"
            title="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
