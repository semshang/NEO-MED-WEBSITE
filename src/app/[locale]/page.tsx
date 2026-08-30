"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, Clock, MessageSquare, Star, Play, FlaskConical, Users, Globe, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { SITE } from "@/config/site";
import { useTranslations } from "next-intl";
import { useAdmin } from "@/components/admin/AdminProvider";
import ProductAction from '@/components/ProductAction';
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as any } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const heroBadgeVariant = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, delay: 0.1, ease: "easeOut" as any } }
};

const heroHeadlineVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: "easeOut" as any } }
};

const heroSubtextVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.35, ease: "easeOut" as any } }
};

const heroButtonsVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.5, ease: "easeOut" as any } }
};

export default function Home() {
  const tHero = useTranslations("hero");
  const tTrust = useTranslations("trust");
  const tShop = useTranslations("shop");
  const { products } = useAdmin();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 1500, stopOnInteraction: false })]
  );

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex items-center justify-start overflow-hidden pt-4 lg:pt-6 pb-4 lg:pb-8 bg-white">
        {/* Content */}
        <div className="container mx-auto px-4 max-w-7xl relative z-20 py-4 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8 lg:gap-12">
          <div className="w-full lg:w-[45%] xl:w-[40%] max-w-2xl z-10 text-center lg:text-left">
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
              <span>Trusted by 500+ hospitals across Nepal</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={heroHeadlineVariant}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6 flex flex-col items-center lg:items-start"
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
              Neomeditech provides innovative, high-quality medical devices designed to improve patient care and healthcare professionals' experience across Nepal.
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
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="#" className="bg-white hover:bg-slate-50 text-[#0066FF] border-2 border-[#0066FF] px-8 py-3.5 rounded-lg font-bold transition-colors shadow-sm flex items-center justify-center w-full">
                  Watch Our Video
                  <Play size={18} className="ml-2 fill-current" />
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, type: "spring", stiffness: 100 }}
            className="w-full lg:w-[55%] flex justify-center lg:justify-end relative mt-12 lg:mt-0 z-10"
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
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* New Hero Bottom Trust Strip */}
      <div className="container mx-auto px-4 max-w-7xl relative z-30 -mt-12 lg:-mt-24 mb-12 sm:mb-16">
        <div className="bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] py-6 px-6 sm:px-8 flex flex-row flex-wrap lg:flex-nowrap items-center justify-between gap-y-6 gap-x-4 border border-slate-100">
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
      <section className="py-20 bg-brand-gray">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUpVariant}
            className="flex justify-between items-end mb-12"
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
              {products.slice(0, 6).map((product) => (
                <div key={product.id} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] lg:flex-[0_0_25%] pl-4 pr-4 py-4">
                  <motion.div 
                    whileHover={{ scale: 1.03, transition: { duration: 0.2, ease: "easeOut" as any } }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-slate-200 flex flex-col group cursor-pointer hover:border-brand-green/50 h-full"
                  >
                    <div className="bg-brand-gray aspect-square flex items-center justify-center relative overflow-hidden p-6 border-b border-slate-100">
                      <div className="absolute inset-0 bg-brand-navy/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 duration-200">
                        <span className="bg-white text-brand-navy font-bold px-4 py-2 rounded-full shadow-md text-sm border border-slate-100">View Details</span>
                      </div>
                      <motion.div 
                        className="w-full h-full flex items-center justify-center relative"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2, ease: "easeOut" as any }}
                      >
                        {/* Try to render image, fallback to text if missing */}
                        <img 
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain z-10"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <span className="text-slate-400 text-sm relative z-0 hidden absolute inset-0 items-center justify-center text-center px-4">
                          Image: {product.name}
                        </span>
                      </motion.div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="text-xs font-bold text-brand-green mb-2 uppercase tracking-wider">{product.category}</div>
                      <h3 className="font-bold text-brand-navy mb-2 text-lg line-clamp-2">{product.name}</h3>
                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <ProductAction product={product} />
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
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

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUpVariant}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-brand-navy mb-4">What Our Clients Say</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Don&apos;t just take our word for it. Here is what hospitals and clinics have to say about our services.</p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[1, 2, 3].map((item) => (
              <motion.div key={item} variants={fadeUpVariant} className="bg-brand-gray p-8 rounded-3xl border border-slate-200 relative">
                <MessageSquare className="text-slate-300 absolute top-8 right-8" size={40} />
                <div className="flex text-brand-green mb-6">
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                </div>
                <p className="text-slate-700 italic mb-8 relative z-10 leading-relaxed">
                  &quot;The quality of equipment provided by Neomeditech is outstanding. Their prompt service and professional support team make them our preferred vendor.&quot;
                </p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white border border-slate-200 rounded-full flex items-center justify-center text-brand-navy font-bold shadow-sm">
                    DR
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-navy">Dr. Ram Sharma</h4>
                    <p className="text-sm text-slate-500">Kathmandu General Hospital</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-gray border-t border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-blue to-brand-green rounded-full opacity-10 blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-brand-blue to-brand-green rounded-full opacity-10 blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeUpVariant}
          className="container mx-auto px-4 max-w-4xl text-center relative z-10"
        >
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-navy mb-6 leading-tight">{tHero("ctaTitle")}</h2>
          <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto">
            {tHero("ctaSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link href="/contact" className="bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold transition-opacity shadow-md text-lg block w-full text-center">
                {tHero("getQuote")}
              </Link>
            </motion.div>
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link href={`https://wa.me/${SITE.whatsapp}`} target="_blank" className="bg-white hover:bg-slate-50 text-brand-blue border-2 border-brand-blue px-8 py-3.5 rounded-xl font-bold transition-colors shadow-sm text-lg flex items-center justify-center w-full">
                Message on WhatsApp
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
