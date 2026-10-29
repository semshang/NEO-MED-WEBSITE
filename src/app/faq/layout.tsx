import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Medical Equipment FAQs",
  "Find factual answers about medical equipment enquiries, specifications, quotations, availability, and technical support from Neomeditech in Nepal.",
  "/faq",
);

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}
