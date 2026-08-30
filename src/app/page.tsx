"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, Clock, MessageSquare, Star } from "lucide-react";
import { motion } from "framer-motion";
import { SITE } from "@/config/site";
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
  const { products } = useAdmin();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start" },
    [Autoplay({ delay: 1500, stopOnInteraction: false })]
  );

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-start overflow-hidden">
        {/* Background Image with slow zoom */}
        <motion.div 
          className="absolute inset-0 z-0"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, ease: "easeInOut", repeat: Infinity }}
        >
          <Image 
            src="/hero.jpg" 
            alt="Medical Equipment in use" 
            fill 
            className="object-cover object-center" 
            priority 
          />
        </motion.div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/95 via-brand-navy/70 to-transparent z-10"></div>

        {/* Content */}
        <div className="container mx-auto px-4 max-w-7xl relative z-20 pt-24 pb-24 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="w-full md:w-1/2 max-w-2xl z-10">
            {/* Badge */}
            <motion.div 
              variants={heroBadgeVariant}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center space-x-2 border border-brand-green/50 text-white px-5 py-2 rounded-full text-sm font-medium bg-white/10 backdrop-blur-sm mb-8"
            >
              <div className="bg-brand-green rounded-full p-1">
                <ShieldCheck size={14} className="text-white" />
              </div>
              <span>Trusted by 500+ hospitals across Nepal</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              variants={heroHeadlineVariant}
              initial="hidden"
              animate="visible"
              className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6"
            >
              Premium Medical <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green">Equipment</span> You Can Trust
            </motion.h1>

            {/* Subtext */}
            <motion.p 
              variants={heroSubtextVariant}
              initial="hidden"
              animate="visible"
              className="text-lg md:text-xl text-slate-200 leading-relaxed max-w-2xl mb-10"
            >
              We provide state-of-the-art biomedical equipment, reliable repair services, and expert support for hospitals, clinics, and individuals across Nepal.
            </motion.p>

            {/* Buttons */}
            <motion.div 
              variants={heroButtonsVariant}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/shop" className="bg-gradient-to-r from-brand-blue to-brand-green text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center justify-center w-full transition-transform">
                  Explore Products
                  <ArrowRight size={18} className="ml-2" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/contact" className="bg-transparent hover:bg-white text-white hover:text-brand-navy border-2 border-white px-8 py-3.5 rounded-full font-bold transition-colors shadow-sm text-center block w-full">
                  Contact Us
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6, type: "spring", stiffness: 100 }}
            className="w-full md:w-1/2 flex justify-center md:justify-end relative mt-12 md:mt-0 z-10"
          >
            {/* Glow effect behind the image */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-blue to-brand-green blur-3xl opacity-30 rounded-full w-full h-full transform scale-90"></div>
            
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-[500px] aspect-[4/3] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20"
            >
              <Image
                src="/hero-monitor.png"
                alt="Premium Medical Equipment Monitor"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeUpVariant} className="flex items-center space-x-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-colors hover:border-brand-green/50">
              <motion.div 
                initial={{ rotate: -15, scale: 0.8 }}
                whileInView={{ rotate: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut" as any }}
                className="w-14 h-14 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center shrink-0"
              >
                <Clock size={28} />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg text-brand-navy">24/7 Support</h3>
                <p className="text-slate-500 text-sm mt-1">Expert technical assistance anytime you need it.</p>
              </div>
            </motion.div>
            <motion.div variants={fadeUpVariant} className="flex items-center space-x-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-colors hover:border-brand-green/50">
              <motion.div 
                initial={{ rotate: -15, scale: 0.8 }}
                whileInView={{ rotate: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut" as any }}
                className="w-14 h-14 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center shrink-0"
              >
                <ShieldCheck size={28} />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg text-brand-navy">Genuine Equipment</h3>
                <p className="text-slate-500 text-sm mt-1">100% authentic medical products with warranty.</p>
              </div>
            </motion.div>
            <motion.div variants={fadeUpVariant} className="flex items-center space-x-4 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm transition-colors hover:border-brand-green/50">
              <motion.div 
                initial={{ rotate: -15, scale: 0.8 }}
                whileInView={{ rotate: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: "easeOut" as any }}
                className="w-14 h-14 bg-brand-green/10 text-brand-green rounded-xl flex items-center justify-center shrink-0"
              >
                <Truck size={28} />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg text-brand-navy">Nationwide Delivery</h3>
                <p className="text-slate-500 text-sm mt-1">Fast and safe delivery across all parts of Nepal.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

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
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-navy mb-6 leading-tight">Need Medical Equipment for Your Clinic?</h2>
          <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto">
            Get in touch with our experts today for customized solutions, bulk orders, and specialized biomedical equipment.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Link href="/contact" className="bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 text-white px-8 py-4 rounded-xl font-bold transition-opacity shadow-md text-lg block w-full text-center">
                Get a Free Quote
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
