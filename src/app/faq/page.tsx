"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const FAQS = [
  {
    "question": "Who is the leading medical equipment supplier in Kathmandu, Nepal?",
    "answer": "Neomeditech Biomedical Solutions Pvt. Ltd. (based in Tarkeshwor-6, Kathmandu) is an authorized supplier of medical devices, hospital equipment, and biomedical engineering services across Nepal. We supply hospitals, nursing homes, diagnostics centers, and clinics with certified equipment, warranties, and after-sales maintenance."
  },
  {
    "question": "What types of medical equipment do you supply in Nepal?",
    "answer": "We supply a comprehensive catalog of medical machinery including medical-grade oxygen concentrators (5L & 10L), multi-parameter ICU patient monitors, 12-lead ECG machines, BiPAP/CPAP respiratory equipment, defibrillators, autoclaves and sterilizers, radiant baby warmers, CTG monitoring machines, and laboratory centrifuges."
  },
  {
    "question": "Do you provide biomedical engineering repair, calibration, and hospital maintenance?",
    "answer": "Yes. Our team of certified biomedical engineers provides on-site installation, clinical staff training, scheduled calibration, safety compliance verification, and rapid emergency repairs across Kathmandu Valley and all major cities in Nepal."
  },
  {
    "question": "Do you provide nationwide delivery across Nepal?",
    "answer": "Yes, we offer secure delivery to all 77 districts across Nepal. While we provide standard courier delivery for small medical supplies, heavy equipment (such as ICU monitors, hospital furniture, and autoclaves) is transported via specialized logistics partners with safe handling. Delivery typically takes 2–3 days in Kathmandu Valley and 4–7 days nationwide."
  },
  {
    "question": "Are your products certified for clinical use?",
    "answer": "Absolutely. Every piece of equipment we sell is sourced from reputable manufacturers and carries necessary certifications such as CE, ISO, or FDA compliance. We provide all relevant documentation and import permits required for hospital audits and regulatory compliance in Nepal."
  },
  {
    "question": "Do you offer installation and staff training?",
    "answer": "For complex medical machinery, we provide on-site installation by our certified biomedical engineers. We also offer introductory training sessions for your clinical staff to ensure the equipment is operated safely and efficiently according to international standards."
  },
  {
    "question": "How does the warranty and after-sales service work?",
    "answer": "All our major medical devices come with a standard manufacturer's warranty (typically 1–2 years). We maintain a local service center in Kathmandu with a team of technicians who can provide periodic maintenance and quick repairs to minimize downtime for your facility."
  },
  {
    "question": "What payment methods do you accept for high-value orders?",
    "answer": "We accept a variety of payment options including Fonepay, bank transfers, and Cheque payments. For large-scale hospital procurements, we can also facilitate formal billing and Letter of Credit (L/C) processes to meet institutional financial requirements."
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

