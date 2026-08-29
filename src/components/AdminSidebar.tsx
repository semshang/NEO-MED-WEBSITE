"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Package, Users, Settings, LogOut } from "lucide-react";
import Image from "next/image";
import { signOut } from "next-auth/react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: Home },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="h-full flex flex-col justify-between py-6">
      <div>
        <div className="px-6 mb-8">
          <Link href="/">
            <Image 
              src="/logo-transparent.png" 
              alt="Neomeditech Logo" 
              width={160} 
              height={50} 
              className="h-8 w-auto object-contain"
              style={{ width: 'auto' }}
              priority
            />
          </Link>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-6 py-3 transition-colors ${
                  isActive 
                    ? "bg-brand-blue/5 border-l-4 border-brand-blue text-brand-blue font-semibold" 
                    : "border-l-4 border-transparent text-slate-600 hover:bg-slate-50 hover:text-brand-navy font-medium"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-brand-blue" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="px-6 mt-8">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-5 h-5 text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
