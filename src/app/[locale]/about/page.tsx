import { useTranslations } from "next-intl";
import { Target, Award, Users, ThumbsUp } from "lucide-react";
import { SITE } from "@/config/site";

export const metadata = {
  title: `About Us | ${SITE.name}`,
  description: `Learn about ${SITE.name}, your trusted partner for biomedical equipment in Nepal.`,
};

export default function About() {
  const tAbout = useTranslations("about");
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-brand-blue to-brand-green py-20 text-white">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">{tAbout("title")}</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            {tAbout("subtitle")}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="md:w-1/2">
              <div className="aspect-video bg-white border border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 shadow-sm relative overflow-hidden">
                <span className="relative z-10">Company Team Image</span>
              </div>
            </div>
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-3xl font-bold text-brand-navy">Our Story</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                Founded with a mission to bridge the gap in quality healthcare equipment in Nepal, {SITE.name} has grown into a trusted partner for hospitals, clinics, and individual patients across the country.
              </p>
              <p className="text-slate-600 leading-relaxed text-lg">
                We understand that reliable medical equipment is a matter of life and death. That&apos;s why we meticulously source our products from globally renowned manufacturers and maintain a team of highly skilled biomedical engineers to ensure every piece of equipment functions perfectly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-[#F5F7FA] border-y border-gray-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
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
              <p className="text-slate-600">We ensure 24/7 support and timely delivery to be there when you need us most.</p>
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
