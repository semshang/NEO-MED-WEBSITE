"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Package, Users, Settings, LogOut } from "lucide-react";
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
    <div className="flex flex-col py-6">
      <nav className="space-y-3 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ease-out border-l-4 ${
                isActive 
                  ? "bg-brand-blue/10 border-brand-blue text-brand-blue font-bold shadow-sm" 
                  : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-brand-navy hover:shadow-sm hover:border-slate-200 font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-brand-blue" : "text-slate-400 group-hover:text-brand-navy"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
        
        {/* Sign Out pinned to bottom of nav items, with mb-20 to clear floating Next.js/chat widget */}
        <div className="mt-8 mb-20">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="group flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ease-out border-l-4 border-transparent text-slate-600 hover:bg-red-50 hover:text-red-600 hover:shadow-sm hover:border-red-200 font-medium text-left"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
