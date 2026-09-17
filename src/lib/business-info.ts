import { SITE } from "../config/site.ts";

export const BUSINESS_INFO = {
  name: SITE.name,
  legalName: "Neomeditech Biomedical Solutions Pvt. Ltd.",
  alternateNames: [
    "Neomeditech",
    "Neomeditech Nepal",
    "Neomeditech Biomedical Solutions",
  ] as string[],
  url: SITE.url,
  logo: `${SITE.url}/logo-transparent.png`,
  image: `${SITE.url}/hero-equipment.webp`,
  description:
    "Leading medical equipment supplier and biomedical engineering service provider in Kathmandu, Nepal. Sourcing, delivery, installation, and repair across all 77 districts.",
  telephone: "+977 9712011758",
  alternateTelephone: "+977 9712011757",
  email: SITE.email,
  priceRange: "$$",
  currenciesAccepted: "NPR",
  paymentAccepted: "Cash, Bank Transfer, Fonepay, Cheque",
  address: {
    streetAddress: "Tarakeshwar-6",
    addressLocality: "Kathmandu",
    addressRegion: "Bagmati Province",
    postalCode: "44600",
    addressCountry: "NP",
  },
  geo: {
    latitude: 27.7667,
    longitude: 85.3167,
  },
  openingHours: "Su-Fr 09:00-18:00",
  openingHoursSpecification: [
    {
      dayOfWeek: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  sameAs: [
    SITE.social.facebook,
    SITE.social.instagram,
    SITE.social.youtube,
  ],
  areaServed: [
    { "@type": "Country" as const, name: "Nepal" },
    { "@type": "City" as const, name: "Kathmandu" },
    { "@type": "City" as const, name: "Lalitpur" },
    { "@type": "City" as const, name: "Bhaktapur" },
    { "@type": "City" as const, name: "Pokhara" },
    { "@type": "City" as const, name: "Chitwan" },
    { "@type": "City" as const, name: "Biratnagar" },
  ],
};

export function getBusinessStructuredData(siteUrl: string = SITE.url) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": BUSINESS_INFO.name,
        "legalName": BUSINESS_INFO.legalName,
        "alternateName": BUSINESS_INFO.alternateNames,
        "url": siteUrl,
        "logo": {
          "@type": "ImageObject",
          "@id": `${siteUrl}/#logo`,
          "url": `${siteUrl}/logo-transparent.png`,
          "caption": BUSINESS_INFO.name,
        },
        "image": `${siteUrl}/hero-equipment.webp`,
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
        "@id": `${siteUrl}/#localbusiness`,
        "name": BUSINESS_INFO.name,
        "url": siteUrl,
        "parentOrganization": {
          "@id": `${siteUrl}/#organization`,
        },
        "logo": `${siteUrl}/logo-transparent.png`,
        "image": `${siteUrl}/hero-equipment.webp`,
        "description": BUSINESS_INFO.description,
        "telephone": [BUSINESS_INFO.telephone, BUSINESS_INFO.alternateTelephone],
        "email": BUSINESS_INFO.email,
        "priceRange": BUSINESS_INFO.priceRange,
        "currenciesAccepted": BUSINESS_INFO.currenciesAccepted,
        "paymentAccepted": BUSINESS_INFO.paymentAccepted,
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
          "dayOfWeek": spec.dayOfWeek,
          "opens": spec.opens,
          "closes": spec.closes,
        })),
        "sameAs": [...BUSINESS_INFO.sameAs],
        "areaServed": BUSINESS_INFO.areaServed,
      },
    ],
  };
}
