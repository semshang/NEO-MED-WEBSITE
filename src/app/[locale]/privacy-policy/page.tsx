import type { Metadata } from "next";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE.name} collects and uses personal information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-16 text-slate-700">
      <h1 className="mb-8 text-4xl font-extrabold text-brand-navy">Privacy Policy</h1>
      <div className="space-y-7 leading-7">
        <p>Last updated: August 30, 2026</p>
        <section><h2 className="text-xl font-bold text-brand-navy">Information we collect</h2><p>We collect the contact details and order-request information you provide, including your name, email address, phone number, delivery address, requested equipment, and message. If you sign in with Google, we receive the profile information permitted by your Google account.</p></section>
        <section><h2 className="text-xl font-bold text-brand-navy">How we use information</h2><p>We use this information to respond to enquiries, prepare quotations, process order requests, provide support, and keep business records. We do not sell personal information.</p></section>
        <section><h2 className="text-xl font-bold text-brand-navy">Sharing and retention</h2><p>Access is limited to authorised Neomeditech personnel and service providers needed to operate the website and fulfil requests. We retain information only for as long as reasonably necessary for these purposes or to meet legal obligations.</p></section>
        <section><h2 className="text-xl font-bold text-brand-navy">Your choices</h2><p>You may request access, correction, or deletion of your information by contacting us. Some information may need to be retained where required for legitimate business or legal reasons.</p></section>
        <section><h2 className="text-xl font-bold text-brand-navy">Contact</h2><p>For privacy questions, contact {SITE.name} at <a className="text-brand-blue underline" href={`mailto:${SITE.email}`}>{SITE.email}</a> or visit {SITE.address}.</p></section>
      </div>
    </article>
  );
}
