import type { Metadata } from "next";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `Terms for using the ${SITE.name} website.`,
};

export default function TermsOfServicePage() {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-16 text-slate-700">
      <h1 className="mb-8 text-4xl font-extrabold text-brand-navy">Terms of Service</h1>
      <div className="space-y-7 leading-7">
        <p>Last updated: August 30, 2026</p>
        <section><h2 className="text-xl font-bold text-brand-navy">Using this site</h2><p>You may use this website to learn about Neomeditech and submit legitimate enquiries or order requests. Do not misuse the site, interfere with its operation, or submit false information.</p></section>
        <section><h2 className="text-xl font-bold text-brand-navy">Quotes and orders</h2><p>Product information, availability, and prices displayed or discussed through this site are subject to confirmation. A submitted order request is not an accepted sale or guarantee of stock. A binding sale occurs only after Neomeditech confirms the quotation, availability, and applicable terms.</p></section>
        <section><h2 className="text-xl font-bold text-brand-navy">Product information</h2><p>We aim to keep product information accurate, but specifications, availability, and images may change. Please confirm technical suitability, regulatory requirements, and warranty details with Neomeditech before purchase or clinical use.</p></section>
        <section><h2 className="text-xl font-bold text-brand-navy">Liability</h2><p>To the extent permitted by applicable law, the website is provided without warranties of uninterrupted availability or error-free content. Nothing on this website replaces professional clinical, technical, or regulatory advice.</p></section>
        <section><h2 className="text-xl font-bold text-brand-navy">Contact</h2><p>Questions about these terms can be sent to <a className="text-brand-blue underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p></section>
      </div>
    </article>
  );
}
