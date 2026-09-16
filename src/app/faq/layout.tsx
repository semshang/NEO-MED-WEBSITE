import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Medical Equipment FAQs",
  "Find answers about medical equipment enquiries, delivery, installation, warranty and support from Neomeditech in Nepal.",
  "/faq",
);

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
