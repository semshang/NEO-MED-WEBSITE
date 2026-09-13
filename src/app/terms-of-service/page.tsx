"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUp, HelpCircle } from "lucide-react";

const sections = [
  {
    "id": "acceptance",
    "title": "Acceptance of Terms",
    "num": "1",
    "content": "By visiting our site and/or purchasing medical supplies—including but not limited to Ultrasound Transmission Gel, BP Cuffs, and Glucometers—you engage in our Service and agree to be bound by these Terms of Use. These terms apply to all users of the site, including browsers, vendors, and customers."
  },
  {
    "id": "disclaimer",
    "title": "Professional Use & Medical Disclaimer",
    "num": "2",
    "content": "Neomeditech Biomedical Solutions provides high-quality medical equipment. However:\n\n• Not Medical Advice: The content on this website is for informational purposes only and does not constitute medical advice or diagnosis.\n• User Responsibility: It is the buyer's responsibility to ensure that the equipment (e.g., Blood Pressure monitors or diagnostic tools) is used by qualified individuals or according to a healthcare provider's instructions.\n• Accuracy: While we strive for precision, we do not warrant that product descriptions or other content are 100% accurate, complete, or error-free."
  },
  {
    "id": "orders",
    "title": "Orders and Pricing",
    "num": "3",
    "content": "We reserve the right to refuse any order you place with us.\n\n• Price Changes: Prices for our products are subject to change without notice.\n• Order Limits: We may, at our sole discretion, limit or cancel quantities purchased per person or per order.\n• Availability: Certain products, like specialized medical gels or specific cuff sizes, may have limited quantities and are subject to return or exchange only according to our Return Policy."
  },
  {
    "id": "shipping",
    "title": "Shipping and Delivery",
    "num": "4",
    "content": "We aim to deliver your medical supplies promptly. However, Neomeditech Biomedical Solutions is not liable for delays caused by shipping carriers or customs clearance for international orders. Risk of loss passes to you upon our delivery to the carrier."
  },
  {
    "id": "prohibited",
    "title": "Prohibited Uses",
    "num": "5",
    "content": "In addition to other prohibitions, you are prohibited from using the site or its content: for any unlawful purpose, to solicit others to perform or participate in any unlawful acts, to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances, or to infringe upon or violate our intellectual property rights or the intellectual property rights of others."
  },
  {
    "id": "liability",
    "title": "Limitation of Liability",
    "num": "6",
    "content": "Neomeditech Biomedical Solutions shall not be liable for any injury, loss, claim, or any direct/indirect damages of any kind arising from your use of any of our products. This includes, but is not limited to, the improper calibration of a Glucometer or the misuse of Ultrasound Gel."
  },
  {
    "id": "law",
    "title": "Governing Law",
    "num": "7",
    "content": "These Terms of Use and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of Nepal."
  },
  {
    "id": "changes",
    "title": "Changes to Terms of Use",
    "num": "8",
    "content": "You can review the most current version of the Terms of Use at any time on this page. We reserve the right to update, change, or replace any part of these terms by posting updates to our website."
  }
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

export default function TermsPage() {
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
            <h3 className="font-bold text-brand-navy mb-4 text-sm uppercase tracking-wider">Contents</h3>
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
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy mb-2">Terms of Use</h1>
          <p className="text-sm text-slate-400 mb-6 pb-6 border-b border-slate-100">
            Last updated: August 2026
          </p>
          
          <div className="prose prose-slate max-w-none prose-p:text-slate-600 prose-li:text-slate-600">
            <div className="bg-brand-blue/5 border border-brand-blue/20 shadow-md rounded-2xl p-6 md:p-8 mb-8 text-lg font-medium text-slate-700">
                Welcome to Neomeditech Biomedical Solutions. By accessing or using our website, you agree to comply with and be bound by the following terms and conditions. Please read them carefully before making a purchase.
              </div>

            <div className="space-y-8 lg:space-y-12">
              {sections.map((section) => (
                <section key={section.id}>
                  <SectionHeading id={section.id} num={section.num} title={section.title} />
                  <p className="whitespace-pre-wrap">{section.content}</p>
                </section>
              ))}
            </div>

            {/* Contact Card */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="bg-brand-blue/5 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-brand-blue/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-brand-blue">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-navy text-lg m-0">Questions about these terms?</h3>
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








