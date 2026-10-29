import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Providers } from "@/components/Providers";
import { SITE } from "@/config/site";
import { LoginModal } from "@/components/LoginModal";
import { Suspense } from "react";
import { AuthToast } from "@/components/AuthToast";
import { serializeJsonLd } from "@/lib/catalogue-structured-data";
import { BUSINESS_INFO } from "@/lib/business-info";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Medical Equipment Supplier in Nepal | Neomeditech",
    template: "%s | Neomeditech",
  },
  description: "Neomeditech Biomedical Solutions provides medical equipment information, specifications, quotations, and technical support for healthcare facilities.",
  authors: [{ name: "Neomeditech Biomedical Solutions Pvt. Ltd.", url: SITE.url }],
  creator: "Neomeditech Biomedical Solutions Pvt. Ltd.",
  publisher: "Neomeditech Biomedical Solutions Pvt. Ltd.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE.url,
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: "Medical Equipment Supplier in Nepal | Neomeditech",
    description: "Neomeditech Biomedical Solutions provides medical equipment information, specifications, quotations, and technical support for healthcare facilities.",
    url: SITE.url,
    locale: "en_US",
    images: [
      {
        url: "/hero-equipment.webp",
        width: 1024,
        height: 768,
        alt: "Neomeditech medical equipment supplier Nepal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Medical Equipment Supplier in Nepal | Neomeditech",
    description: "Neomeditech Biomedical Solutions provides medical equipment information, specifications, quotations, and technical support for healthcare facilities.",
    images: ["/hero-equipment.webp"],
  },
  other: {
    "geo.region": "NP-BA",
    "geo.placename": "Kathmandu",
    "geo.position": "27.7667;85.3167",
    "ICBM": "27.7667, 85.3167",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE.url}/#organization`,
        "name": BUSINESS_INFO.name,
        "legalName": BUSINESS_INFO.legalName,
        "alternateName": [...BUSINESS_INFO.alternateNames],
        "url": SITE.url,
        "logo": {
          "@type": "ImageObject",
          "@id": `${SITE.url}/#logo`,
          "url": BUSINESS_INFO.logo,
          "caption": BUSINESS_INFO.name,
        },
        "image": BUSINESS_INFO.image,
        "description": BUSINESS_INFO.description,
        "email": BUSINESS_INFO.email,
        "telephone": BUSINESS_INFO.telephone,
        "sameAs": [...BUSINESS_INFO.sameAs],
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": BUSINESS_INFO.telephone,
            "contactType": "sales and customer support",
            "areaServed": "NP",
            "availableLanguage": ["en", "ne"],
          },
        ],
      },
      {
        "@type": "MedicalBusiness",
        "@id": `${SITE.url}/#localbusiness`,
        "name": BUSINESS_INFO.name,
        "url": SITE.url,
        "parentOrganization": {
          "@id": `${SITE.url}/#organization`,
        },
        "logo": BUSINESS_INFO.logo,
        "image": BUSINESS_INFO.image,
        "description": BUSINESS_INFO.description,
        "telephone": [BUSINESS_INFO.telephone, BUSINESS_INFO.alternateTelephone],
        "email": BUSINESS_INFO.email,
        "additionalType": "https://en.wikipedia.org/wiki/Medical_equipment",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": BUSINESS_INFO.address.streetAddress,
          "addressLocality": BUSINESS_INFO.address.addressLocality,
          "addressRegion": BUSINESS_INFO.address.addressRegion,
          "postalCode": BUSINESS_INFO.address.postalCode,
          "addressCountry": BUSINESS_INFO.address.addressCountry,
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": BUSINESS_INFO.geo.latitude,
          "longitude": BUSINESS_INFO.geo.longitude,
        },
        "openingHoursSpecification": BUSINESS_INFO.openingHoursSpecification.map((spec) => ({
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [...spec.dayOfWeek],
          "opens": spec.opens,
          "closes": spec.closes,
        })),
        "sameAs": [...BUSINESS_INFO.sameAs],
        "areaServed": [...BUSINESS_INFO.areaServed],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(orgJsonLd) }}
        />
      </head>
      <body className="font-sans overflow-x-hidden">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-3 focus:text-brand-navy focus:shadow-lg"
          >
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className="min-h-screen">
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
