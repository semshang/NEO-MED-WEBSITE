import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { SITE } from "@/config/site";
import { LoginModal } from "@/components/LoginModal";
import { Suspense } from "react";
import { AuthToast } from "@/components/AuthToast";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Medical Equipment in Nepal`,
    template: "%s | Neomeditech",
  },
  description: SITE.tagline,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} | Medical Equipment in Nepal`,
    description: SITE.tagline,
    images: [
      {
        url: "/hero-equipment.webp",
        width: 1024,
        height: 768,
        alt: "Neomeditech medical equipment",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.tagline,
    images: ["/hero-equipment.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": SITE.name,
    "url": SITE.url,
    "telephone": [
      "+977 9712011758",
      "+977 9712011757"
    ],
    "email": SITE.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tarkeshwor-6",
      "addressLocality": "Kathmandu",
      "addressCountry": "Nepal"
    },
    "sameAs": [
      SITE.social.facebook,
      SITE.social.instagram,
      SITE.social.youtube
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="font-sans overflow-x-hidden">
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Suspense fallback={null}>
            <AuthToast />
          </Suspense>
          <Footer />
          <Suspense fallback={null}>
            <LoginModal />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
