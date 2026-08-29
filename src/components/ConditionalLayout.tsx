"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login";

  return (
    <>
      {!isAuthPage && <Header />}
      <main className={isAuthPage ? "" : "min-h-screen"}>
        {children}
      </main>
      {!isAuthPage && <Footer />}
    </>
  );
}
