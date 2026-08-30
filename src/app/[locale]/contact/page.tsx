import { useTranslations } from "next-intl";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { SITE } from "@/config/site";

export const metadata = {
  title: "Contact Us | Neomeditech Biomedical Solutions",
  description: "Get in touch with Neomeditech Biomedical Solutions for inquiries, support, or quotes.",
};

export default function Contact() {
  const tContact = useTranslations("contact");
  return (
    <div className="bg-brand-gray min-h-screen py-12">
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
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
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
                    <p className="text-slate-600 mt-1">Sunday - Friday: 9:00 AM - 6:00 PM</p>
                    <p className="text-slate-600">Saturday: Closed (24/7 Support Available for Emergencies)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-2xl font-bold text-brand-navy mb-6">Send us a {tContact("formMessage")}</h3>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-brand-navy mb-2">{tContact("formName")}</label>
                    <input type="text" id="name" className="w-full px-4 py-3 bg-brand-gray border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-colors" placeholder="John Doe" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-brand-navy mb-2">{tContact("formEmail")}</label>
                    <input type="email" id="email" className="w-full px-4 py-3 bg-brand-gray border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-colors" placeholder="john@example.com" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-brand-navy mb-2">{tContact("formSubject")}</label>
                  <input type="text" id="subject" className="w-full px-4 py-3 bg-brand-gray border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-colors" placeholder="How can we help you?" />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-brand-navy mb-2">{tContact("formMessage")}</label>
                  <textarea id="message" rows={5} className="w-full px-4 py-3 bg-brand-gray border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue transition-colors resize-none" placeholder="Write your message here..."></textarea>
                </div>
                
                <button type="submit" className="bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold transition-opacity shadow-md w-full md:w-auto">
                  Send {tContact("formMessage")}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Embedded Map Placeholder */}
        <div className="mt-16">
          <div className="w-full h-96 bg-slate-200 rounded-3xl overflow-hidden relative shadow-sm border border-slate-200 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-slate-500 font-medium">Google Maps Embed Placeholder</p>
              <p className="text-slate-400 text-sm mt-2">Replace with actual iframe in production</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

