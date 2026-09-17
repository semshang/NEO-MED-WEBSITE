"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Package, Search, Filter } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useAdmin } from "@/components/admin/AdminProvider";
import { CATEGORIES } from "@/data/products";
import ProductAction from "@/components/ProductAction";
import { SITE } from "@/config/site";
import { generateCatalogueJsonLd, serializeJsonLd } from "@/lib/catalogue-structured-data";

export default function Shop() {
  const { products } = useAdmin();
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const catalogueJsonLd = generateCatalogueJsonLd(products, SITE.url);

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All Products" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const productVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen pt-12 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(catalogueJsonLd) }}
      />
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Page Header */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-brand-navy mb-4">Medical Equipment Catalogue in Nepal</h1>
          <p className="text-slate-600 max-w-2x2 text-lg">Browse our comprehensive range of high-quality medical and hospital equipment.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 sticky top-24">
              <div className="flex justify-between items-center mb-6 lg:hidden" onClick={() => setShowMobileFilters(!showMobileFilters)}>
                <h2 className="font-bold text-lg text-brand-navy">Filters</h2>
                <Filter size={20} className="text-slate-500" />
              </div>

              <div className={`space-y-6 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={"Search products..."}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 shadow-sm rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/50 focus:border-brand-blue"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search size={18} className="absolute left-3 top-3.5 text-slate-400" />
                </div>

                {/* {"Categories"} */}
                <div>
                  <h3 className="font-bold text-brand-navy mb-4 text-sm uppercase tracking-wider">{"Categories"}</h3>
                  
                  <div className="mb-2">
                    <button
                      onClick={() => setActiveCategory(CATEGORIES[0])}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${activeCategory === CATEGORIES[0]
                        ? "bg-gradient-to-r from-brand-blue to-brand-green text-white font-bold shadow-md"
                        : "text-slate-600 hover:bg-brand-gray hover:text-brand-blue"
                        }`}
                    >
                      {CATEGORIES[0]}
                    </button>
                  </div>

                  <ul className="space-y-2 max-h-[50vh] lg:max-h-[60vh] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {CATEGORIES.slice(1).map((category) => (
                      <li key={category}>
                        <button
                          onClick={() => setActiveCategory(category)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${activeCategory === category
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
            <h2 className="sr-only">Medical Equipment List</h2>
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-12 text-center">
                <p className="text-slate-500 text-lg">No products found matching your criteria.</p>
                <button
                  onClick={() => { setActiveCategory("All Products"); setSearchQuery(""); }}
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
                {filteredProducts.map((product) => {
                  const productSlug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
                  return (
                    <motion.div
                      key={product.id}
                      variants={productVariants}
                      whileHover={{ scale: 1.03, transition: { duration: 0.2, ease: "easeOut" } }}
                      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-200 flex flex-col group hover:border-brand-green/50"
                    >
                      <Link href={`/products/${productSlug}`} className="bg-brand-gray aspect-square flex items-center justify-center relative overflow-hidden p-6 border-b border-slate-100 block">
                        <motion.div
                          className="w-full h-full flex items-center justify-center relative"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={400}
                              height={400}
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              className="w-full h-full object-contain z-10"
                            />
                          ) : (
                            <Package aria-hidden="true" size={40} className="text-slate-300" />
                          )}
                        </motion.div>
                      </Link>
                      <div className="p-6 flex flex-col flex-grow">
                        <div className="text-xs font-bold text-brand-green mb-2 uppercase tracking-wider">
                          {product.category}
                        </div>
                        <Link href={`/products/${productSlug}`} className="hover:text-brand-blue transition-colors">
                          <h3 className="font-bold text-brand-navy mb-1 text-lg leading-tight line-clamp-2 hover:text-brand-blue transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="mt-auto pt-3 space-y-2">
                          <Link
                            href={`/products/${productSlug}`}
                            className="w-full py-2 px-3 text-center text-xs font-semibold text-brand-blue hover:text-brand-navy border border-brand-blue/30 hover:border-brand-blue rounded-xl block transition-colors"
                          >
                            View Details
                          </Link>
                          <ProductAction product={product} />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}








