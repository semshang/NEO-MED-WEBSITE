"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { SITE } from "@/config/site";
import { CATEGORIES, PRODUCTS } from "@/data/products";

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory = activeCategory === "All Products" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-brand-gray min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-brand-navy mb-4">Our Products</h1>
          <p className="text-slate-600 max-w-2xl text-lg">Browse our comprehensive range of high-quality medical and hospital equipment.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 sticky top-24">
              <div className="flex justify-between items-center mb-6 lg:hidden" onClick={() => setShowMobileFilters(!showMobileFilters)}>
                <h2 className="font-bold text-lg text-brand-navy">Filters</h2>
                <Filter size={20} className="text-slate-500" />
              </div>
              
              <div className={`space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-3 bg-brand-gray border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-bold text-brand-navy mb-4 text-sm uppercase tracking-wider">Categories</h3>
                  <ul className="space-y-2">
                    {CATEGORIES.map((category) => (
                      <li key={category}>
                        <button
                          onClick={() => setActiveCategory(category)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                            activeCategory === category
                              ? "bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold shadow-md"
                              : "text-slate-600 hover:bg-brand-gray hover:text-brand-blue"
                          }`}
                        >
                          {category}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="lg:w-3/4">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
                <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
                <button 
                  onClick={() => {setActiveCategory("All Products"); setSearchQuery("");}}
                  className="mt-4 text-brand-blue font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                  hidden: {}
                }}
              >
                {filteredProducts.map((product) => (
                  <motion.div 
                    key={product.id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
                    }}
                    whileHover={{ scale: 1.03, transition: { duration: 0.2, ease: "easeOut" } }}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-slate-200 flex flex-col group cursor-pointer hover:border-brand-green/50"
                  >
                    <div className="bg-brand-gray aspect-square flex items-center justify-center relative overflow-hidden p-6 border-b border-slate-100">
                      <motion.div 
                        className="w-full h-full flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <span className="text-slate-400 text-sm relative z-0">Image: {product.name}</span>
                      </motion.div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="text-xs font-bold text-brand-green mb-2 uppercase tracking-wider">{product.category}</div>
                      <h3 className="font-bold text-brand-navy mb-4 text-lg leading-tight">{product.name}</h3>
                      
                      <div className="mt-auto pt-4 border-t border-slate-100">
                        <motion.div whileTap={{ scale: 0.97 }}>
                          <Link 
                            href={`https://wa.me/${SITE.whatsapp}?text=Hi, I would like to inquire about the ${encodeURIComponent(product.name)}`} 
                            target="_blank"
                            className="w-full bg-gradient-to-r from-brand-blue to-brand-green hover:opacity-90 text-white py-3 rounded-xl font-bold transition-opacity flex items-center justify-center space-x-2 shadow-sm"
                          >
                            <MessageCircle size={18} />
                            <span>Inquire on WhatsApp</span>
                          </Link>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
