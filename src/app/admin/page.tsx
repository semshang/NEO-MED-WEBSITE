"use client";

import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-20 max-w-7xl min-h-[60vh]">
        <div className="flex items-center space-x-4 mb-12 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="space-y-3">
            <div className="h-7 w-48 bg-slate-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-10 w-64 bg-slate-200 rounded animate-pulse mb-4"></div>
        <div className="h-6 w-96 bg-slate-200 rounded animate-pulse"></div>
      </div>
    );
  }

  // Formatting current date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-20 max-w-7xl min-h-[60vh]">
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="focus:outline-none rounded-full ring-2 ring-transparent focus:ring-brand-blue transition-all"
            >
              {session?.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt="Admin Avatar" 
                  className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-brand-blue text-white flex items-center justify-center text-xl font-bold shadow-sm">
                  {session?.user?.name ? session.user.name.charAt(0) : "A"}
                </div>
              )}
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-16 left-0 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-100 mb-1">
                  <p className="text-sm font-bold text-brand-navy truncate">{session?.user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{session?.user?.email}</p>
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-navy">
              Welcome back, {session?.user?.name ? session.user.name.split(' ')[0] : "Admin"}
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1">
              Here is what is happening today &mdash; {today}
            </p>
          </div>
        </div>
      </div>

      {/* Existing Content */}
      <h1 className="text-4xl font-bold text-brand-navy mb-4">Admin Dashboard</h1>
      <p className="text-slate-600">Welcome to the Neomeditech admin panel.</p>
    </div>
  );
}
