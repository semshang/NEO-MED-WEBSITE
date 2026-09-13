import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical Equipment Catalogue",
  description: "Browse Neomeditech medical and hospital equipment, then request a verified quotation.",
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
