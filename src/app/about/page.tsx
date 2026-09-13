import Image from "next/image";
import { Target, Award, Users, ThumbsUp } from "lucide-react";
import { SITE } from "@/config/site";

export const metadata = {
  title: "About Us | Leading Medical Equipment Supplier in Nepal",
  description: `Learn about ${SITE.name}, your trusted partner for biomedical equipment sourcing, hospital maintenance, and clinical support across Nepal.`,
  alternates: {
    canonical: "/about",
  },
};

export default function About() {
    return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-blue to-brand-green py-6 md:py-8 text-white">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-white">About Neomeditech</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            We are dedicated to improving healthcare in Nepal by providing top-quality medical equipment, reliable maintenance, and exceptional customer service.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2">
              <div className="aspect-video bg-white border border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 shadow-sm relative overflow-hidden">
                <Image src="/about-team.jpg" alt="Neomeditech Team" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-3xl font-bold text-brand-navy">Our Story</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {SITE.name} helps healthcare providers explore medical-equipment options and request quotations for their facilities.
              </p>
              <p className="text-slate-600 leading-relaxed text-lg">
                We encourage customers to confirm specifications, availability, warranty, delivery, and support requirements with our team before making a purchase decision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-6 md:py-8 bg-[#F5F7FA] border-y border-gray-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Our Core Values</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">The principles that guide everything we do.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 bg-white rounded-3xl shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">Quality First</h3>
              <p className="text-slate-600">We never compromise on the quality and authenticity of our medical equipment.</p>
            </div>
            
            <div className="p-8 bg-white rounded-3xl shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">Customer Centric</h3>
              <p className="text-slate-600">Our clients&apos; needs and patient outcomes are at the heart of our business.</p>
            </div>
            
            <div className="p-8 bg-white rounded-3xl shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">Reliability</h3>
              <p className="text-slate-600">We communicate confirmed requirements, availability, and delivery options before an order is accepted.</p>
            </div>
            
            <div className="p-8 bg-white rounded-3xl shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-brand-green/10 text-brand-green rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ThumbsUp size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-navy mb-3">Integrity</h3>
              <p className="text-slate-600">We conduct our business with absolute transparency and honesty.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}










