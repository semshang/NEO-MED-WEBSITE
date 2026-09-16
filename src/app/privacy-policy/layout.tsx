import { createPageMetadata } from "@/lib/page-metadata";

export const metadata = createPageMetadata(
  "Privacy Policy",
  "Read how Neomeditech collects, uses and protects information provided through equipment enquiries, quotations and website accounts.",
  "/privacy-policy",
);

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
