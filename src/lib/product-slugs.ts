import { PRODUCT_SEED } from "../data/products.ts";
import { SITE } from "../config/site.ts";
import type { Product } from "./store-types.ts";

/**
 * Deterministically generates a URL-safe, lowercase, hyphenated slug from a product name.
 * Strips special characters, collapses consecutive dashes, trims leading/trailing dashes,
 * and handles missing/empty values gracefully.
 */
export function slugifyProduct(name: string): string {
  if (!name || typeof name !== "string") return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Looks up a product from the verified static seed catalog by slug.
 * Case-insensitive and handles slug trimming.
 */
export function getSeedProductBySlug(slug: string): Product | null {
  if (!slug || typeof slug !== "string") return null;
  const normalizedSlug = slug.toLowerCase().trim();

  const match = PRODUCT_SEED.find((p) => p.slug === normalizedSlug && p.isActive !== false);
  if (!match) return null;

  return {
    id: String(match.id),
    name: match.name,
    slug: match.slug,
    category: match.category,
    image: match.image,
    stock: match.stock,
    price: match.price,
    description: match.description,
    isActive: match.isActive,
  };
}

/**
 * Builds factual, standardized SEO title for product pages:
 * Pattern: "{Product Name} in Nepal | Neomeditech"
 */
export function buildProductTitle(productName: string): string {
  const cleanName = productName ? productName.trim() : "Medical Equipment";
  return `${cleanName} in Nepal | Neomeditech`;
}

/**
 * Constructs a factual, non-hyperbolic meta description strictly from verified data.
 * Does not invent prices, ratings, certifications, or delivery promises.
 */
export function buildProductDescription(product: { name: string; description?: string }): string {
  const genericDefault = "Contact Neomeditech for verified specifications, availability, and a quotation.";
  if (product.description && product.description.trim() && product.description.trim() !== genericDefault) {
    return `${product.description.trim()} Sourced and supported by Neomeditech Biomedical Solutions in Nepal.`;
  }
  return `Inquire about ${product.name}, availability and verified specifications from Neomeditech Biomedical Solutions in Nepal.`;
}

/**
 * Returns the canonical URL for an individual product using the verified root domain.
 */
export function buildProductCanonical(slug?: string, siteUrl: string = SITE.url): string {
  const cleanSlug = slug ? slug.trim() : "";
  const normalizedBase = (siteUrl || "https://neomeditech.com.np").replace(/\/+$/, "");
  return `${normalizedBase}/products/${cleanSlug}`;
}

/**
 * Builds Schema.org compliant structured data for an individual product detail page.
 * Uses Schema.org ItemPage and BreadcrumbList.
 * Strictly avoids emitting incomplete Product rich results (no fake offers, prices, or ratings)
 * to maintain 0 Search Console errors.
 */
export function buildProductDetailJsonLd(
  product: { name: string; slug?: string; category?: string; description?: string; image?: string },
  siteUrl: string = SITE.url,
) {
  const normalizedBase = (siteUrl || "https://neomeditech.com.np").replace(/\/+$/, "");
  const canonicalUrl = buildProductCanonical(product.slug, normalizedBase);

  return {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    name: buildProductTitle(product.name),
    url: canonicalUrl,
    description: buildProductDescription(product),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: normalizedBase,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Products",
          item: `${normalizedBase}/shop`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: product.name,
          item: canonicalUrl,
        },
      ],
    },
  };
}

/**
 * Formats a verified WhatsApp inquiry URL with pre-filled message mentioning the product name.
 */
export function buildWhatsAppInquiryUrl(productName: string, whatsappNumber: string = SITE.whatsapp): string {
  const message = `Hello, I would like to inquire about the product: ${productName}`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
