import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Package,
  ShieldCheck,
  Truck,
  Headphones,
  CheckCircle2,
  HelpCircle,
  Wrench,
  Layers,
  MessageCircle,
} from "lucide-react";
import { SITE } from "@/config/site";
import { getAllPublicProducts, getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import {
  buildProductCanonical,
  buildProductDescription,
  buildProductDetailJsonLd,
  buildProductH1,
  buildProductTitle,
  buildWhatsAppInquiryUrl,
  slugifyCategory,
} from "@/lib/product-slugs";
import { serializeJsonLd } from "@/lib/catalogue-structured-data";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products = await getAllPublicProducts();
    return products.map((p) => ({
      slug: p.slug,
    }));
  } catch (error) {
    console.error(
      "[generateStaticParams] Database unavailable during product static generation. " +
      "Returning empty static params; products will be generated on-demand via dynamicParams=true.",
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = buildProductTitle(product.name, product.seoTitle);
  const description = buildProductDescription(product);
  const canonicalUrl = buildProductCanonical(product.slug || slug, SITE.url);
  const imageAlt = product.imageAlt || `${product.name} - Neomeditech Nepal`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: SITE.name,
      ...(product.image
        ? {
            images: [
              {
                url: product.image,
                width: 800,
                height: 800,
                alt: imageAlt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(product.image ? { images: [product.image] } : {}),
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const categorySlug = slugifyCategory(product.category);
  const relatedProducts = await getRelatedProducts(product.category, product.slug || slug, 4);

  const jsonLd = buildProductDetailJsonLd(product, SITE.url);
  if (product.faq && product.faq.length > 0) {
    jsonLd["@graph"].push({
      "@type": "FAQPage",
      mainEntity: product.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  const whatsappUrl = buildWhatsAppInquiryUrl(product.name, SITE.whatsapp);
  const imageAlt = product.imageAlt || `${product.name} supplied by Neomeditech in Nepal`;
  const visibleH1 = buildProductH1(product);

  // Check if any support/warranty/delivery data exists
  const hasSupportInfo = Boolean(
    (product.warranty && product.warranty.trim()) ||
    (product.installationSupport && product.installationSupport.trim()) ||
    (product.deliveryInformation && product.deliveryInformation.trim())
  );

  return (
    <div className="bg-[#F5F7FA] min-h-screen pt-6 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumbs Navigation */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-slate-500 flex-wrap">
            <li>
              <Link href="/" className="hover:text-brand-blue transition-colors">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight size={14} className="text-slate-400" />
            </li>
            <li>
              <Link href="/shop" className="hover:text-brand-blue transition-colors">
                Products
              </Link>
            </li>
            {categorySlug ? (
              <>
                <li>
                  <ChevronRight size={14} className="text-slate-400" />
                </li>
                <li>
                  <Link
                    href={`/products/category/${categorySlug}`}
                    className="hover:text-brand-blue transition-colors truncate max-w-[200px]"
                  >
                    {product.category}
                  </Link>
                </li>
              </>
            ) : null}
            <li>
              <ChevronRight size={14} className="text-slate-400" />
            </li>
            <li className="text-brand-navy font-medium truncate max-w-xs md:max-w-md" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Back Link */}
        <div className="mb-6 flex items-center gap-4">
          {categorySlug ? (
            <Link
              href={`/products/category/${categorySlug}`}
              className="inline-flex items-center text-sm font-semibold text-brand-blue hover:text-brand-navy transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to {product.category}
            </Link>
          ) : (
            <Link
              href="/shop"
              className="inline-flex items-center text-sm font-semibold text-brand-blue hover:text-brand-navy transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to All Products
            </Link>
          )}
        </div>

        {/* Main Product Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-10">
            {/* Product Image Section */}
            <div className="bg-[#F8FAFC] rounded-2xl aspect-square flex items-center justify-center relative p-8 border border-slate-100">
              {product.image ? (
                <div className="w-full h-full relative">
                  <Image
                    src={product.image}
                    alt={imageAlt}
                    width={600}
                    height={600}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <Package size={64} className="mb-3 stroke-1" />
                  <span className="text-sm">Medical Equipment</span>
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {categorySlug ? (
                    <Link
                      href={`/products/category/${categorySlug}`}
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green hover:bg-brand-green/20 transition-colors"
                    >
                      {product.category}
                    </Link>
                  ) : (
                    <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green">
                      {product.category}
                    </div>
                  )}

                  {product.brand ? (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      Brand: {product.brand}
                    </span>
                  ) : null}

                  {product.model ? (
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-brand-blue">
                      Model: {product.model}
                    </span>
                  ) : null}
                </div>

                {/* Primary single H1 on the page */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy mb-4 leading-tight tracking-tight">
                  {visibleH1}
                </h1>

                <div className="prose prose-slate max-w-none text-slate-600 mb-8 leading-relaxed">
                  <p className="text-base sm:text-lg">
                    {product.shortDescription || product.description}
                  </p>
                </div>

                {/* Sourcing & Support Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-slate-100 mb-8">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck size={22} className="text-brand-green shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-brand-navy">Medical Equipment</p>
                      <p className="text-xs text-slate-500">Biomedical Sourcing</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Truck size={22} className="text-brand-blue shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-brand-navy">Nepal Delivery</p>
                      <p className="text-xs text-slate-500">Available on Order</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Headphones size={22} className="text-brand-green shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-brand-navy">Direct Quotation</p>
                      <p className="text-xs text-slate-500">Inquire via WhatsApp</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <h2 className="text-xl font-bold text-brand-navy">Request a quotation for {product.name}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Share your required model or configuration, quantity and delivery location in Nepal.
                  Our biomedical engineering team will confirm specifications, included accessories, availability,
                  and official quotation.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center space-x-3 text-white bg-[#25D366] hover:bg-[#128C7E] transition-colors shadow-sm text-base"
                >
                  <MessageCircle size={22} />
                  <span>Inquire on WhatsApp</span>
                </a>

                <Link
                  href="/contact"
                  className="w-full py-3.5 px-6 rounded-2xl font-semibold flex items-center justify-center text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors text-sm"
                >
                  Request Official Quotation Form
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description Section (Only when data exists) */}
        {product.detailedDescription && product.detailedDescription.trim() ? (
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm mb-10">
            <h2 className="text-2xl font-bold text-brand-navy mb-4">
              Product Overview & Specifications
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 text-base leading-relaxed whitespace-pre-line">
              {product.detailedDescription}
            </div>
          </section>
        ) : null}

        {/* Key Features Section (Only when data exists) */}
        {product.features && product.features.length > 0 ? (
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm mb-10">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle2 size={24} className="text-brand-green" />
              <h2 className="text-2xl font-bold text-brand-navy">Key Features</h2>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-slate-700 text-sm sm:text-base leading-relaxed">
                  <span className="h-2 w-2 rounded-full bg-brand-green shrink-0 mt-2" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* Technical Specifications Table (Only when data exists) */}
        {product.specifications && product.specifications.length > 0 ? (
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Wrench size={24} className="text-brand-blue" />
              <h2 className="text-2xl font-bold text-brand-navy">Technical Specifications</h2>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                    <th className="px-6 py-4 w-1/3">Specification</th>
                    <th className="px-6 py-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {product.specifications.map((spec, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="px-6 py-3.5 font-semibold text-brand-navy align-top">{spec.label}</td>
                      <td className="px-6 py-3.5 text-slate-600 align-top">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {/* Applications / Clinical Use Cases (Only when data exists) */}
        {product.applications && product.applications.length > 0 ? (
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm mb-10">
            <div className="flex items-center gap-3 mb-6">
              <Layers size={24} className="text-brand-blue" />
              <h2 className="text-2xl font-bold text-brand-navy">Clinical Applications & Departments</h2>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.applications.map((app, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium border border-slate-200"
                >
                  {app}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {/* Warranty, Installation & Delivery Information (Only when data exists) */}
        {hasSupportInfo ? (
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm mb-10">
            <h2 className="text-2xl font-bold text-brand-navy mb-6">
              Warranty, Installation & Delivery in Nepal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {product.warranty && product.warranty.trim() ? (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-brand-green font-bold text-sm">
                    <ShieldCheck size={18} />
                    <span>Warranty & Guarantee</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{product.warranty}</p>
                </div>
              ) : null}

              {product.installationSupport && product.installationSupport.trim() ? (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-brand-blue font-bold text-sm">
                    <Wrench size={18} />
                    <span>Biomedical Support</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{product.installationSupport}</p>
                </div>
              ) : null}

              {product.deliveryInformation && product.deliveryInformation.trim() ? (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2 text-brand-navy font-bold text-sm">
                    <Truck size={18} />
                    <span>Nepal Delivery Coverage</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{product.deliveryInformation}</p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* Product FAQs Section (Only when data exists) */}
        {product.faq && product.faq.length > 0 ? (
          <section className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm mb-10">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle size={24} className="text-brand-blue" />
              <h2 className="text-2xl font-bold text-brand-navy">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {product.faq.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <h3 className="font-bold text-brand-navy text-base mb-2">{item.question}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Related Products Section (Phase 9) */}
        {relatedProducts.length > 0 ? (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-brand-navy">Related Medical Equipment</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Explore complementary biomedical equipment in Nepal.
                </p>
              </div>
              {categorySlug ? (
                <Link
                  href={`/products/category/${categorySlug}`}
                  className="text-sm font-semibold text-brand-blue hover:text-brand-navy transition-colors hidden sm:inline-flex items-center"
                >
                  View all in {product.category}
                  <ChevronRight size={16} className="ml-1" />
                </Link>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relProduct) => {
                const relSlug = relProduct.slug || slugifyCategory(relProduct.name);
                const relImageAlt = relProduct.imageAlt || `${relProduct.name} supplied in Nepal by Neomeditech`;

                return (
                  <article
                    key={relProduct.id}
                    className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group"
                  >
                    <Link
                      href={`/products/${relSlug}`}
                      className="block relative aspect-square bg-slate-50 border-b border-slate-100 overflow-hidden"
                    >
                      {relProduct.image ? (
                        <Image
                          src={relProduct.image}
                          alt={relImageAlt}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <Package size={36} className="mb-2 stroke-1" />
                          <span className="text-xs">Medical Equipment</span>
                        </div>
                      )}
                    </Link>

                    <div className="p-4 flex flex-col flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-green mb-1">
                        {relProduct.category}
                      </span>

                      <h3 className="text-sm font-bold text-brand-navy mb-2 line-clamp-2 hover:text-brand-blue transition-colors">
                        <Link href={`/products/${relSlug}`}>
                          {relProduct.name}
                        </Link>
                      </h3>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <Link
                          href={`/products/${relSlug}`}
                          className="text-xs font-bold text-brand-blue hover:text-brand-navy transition-colors inline-flex items-center"
                        >
                          View {relProduct.name}
                          <ChevronRight size={12} className="ml-1" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
