import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Equipment Catalogue & Price Quotes in Nepal",
  description: "Browse hospital and clinical medical devices in Nepal including oxygen concentrators, ECG machines, patient monitors, autoclaves, and ultrasound systems. Request an instant verified quotation with delivery across all 77 districts of Nepal.",
  keywords: [
    "Medical equipment catalogue Nepal",
    "Buy medical equipment Nepal",
    "Hospital equipment price Nepal",
    "Oxygen concentrator Nepal",
    "Patient monitor Kathmandu",
    "ICU equipment supplier Nepal",
  ],
  alternates: {
    canonical: "/shop",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
