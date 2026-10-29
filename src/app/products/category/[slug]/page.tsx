import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Package, Headphones, MessageCircle } from "lucide-react";
import { SITE } from "@/config/site";
import { getActiveCategoriesWithProducts, getProductsByCategory } from "@/lib/catalog";
import {
  buildCategoryCanonical,
  buildCategoryH1,
  buildCategoryTitle,
  getCategoryBySlug,
  slugifyCategory,
} from "@/lib/product-slugs";
import { serializeJsonLd } from "@/lib/catalogue-structured-data";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const activeCategories = await getActiveCategoriesWithProducts();
    return activeCategories.map((category) => ({
      slug: slugifyCategory(category),
    }));
  } catch (error) {
    console.error(
      "[generateStaticParams] Database unavailable during category static generation. " +
      "Returning empty static params; categories will be generated on-demand via dynamicParams=true.",
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: false },
    };
  }

  const products = await getProductsByCategory(category);
  if (products.length === 0) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = buildCategoryTitle(category);
  const description = `Explore ${category.toLowerCase()} available in Nepal from Neomeditech Biomedical Solutions. Contact us for specifications, availability, and quotation.`;
  const canonicalUrl = buildCategoryCanonical(slug, SITE.url);

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category);
  if (products.length === 0) {
    notFound();
  }

  const canonicalUrl = buildCategoryCanonical(slug, SITE.url);
  const pageH1 = buildCategoryH1(category);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: buildCategoryTitle(category),
        url: canonicalUrl,
        description: `${category} available from Neomeditech Biomedical Solutions in Nepal.`,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: products.length,
          itemListElement: products.map((product, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: product.name,
            url: `${SITE.url}/products/${product.slug}`,
          })),
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE.url,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Products",
            item: `${SITE.url}/shop`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: category,
            item: canonicalUrl,
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen pt-8 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb Navigation */}
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
              {category}
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
            All Medical Equipment Categories
          </Link>
        </div>

        {/* Category Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm mb-10">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue mb-3">
            Medical Equipment Category
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-navy mb-4 tracking-tight">
            {pageH1}
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-3xl leading-relaxed mb-6">
            Browse {category.toLowerCase()} supplied and supported by Neomeditech Biomedical Solutions across hospitals, clinics, and healthcare centers in Nepal.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
            <span className="font-semibold text-brand-navy">
              {products.length} {products.length === 1 ? "Product" : "Products"} Catalogued
            </span>
            <span className="text-slate-300">•</span>
            <span>Neomeditech Biomedical Solutions</span>
            <span className="text-slate-300">•</span>
            <span>Nepal Equipment Inquiries</span>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const productSlug = product.slug || slugifyCategory(product.name);
            const cardImageAlt = product.imageAlt || `${product.name} supplied in Nepal by Neomeditech`;

            return (
              <article
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col group"
              >
                <Link
                  href={`/products/${productSlug}`}
                  className="block relative aspect-square bg-slate-50 border-b border-slate-100 overflow-hidden"
                >
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={cardImageAlt}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <Package size={40} className="mb-2 stroke-1" />
                      <span className="text-xs">Medical Equipment</span>
                    </div>
                  )}
                </Link>

                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-green mb-2">
                    {product.category}
                  </span>

                  <h2 className="text-base font-bold text-brand-navy mb-2 line-clamp-2 hover:text-brand-blue transition-colors">
                    <Link href={`/products/${productSlug}`}>
                      {product.name}
                    </Link>
                  </h2>

                  <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-1">
                    {product.shortDescription || product.description}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <Link
                      href={`/products/${productSlug}`}
                      className="text-xs font-bold text-brand-blue hover:text-brand-navy transition-colors inline-flex items-center"
                    >
                      View {product.name}
                      <ChevronRight size={14} className="ml-1" />
                    </Link>

                    <a
                      href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hello, I would like to inquire about the product: ${product.name}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#128C7E] hover:text-[#0b5c53] inline-flex items-center gap-1"
                      aria-label={`Inquire about ${product.name} on WhatsApp`}
                    >
                      <MessageCircle size={14} />
                      Inquire
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Category Inquiries CTA */}
        <div className="mt-16 bg-gradient-to-r from-brand-navy to-slate-900 rounded-3xl p-8 sm:p-12 text-white">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Need assistance with {category} in Nepal?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
              Our team can discuss equipment specifications, availability, and quotation requests for healthcare facilities.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Hello, I would like to consult about ${category} equipment for our healthcare facility in Nepal.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold px-6 py-3.5 rounded-xl transition-colors text-sm inline-flex items-center gap-2 shadow-sm"
              >
                <MessageCircle size={18} />
                WhatsApp Consultation
              </a>
              <Link
                href="/contact"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm inline-flex items-center gap-2"
              >
                <Headphones size={18} />
                Official Quotation Request
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
