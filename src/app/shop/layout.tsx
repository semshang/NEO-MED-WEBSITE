import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Medical Equipment Catalogue in Nepal",
  "Explore medical and hospital equipment from Neomeditech in Nepal. Request specifications, availability and a quotation for your facility.",
  "/shop",
);

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
