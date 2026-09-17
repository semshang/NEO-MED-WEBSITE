"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUp, HelpCircle, ShieldCheck } from "lucide-react";
import { SITE } from "@/config/site";

const sections = [
  { id: "information", title: "Information We Collect", num: "1" },
  { id: "usage", title: "How We Use Information", num: "2" },
  { id: "sharing", title: "Sharing and Retention", num: "3" },
  { id: "choices", title: "Your Choices", num: "4" },
  { id: "contact", title: "Contact", num: "5" },
];

function SectionHeading({ id, num, title }: { id: string; num: string; title: string }) {
  return (
    <div id={id} className="flex items-center space-x-4 mb-6 pt-16 -mt-16 group">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm">
        {num}
      </div>
      <h2 className="text-2xl font-bold text-brand-navy border-l-4 border-brand-green pl-4 m-0 py-1">
        {title}
      </h2>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show back to top button
      setShowBackToTop(window.scrollY > 400);

      // Scroll spy logic
      const sectionElements = sections.map((s) => document.getElementById(s.id));
      
      let currentSection = "";
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const el = sectionElements[i];
        if (el) {
          const rect = el.getBoundingClientRect();
          // Offset of 120px for header + sticky margin
          if (rect.top <= 150) {
            currentSection = sections[i].id;
            break;
          }
        }
      }
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-8 relative">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
        
        {/* Table of Contents - Desktop */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="font-bold text-brand-navy mb-4 text-sm uppercase tracking-wider">Contents</p>
            <ul className="space-y-3">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`block text-sm transition-colors duration-200 border-l-2 pl-3 ${
                      activeSection === section.id
                        ? "border-brand-blue text-brand-blue font-semibold"
                        : "border-transparent text-slate-500 hover:text-brand-navy hover:border-slate-300"
                    }`}
                  >
                    {section.num}. {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-grow bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 overflow-hidden">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-400 mb-6 pb-6 border-b border-slate-100">
            Last updated: August 30, 2026
          </p>

          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-li:text-slate-600">
            
            {/* Privacy Summary Box */}
            <div className="bg-brand-blue/5 border border-brand-blue/20 shadow-md rounded-2xl p-6 md:p-8 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="text-brand-green w-6 h-6" />
                <h2 className="font-bold text-brand-navy text-lg m-0">Privacy at a Glance</h2>
              </div>
              <ul className="list-disc pl-5 space-y-2 m-0 text-sm">
                <li><strong className="text-brand-navy">What we collect:</strong> Name, email address, phone number, delivery address, requested equipment, and message.</li>
                <li><strong className="text-brand-navy">How we use it:</strong> To respond to enquiries, prepare quotations, process order requests, and provide support.</li>
                <li><strong className="text-brand-navy">We do not sell personal information</strong> to third parties.</li>
              </ul>
            </div>

            <div className="space-y-8 lg:space-y-12">
              <section>
                <SectionHeading id="information" num="1" title="Information We Collect" />
                <p>
                  We collect the contact details and order-request information you provide, including your name, email address, phone number, delivery address, requested equipment, and message. If you sign in with Google, we receive the profile information permitted by your Google account.
                </p>
              </section>

              <section>
                <SectionHeading id="usage" num="2" title="How We Use Information" />
                <p>
                  We use this information to respond to enquiries, prepare quotations, process order requests, provide support, and keep business records. We do not sell personal information.
                </p>
              </section>

              <section>
                <SectionHeading id="sharing" num="3" title="Sharing and Retention" />
                <p>
                  Access is limited to authorised Neomeditech personnel and service providers needed to operate the website and fulfil requests. We retain information only for as long as reasonably necessary for these purposes or to meet legal obligations.
                </p>
              </section>

              <section>
                <SectionHeading id="choices" num="4" title="Your Choices" />
                <p>
                  You may request access, correction, or deletion of your information by contacting us. Some information may need to be retained where required for legitimate business or legal reasons.
                </p>
              </section>

              <section>
                <SectionHeading id="contact" num="5" title="Contact" />
                <p>
                  For privacy questions, contact {SITE.name} at <a className="text-brand-blue underline" href={`mailto:${SITE.email}`}>{SITE.email}</a> or visit {SITE.address}.
                </p>
              </section>
            </div>

            {/* Contact Card */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="bg-brand-blue/5 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-brand-blue/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-blue">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <h2 className="font-bold text-brand-navy text-lg m-0">Questions about your data or privacy?</h2>
                    <p className="text-slate-500 text-sm m-0 mt-1">We&apos;re here to help clarify our policies.</p>
                  </div>
                </div>
                <Link 
                  href="/contact" 
                  className="px-6 py-3 bg-brand-blue hover:bg-brand-navy transition-colors text-white rounded-xl font-medium whitespace-nowrap shadow-sm hover:shadow-md"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 w-12 h-12 bg-brand-navy text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-50 hover:bg-brand-blue hover:-translate-y-1 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
}



