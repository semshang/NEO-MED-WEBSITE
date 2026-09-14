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
    default: "Medical Equipment Supplier in Nepal | Neomeditech",
    template: "%s | Neomeditech",
  },
  description: "Neomeditech Biomedical Solutions supplies medical and biomedical equipment, hospital devices, and technical support services across Nepal.",
  keywords: [
    "Medical equipment in Nepal",
    "Medical equipment supplier Nepal",
    "Biomedical solutions Nepal",
    "Hospital equipment supplier Kathmandu",
    "Oxygen concentrator price in Nepal",
    "Patient monitor Nepal",
    "ECG machine supplier Nepal",
    "Biomedical engineering services Nepal",
    "ICU equipment Kathmandu",
    "Autoclave machine Nepal",
    "Neomeditech",
    "Neomeditech Biomedical Solutions",
  ],
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
    description: "Neomeditech Biomedical Solutions supplies medical and biomedical equipment, hospital devices, and technical support services across Nepal.",
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
    description: "Neomeditech Biomedical Solutions supplies medical and biomedical equipment, hospital devices, and technical support services across Nepal.",
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
    "@type": "MedicalBusiness",
    "name": SITE.name,
    "alternateName": ["Neomeditech", "Neomeditech Nepal", "Neomeditech Biomedical"],
    "url": SITE.url,
    "logo": `${SITE.url}/logo-transparent.png`,
    "image": `${SITE.url}/hero-equipment.webp`,
    "description": "Leading medical equipment supplier and biomedical engineering service provider in Kathmandu, Nepal. Sourcing, delivery, installation, and repair across all 77 districts.",
    "telephone": [
      "+977 9712011758",
      "+977 9712011757"
    ],
    "email": SITE.email,
    "priceRange": "$$",
    "currenciesAccepted": "NPR",
    "paymentAccepted": "Cash, Bank Transfer, Fonepay, Cheque",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Tarkeshwor-6",
      "addressLocality": "Kathmandu",
      "addressRegion": "Bagmati Province",
      "postalCode": "44600",
      "addressCountry": "NP"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 27.7667,
      "longitude": 85.3167
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      }
    ],
    "areaServed": [
      { "@type": "Country", "name": "Nepal" },
      { "@type": "City", "name": "Kathmandu" },
      { "@type": "City", "name": "Lalitpur" },
      { "@type": "City", "name": "Bhaktapur" },
      { "@type": "City", "name": "Pokhara" },
      { "@type": "City", "name": "Chitwan" },
      { "@type": "City", "name": "Biratnagar" }
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+977 9712011758",
        "contactType": "sales and customer support",
        "areaServed": "NP",
        "availableLanguage": ["en", "ne"]
      }
    ],
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
