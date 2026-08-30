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
        
        {/* Sign Out pinned to bottom of nav items */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center space-x-3 w-full px-6 py-3 text-slate-600 hover:bg-slate-50 hover:text-red-600 border-l-4 border-transparent transition-colors font-medium text-left"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
          <span>Sign Out</span>
        </button>
      </nav>
    </div>
  );
}
