"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { serializeJsonLd } from "@/lib/catalogue-structured-data";

const FAQS = [
  {
    "question": "What can I ask Neomeditech about medical equipment?",
    "answer": "You can ask about products in the current catalogue, specifications, availability, quotation requirements, and technical support for your facility."
  },
  {
    "question": "What types of equipment are in the current catalogue?",
    "answer": "The catalogue includes diagnostic devices, laboratory equipment, respiratory care products, patient monitoring accessories, hospital furniture and infrastructure, sterilization equipment, medical supplies, and related equipment categories."
  },
  {
    "question": "How can I request a quotation?",
    "answer": "Use the contact form or WhatsApp link and include the product name, required specifications, quantity, and facility details so the team can review your request."
  },
  {
    "question": "How can I confirm product availability?",
    "answer": "Contact Neomeditech before ordering to confirm current availability, specifications, and delivery requirements for the product you are considering."
  },
  {
    "question": "What biomedical equipment services are available?",
    "answer": "Technical support, including repair, calibration, or installation, may be available depending on the equipment and service requirements. Contact the team to confirm whether your specific requirement can be supported."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <div className="bg-brand-gray min-h-screen py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-brand-navy mb-4">Frequently Asked Questions</h1>
          <p className="text-slate-600 text-lg">
            Find answers to common questions about our products and services.
          </p>
        </div>

        <h2 className="sr-only">Common Questions & Answers</h2>
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {FAQS.map((faq, index) => (
            <div key={index} className="border-b border-slate-100 last:border-0">
              <button
                id={`faq-question-${index}`}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
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
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                aria-hidden={openIndex !== index}
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
          <h2 className="text-2xl font-bold text-brand-navy mb-4">Still have questions?</h2>
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

