"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, FlaskConical, Users, Globe, Heart, Package } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { SITE } from "@/config/site";
import { useAdmin } from "@/components/admin/AdminProvider";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const heroBadgeVariant: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, delay: 0.1, ease: "easeOut" } }
};

const heroHeadlineVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" } }
};

const heroSubtextVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.35, ease: "easeOut" } }
};

const heroButtonsVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" } }
};

export default function Home() {
    const { products } = useAdmin();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 2000, stopOnInteraction: false })]
  );

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex items-center justify-start overflow-hidden pt-4 lg:pt-6 pb-24 lg:pb-36 bg-gradient-to-r from-white via-[#f4f9fd] to-[#e8f4fd]">
        {/* Content */}
        <div className="container mx-auto px-4 max-w-7xl relative z-20 py-4 flex flex-col lg:flex-row items-center lg:items-start justify-between">
          <div className="w-full lg:w-[55%] xl:w-[50%] max-w-2xl z-10 text-center lg:text-left">
            {/* Badge */}
            <motion.div 
              variants={heroBadgeVariant}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center space-x-2 border border-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold bg-slate-50/50 backdrop-blur-sm mb-6 shadow-sm"
            >
              <div className="bg-[#33CC33] rounded-full p-1 shrink-0">
                <ShieldCheck size={12} className="text-white" />
              </div>
              <span>Biomedical equipment support for healthcare providers in Nepal</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={heroHeadlineVariant}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6 flex flex-col items-center lg:items-start"
            >
              <span className="text-brand-navy">Advanced Technology.</span>
              <span className="text-brand-navy mt-1">Reliable Care.</span>
              <span className="mt-1 flex items-center justify-center lg:justify-start">
                <span className="text-[#0066FF]">Better</span>
                <span className="ml-3 text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] to-[#33CC33]">O</span>
                <span className="text-[#33CC33]">utcomes.</span>
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p 
              variants={heroSubtextVariant}
              initial="hidden"
              animate="visible"
              className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-lg mb-8 mx-auto lg:mx-0 font-medium"
            >
              Neomeditech provides innovative, high-quality medical devices designed to improve patient care and healthcare professionals&apos; experience across Nepal.
            </motion.p>

            {/* Buttons */}
            <motion.div 
              variants={heroButtonsVariant}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="/shop" className="bg-[#0066FF] hover:bg-[#0052cc] text-white px-8 py-3.5 rounded-lg font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center w-full transition-colors">
                  Explore Products
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </motion.div>

            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, type: "spring", stiffness: 100 }}
            className="w-full lg:w-[65%] flex justify-center lg:justify-end relative mt-12 lg:mt-0 z-0 lg:-ml-24 xl:-ml-32 pointer-events-none"
          >
            <motion.div
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-[500px] lg:max-w-[750px] xl:max-w-[850px] aspect-[4/3] z-20 mx-auto lg:mx-0"
            >
              <Image
                src="/hero-equipment.png"
                alt="Premium Medical Equipment Monitor"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 750px, 850px"
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* New Hero Bottom Trust Strip */}
      <div className="container mx-auto px-4 max-w-7xl relative z-30 -mt-12 lg:-mt-24 mb-12 sm:mb-16">
        <div className="bg-white rounded-2xl shadow-lg py-6 px-6 sm:px-8 flex flex-row flex-wrap lg:flex-nowrap items-center justify-between gap-y-6 gap-x-4 border border-gray-200">
          <div className="flex items-center space-x-3 w-full sm:w-[45%] lg:w-auto">
            <div className="text-teal-500 shrink-0"><FlaskConical size={26} strokeWidth={2} /></div>
            <div><h4 className="font-bold text-slate-800 text-[13px] leading-tight">Innovative<br/>Medical Solutions</h4></div>
          </div>
          <div className="hidden lg:block w-px h-10 bg-slate-200"></div>
          
          <div className="flex items-center space-x-3 w-full sm:w-[45%] lg:w-auto">
            <div className="text-blue-500 shrink-0"><ShieldCheck size={26} strokeWidth={2} /></div>
            <div><h4 className="font-bold text-slate-800 text-[13px] leading-tight">High Quality<br/>& Reliable</h4></div>
          </div>
          <div className="hidden lg:block w-px h-10 bg-slate-200"></div>
          
          <div className="flex items-center space-x-3 w-full sm:w-[45%] lg:w-auto">
            <div className="text-blue-500 shrink-0"><Users size={26} strokeWidth={2} /></div>
            <div><h4 className="font-bold text-slate-800 text-[13px] leading-tight">Trusted by<br/>Healthcare Professionals</h4></div>
          </div>
          <div className="hidden lg:block w-px h-10 bg-slate-200"></div>
          
          <div className="flex items-center space-x-3 w-full sm:w-[45%] lg:w-auto">
            <div className="text-green-500 shrink-0"><Globe size={26} strokeWidth={2} /></div>
            <div><h4 className="font-bold text-slate-800 text-[13px] leading-tight">Nationwide Reach<br/>& Local Support</h4></div>
          </div>
          <div className="hidden lg:block w-px h-10 bg-slate-200"></div>
          
          <div className="flex items-center space-x-3 w-full sm:w-[45%] lg:w-auto">
            <div className="text-teal-500 shrink-0"><Heart size={26} strokeWidth={2} /></div>
            <div><h4 className="font-bold text-slate-800 text-[13px] leading-tight">Better Care<br/>for Every Patient</h4></div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-10 md:py-12 bg-[#F5F7FA] border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUpVariant}
            className="flex justify-between items-end mb-6 md:mb-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-brand-navy mb-4">Featured Equipment</h2>
              <p className="text-slate-600 max-w-2xl">Discover our top-rated medical devices trusted by healthcare professionals across the country.</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button 
                className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-brand-navy hover:text-brand-blue hover:border-brand-blue transition-colors shadow-sm"
                onClick={() => emblaApi?.scrollPrev()}
              >
                <ArrowRight size={20} className="transform rotate-180" />
              </button>
              <button 
                className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-brand-navy hover:text-brand-blue hover:border-brand-blue transition-colors shadow-sm"
                onClick={() => emblaApi?.scrollNext()}
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUpVariant}
            className="overflow-hidden -mx-4 px-4" 
            ref={emblaRef}
          >
            <div className="flex">
              {products.slice(0, 6).map((product) => {
                const productSlug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
                return (
                  <div key={product.id} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] pl-4 pr-4 py-4">
                    <Link href={`/products/${productSlug}`} className="block h-full">
                      <motion.div
                        whileHover={{ scale: 1.03, transition: { duration: 0.2, ease: "easeOut" } }}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200 flex flex-col group cursor-pointer hover:border-brand-green/50 h-full"
                      >
                        <div className="bg-brand-gray aspect-square flex items-center justify-center relative overflow-hidden p-6 border-b border-slate-100">
                          <motion.div
                            className="w-full h-full flex items-center justify-center relative"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                          >
                            {product.image ? (
                              <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-contain z-10" />
                            ) : <Package aria-hidden="true" size={40} className="text-slate-300" />}
                          </motion.div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="text-xs font-bold text-brand-green mb-2 uppercase tracking-wider">{product.category}</div>
                          <h3 className="font-bold text-brand-navy mb-2 text-lg line-clamp-2">{product.name}</h3>
                        </div>
                      </motion.div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </motion.div>
          
          <div className="mt-10 text-center flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/shop" className="inline-flex items-center justify-center bg-white border-2 border-brand-blue text-brand-blue hover:bg-slate-50 px-8 py-3.5 rounded-xl font-bold transition-colors w-full md:w-auto">
              View All Products
              <ArrowRight size={18} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Service Showcase */}
      <section className="pt-2 pb-10 md:pt-4 md:pb-12 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUpVariant}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-brand-navy mb-4">Repair, Calibration & Installation Services</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Our certified technicians keep your equipment running safely and accurately — from initial installation to ongoing maintenance.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariant} className="bg-white rounded-3xl border border-gray-200 flex flex-col overflow-hidden">
              <div className="relative w-full aspect-video">
                <Image src="/services/calibration.jpg" alt="Calibration" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-8 flex-grow">
                <h3 className="text-xl font-bold text-brand-navy">Calibration</h3>
                <p className="mt-3 text-slate-600 leading-relaxed">Precision testing to ensure accurate, reliable readings.</p>
              </div>
            </motion.div>
            
            {/* Card 2 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariant} className="bg-white rounded-3xl border border-gray-200 flex flex-col overflow-hidden">
              <div className="relative w-full aspect-video">
                <Image src="/services/repair.jpg" alt="Repair" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-8 flex-grow">
                <h3 className="text-xl font-bold text-brand-navy">Repair</h3>
                <p className="mt-3 text-slate-600 leading-relaxed">Expert diagnosis and repair to minimize equipment downtime.</p>
              </div>
            </motion.div>
            
            {/* Card 3 */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUpVariant} className="bg-white rounded-3xl border border-gray-200 flex flex-col overflow-hidden">
              <div className="relative w-full aspect-video">
                <Image src="/services/installation.jpg" alt="Installation" fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-8 flex-grow">
                <h3 className="text-xl font-bold text-brand-navy">Installation</h3>
                <p className="mt-3 text-slate-600 leading-relaxed">Professional setup and integration at your facility.</p>
              </div>
            </motion.div>
          </div>
          
          {/* Action Button */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUpVariant}
            className="mt-12 text-center"
          >
            <Link href="/contact" className="inline-block bg-brand-blue hover:bg-brand-navy text-white px-8 py-4 rounded-xl font-bold transition-colors shadow-sm text-lg">
              Book a Service
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA / Newsletter */}
            <section className="py-12 md:py-16 bg-[#1A2B3C] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue rounded-full opacity-20 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-green rounded-full opacity-20 blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUpVariant}
              className="text-left"
            >
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">Need Medical Equipment for Your Clinic?</h2>
              <p className="text-slate-300 text-lg mb-10 max-w-2xl">
                Get in touch with our experts today for customized solutions, bulk orders, and specialized biomedical equipment.
              </p>
              <div className="flex flex-col sm:flex-row justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Link href="/contact" className="bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold transition-opacity shadow-md text-lg block w-full text-center">
                    Request a Quote
                  </Link>
                </motion.div>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Link href={`https://wa.me/${SITE.whatsapp}`} target="_blank" className="bg-transparent hover:bg-white/10 text-white border-2 border-white/30 px-8 py-3.5 rounded-xl font-bold transition-colors shadow-sm text-lg flex items-center justify-center w-full">
                    Message on WhatsApp
                  </Link>
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUpVariant}
              className="relative hidden lg:block h-[400px] w-full rounded-3xl overflow-hidden shadow-2xl"
            >
              <Image src="/hero-equipment.webp" alt="Medical Equipment" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}













