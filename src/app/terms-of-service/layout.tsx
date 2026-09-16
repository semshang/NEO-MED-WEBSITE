import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Terms of Use",
  "Read the terms for using the Neomeditech website, requesting equipment quotations, placing orders and arranging delivery.",
  "/terms-of-service",
);

export default function TermsOfServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
