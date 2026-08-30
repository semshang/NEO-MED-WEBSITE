import { useTranslations } from "next-intl";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { SITE } from "@/config/site";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Neomeditech Biomedical Solutions for inquiries, support, or quotes.",
};

export default function Contact() {
  const tContact = useTranslations("contact");
  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`;
  return (
    <div className="bg-[#F5F7FA] min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-brand-navy mb-4">Contact Us</h1>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Have a question about our products or need technical support? We&apos;re here to help.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Information */}
          <div className="lg:w-1/3 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-brand-navy mb-6">{tContact("title")}</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy">Our Location</h4>
                    <p className="text-slate-600 mt-1">{SITE.address.split(',')[0]}<br />{SITE.address.split(',')[1]?.trim() || ''}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy">Phone & WhatsApp</h4>
                    <p className="text-slate-600 mt-1">{SITE.phone}</p>
                    <p className="text-slate-600">+977 {SITE.whatsapp}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy">Email</h4>
                    <p className="text-slate-600 mt-1">{SITE.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy">Business Hours</h4>
                    <p className="text-slate-600 mt-1">Please contact us to confirm current business hours and support availability.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-brand-navy mb-6">Send us a {tContact("formMessage")}</h3>
              
              <ContactForm />
            </div>
          </div>
        </div>

        {/* Location link avoids loading a third-party map until the visitor chooses to open it. */}
        <div className="mt-16">
          <a href={mapSearchUrl} target="_blank" rel="noreferrer" className="w-full min-h-56 bg-slate-100 rounded-3xl overflow-hidden relative shadow-sm border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <div className="text-center">
              <MapPin size={48} className="mx-auto text-brand-green mb-4" />
              <p className="text-brand-navy font-bold">Find Neomeditech on Google Maps</p>
              <p className="text-slate-500 text-sm mt-2">{SITE.address}</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

