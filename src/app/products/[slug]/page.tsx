import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Package, ShieldCheck, Truck, Headphones } from "lucide-react";
import { SITE } from "@/config/site";
import { getAllPublicProducts, getProductBySlug } from "@/lib/catalog";
import {
  buildProductCanonical,
  buildProductDescription,
  buildProductDetailJsonLd,
  buildProductTitle,
  buildWhatsAppInquiryUrl,
} from "@/lib/product-slugs";
import { serializeJsonLd } from "@/lib/catalogue-structured-data";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getAllPublicProducts();
  return products.map((p) => ({
    slug: p.slug,
  }));
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

  const title = buildProductTitle(product.name);
  const description = buildProductDescription(product);
  const canonicalUrl = buildProductCanonical(product.slug || slug, SITE.url);

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: canonicalUrl,
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
                alt: `${product.name} - Neomeditech Nepal`,
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

  const jsonLd = buildProductDetailJsonLd(product, SITE.url);
  const whatsappUrl = buildWhatsAppInquiryUrl(product.name, SITE.whatsapp);

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
            <li>
              <ChevronRight size={14} className="text-slate-400" />
            </li>
            <li className="text-brand-navy font-medium truncate max-w-xs md:max-w-md" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/shop"
            className="inline-flex items-center text-sm font-semibold text-brand-blue hover:text-brand-navy transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to All Products
          </Link>
        </div>

        {/* Main Product Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-10">
            {/* Product Image Section */}
            <div className="bg-[#F8FAFC] rounded-2xl aspect-square flex items-center justify-center relative p-8 border border-slate-100">
              {product.image ? (
                <div className="w-full h-full relative">
                  <Image
                    src={product.image}
                    alt={`${product.name} supplied by Neomeditech in Nepal`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <Package size={64} className="mb-3 stroke-1" />
                  <span className="text-sm">Verified Medical Equipment</span>
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green mb-3">
                  {product.category}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy mb-4 leading-tight">
                  {product.name}
                </h1>

                <div className="prose prose-slate max-w-none text-slate-600 mb-8 leading-relaxed">
                  <p className="text-base sm:text-lg">{product.description}</p>
                </div>

                {/* Sourcing & Support Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-y border-slate-100 mb-8">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck size={22} className="text-brand-green shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-brand-navy">Biomedical Support</p>
                      <p className="text-xs text-slate-500">Installation & repair</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Truck size={22} className="text-brand-blue shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-brand-navy">Nationwide Delivery</p>
                      <p className="text-xs text-slate-500">All 77 Nepal districts</p>
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
                <h2 className="text-xl font-bold text-brand-navy">Request a quotation</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Share your required model or configuration, quantity and delivery location.
                  Ask our team to confirm specifications, included accessories, availability
                  and warranty terms in your written quotation.
                </p>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center space-x-3 text-white bg-[#25D366] hover:bg-[#128C7E] transition-colors shadow-sm text-base"
                >
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
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
      </div>
    </div>
  );
}
