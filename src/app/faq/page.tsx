"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { SITE } from "@/config/site";
import { motion } from "framer-motion";

const FAQS = [
  {
    question: "Do you provide warranty on your medical equipment?",
    answer: "Yes, all our medical equipment comes with a standard manufacturer's warranty. The duration varies by product, typically ranging from 1 to 3 years. We also offer extended warranty and AMC (Annual Maintenance Contract) options for hospitals and clinics."
  },
  {
    question: "How long does delivery take within Nepal?",
    answer: "For locations within Kathmandu valley, we usually deliver within 24 hours. For deliveries outside the valley, it typically takes 2-5 business days depending on the location and accessibility."
  },
  {
    question: "Do you offer repair and maintenance services?",
    answer: "Absolutely. We have a dedicated team of trained biomedical engineers who handle installation, preventive maintenance, and repairs. Our technical support is available 24/7 for emergency situations."
  },
  {
    question: "Can individuals purchase equipment like Oxygen Concentrators and CPAP machines?",
    answer: "Yes, we sell equipment for home care use to individuals as well. Our team will provide complete guidance and training on how to use the equipment safely at home."
  },
  {
    question: "How can I request a quote for bulk orders?",
    answer: `For hospital setups or bulk orders, please contact us via the Contact form, email us directly at ${SITE.email}, or call our sales team. We provide special pricing and comprehensive packages for institutions.`
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-brand-gray min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-brand-navy mb-4">Frequently Asked Questions</h1>
          <p className="text-slate-600 text-lg">
            Find answers to common questions about our products and services.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {FAQS.map((faq, index) => (
            <div key={index} className="border-b border-slate-100 last:border-0">
              <button
                className="w-full px-8 py-6 text-left flex justify-between items-center focus:outline-none hover:bg-slate-50 transition-colors"
                onClick={() => toggleFAQ(index)}
              >
                <span className={`font-bold text-lg pr-8 ${openIndex === index ? 'text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green' : 'text-brand-navy'}`}>
                  {faq.question}
                </span>
                <span className={`shrink-0 transition-transform duration-300 ${openIndex === index ? 'text-brand-green' : 'text-slate-400'}`}>
                  {openIndex === index ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </span>
              </button>
              
              <div 
                className={`px-8 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <p className="text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Support Banner */}
        <div className="mt-16 bg-white border border-slate-200 rounded-3xl p-8 md:p-12 text-center shadow-sm">
          <h3 className="text-2xl font-bold text-brand-navy mb-4">Still have questions?</h3>
          <p className="text-slate-600 mb-8 max-w-xl mx-auto">
            If you couldn&apos;t find the answer to your question, our support team is always ready to help you with any inquiries.
          </p>
          <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
            <Link href="/contact" className="inline-block bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold transition-opacity shadow-md">
              Contact Support
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
