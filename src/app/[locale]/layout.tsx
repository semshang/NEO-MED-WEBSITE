import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { SITE } from "@/config/site";
import { LoginModal } from "@/components/LoginModal";
import { Suspense } from "react";
import CartOverlay from "@/components/CartOverlay";
import { AuthToast } from "@/components/AuthToast";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${SITE.name} | Premium Medical Equipment`,
  description: "Your trusted partner in providing premium medical and hospital equipment in Nepal.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.className} overflow-x-hidden`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
            <CartOverlay />
            <Suspense fallback={null}>
              <AuthToast />
            </Suspense>
            <Footer />
            <Suspense fallback={null}>
              <LoginModal />
            </Suspense>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
