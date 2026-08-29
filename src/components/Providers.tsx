"use client";

import { SessionProvider } from "next-auth/react";
import { AdminProvider } from "@/components/admin/AdminProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminProvider>
        {children}
      </AdminProvider>
    </SessionProvider>
  );
}
