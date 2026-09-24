import { CATEGORIES, PRODUCT_SEED } from "../data/products.ts";
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
 * Deterministically generates a URL-safe category slug.
 */
export function slugifyCategory(category: string): string {
  if (!category || category === "All Products") return "";
  return category
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Resolves a category name from a URL slug against the verified category list.
 */
export function getCategoryBySlug(slug: string): string | null {
  if (!slug || typeof slug !== "string") return null;
  const normalized = slug.toLowerCase().trim();
  const found = CATEGORIES.find(
    (c) => c !== "All Products" && slugifyCategory(c) === normalized
  );
  return found || null;
}

/**
 * Returns canonical URL for a category page.
 */
export function buildCategoryCanonical(categorySlug: string, siteUrl: string = SITE.url): string {
  const cleanSlug = categorySlug ? categorySlug.trim() : "";
  const normalizedBase = (siteUrl || "https://neomeditech.com.np").replace(/\/+$/, "");
  return `${normalizedBase}/products/category/${cleanSlug}`;
}

/**
 * Builds factual title for a category page:
 * Pattern: "{Category} in Nepal | Neomeditech"
 */
export function buildCategoryTitle(categoryName: string): string {
  const trimmed = categoryName ? categoryName.trim() : "Medical Equipment";
  if (/\bnepal\b/i.test(trimmed)) {
    return `${trimmed} | Neomeditech`;
  }
  return `${trimmed} in Nepal | Neomeditech`;
}

/**
 * Builds H1 heading for a category page:
 * Pattern: "{Category} in Nepal"
 */
export function buildCategoryH1(categoryName: string): string {
  const trimmed = categoryName ? categoryName.trim() : "Medical Equipment";
  if (/\bnepal\b/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed} in Nepal`;
}

/**
 * Looks up a product from the verified static seed catalog by slug.
 * Case-insensitive and handles slug trimming.
 */
export function getSeedProductBySlug(slug: string): Product | null {
  if (!slug || typeof slug !== "string") return null;
  const normalizedSlug = slug.toLowerCase().trim();

  const match = PRODUCT_SEED.find(
    (p) => p.slug === normalizedSlug && p.isActive !== false && (p as { active?: boolean }).active !== false
  );
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

const PRODUCT_TITLE_OVERRIDES: Record<string, string> = {
  "OT Bed": "OT Bed (Operation Theatre Bed)",
  "Professional Dual-Frequency Ultrasonic Therapy Unit": "Ultrasonic Therapy Machine",
  "BiPAP Machine - Advanced Respiratory Support": "BiPAP Respiratory Machine",
  "Heating Coil of Autoclave/Boiler/Water Bath": "Autoclave & Boiler Heating Coil",
  "USG Paper (Ultrasound thermal paper)": "USG Ultrasound Thermal Paper",
};

/**
 * Builds factual, standardized SEO title for product pages:
 * Pattern: "{Product Name} in Nepal | Neomeditech"
 * Prevents duplicate "in Nepal" if the name already contains Nepal.
 * Respects customTitle if provided by admin.
 */
export function buildProductTitle(productName: string, customTitle?: string): string {
  if (customTitle && customTitle.trim()) {
    return customTitle.trim();
  }
  const trimmed = productName ? productName.trim() : "";
  const cleanName = trimmed ? (PRODUCT_TITLE_OVERRIDES[trimmed] || trimmed) : "Medical Equipment";
  if (/\bnepal\b/i.test(cleanName)) {
    return `${cleanName} | Neomeditech`;
  }
  return `${cleanName} in Nepal | Neomeditech`;
}

const ACCESSORY_KEYWORDS_REGEX =
  /\b(cable|circuit|mask|sensor|tube|cuff|electrode|paper|gasket|coil|forceps|probe|filter|strap|adaptor|adapter|valve|battery|pad|clamp|cart|lead|cannula|tubing|bulb|lamp|film|roll|mouthpiece|belt)\b/i;

const ACCESSORY_CATEGORIES_REGEX =
  /\b(accessories|accessory|consumables|consumable|parts|spares|paper|film)\b/i;

/**
 * Checks whether a product represents an accessory, consumable, or spare part
 * based on product title keywords and/or category name.
 */
export function isAccessoryOrPart(
  productInput: { name: string; category?: string } | string,
  categoryOverride?: string
): boolean {
  const name = typeof productInput === "string" ? productInput : productInput.name;
  const category = (typeof productInput === "object" ? productInput.category : undefined) || categoryOverride || "";

  if (category && ACCESSORY_CATEGORIES_REGEX.test(category)) {
    return true;
  }
  if (name && ACCESSORY_KEYWORDS_REGEX.test(name)) {
    return true;
  }
  return false;
}

/**
 * Builds clear, single H1 heading for product pages.
 * - Accessories, spare parts, and consumables retain their clean, natural name (e.g. "ECG Cable", "Bipap Circuit")
 * - Major capital equipment categories (machines, monitors, warmers, autoclaves) retain localized H1 (e.g. "Patient Monitors in Nepal")
 * - Prevents duplicate "in Nepal" if the name already contains Nepal.
 */
export function buildProductH1(
  productInput: { name: string; category?: string } | string,
  categoryOverride?: string
): string {
  const name = typeof productInput === "string" ? productInput : productInput.name;
  const trimmed = name ? name.trim() : "";
  if (!trimmed) return "Medical Equipment in Nepal";

  if (/\bnepal\b/i.test(trimmed)) {
    return trimmed;
  }

  if (isAccessoryOrPart(productInput, categoryOverride)) {
    return trimmed;
  }

  return `${trimmed} in Nepal`;
}

/**
 * Constructs a factual, non-hyperbolic meta description strictly from verified data.
 * Prioritizes admin seoDescription > admin shortDescription > verified description > factual fallback.
 * Does not invent prices, ratings, certifications, or delivery promises.
 */
export function buildProductDescription(product: {
  name: string;
  description?: string;
  seoDescription?: string;
  shortDescription?: string;
}): string {
  if (product.seoDescription && product.seoDescription.trim()) {
    return product.seoDescription.trim();
  }
  if (product.shortDescription && product.shortDescription.trim()) {
    return `${product.shortDescription.trim()} Sourced and supported by Neomeditech Biomedical Solutions in Nepal.`;
  }
  const genericDefault1 = "Contact Neomeditech for verified specifications, availability, and a quotation.";
  const genericDefault2 = "Contact Neomeditech for specifications, availability, and a quotation.";
  const isGeneric =
    !product.description ||
    !product.description.trim() ||
    product.description.trim() === genericDefault1 ||
    product.description.trim() === genericDefault2;

  if (!isGeneric && product.description) {
    return `${product.description.trim()} Sourced and supported by Neomeditech Biomedical Solutions in Nepal.`;
  }
  return `Inquire about ${product.name}, availability and specifications from Neomeditech Biomedical Solutions in Nepal.`;
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
 * Builds Schema.org Product structured data strictly from actual database fields.
 * Strictly eliminates Schema.org Offer markup because this site operates via quotation/inquiry
 * workflows ("Inquire on WhatsApp", "Get Quote") without customer-facing retail prices.
 * Never invents prices, offers, ratings, reviews, or unverified claims.
 */
export function buildProductStructuredData(
  product: {
    name: string;
    slug?: string;
    category?: string;
    description?: string;
    seoDescription?: string;
    shortDescription?: string;
    image?: string;
    brand?: string;
    model?: string;
    price?: number | null;
  },
  siteUrl: string = SITE.url
) {
  const normalizedBase = (siteUrl || "https://neomeditech.com.np").replace(/\/+$/, "");
  const canonicalUrl = buildProductCanonical(product.slug, normalizedBase);
  const description = buildProductDescription(product);

  const schema: Record<string, unknown> = {
    "@type": "Product",
    name: product.name,
    description,
    url: canonicalUrl,
  };

  if (product.image) {
    schema.image = [product.image];
  }
  if (product.brand && product.brand.trim()) {
    schema.brand = {
      "@type": "Brand",
      name: product.brand.trim(),
    };
  }
  if (product.model && product.model.trim()) {
    schema.model = product.model.trim();
  }
  if (product.category && product.category.trim() && product.category !== "All Products") {
    schema.category = product.category.trim();
  }

  // ZERO Offer markup: Neomeditech products require quotation/inquiry.
  // Google requires structured data to match user-visible page content.
  // Do NOT output internal quotation/inventory estimates in Schema.org.

  return schema;
}

/**
 * Builds Schema.org BreadcrumbList for a product detail page:
 * Home -> Products -> Category -> Product
 */
export function buildProductBreadcrumbJsonLd(
  product: { name: string; slug?: string; category?: string },
  siteUrl: string = SITE.url
) {
  const normalizedBase = (siteUrl || "https://neomeditech.com.np").replace(/\/+$/, "");
  const canonicalUrl = buildProductCanonical(product.slug, normalizedBase);

  const itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }> = [
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
  ];

  if (product.category && product.category !== "All Products") {
    const catSlug = slugifyCategory(product.category);
    itemListElement.push({
      "@type": "ListItem",
      position: 3,
      name: product.category,
      item: `${normalizedBase}/products/category/${catSlug}`,
    });
    itemListElement.push({
      "@type": "ListItem",
      position: 4,
      name: product.name,
      item: canonicalUrl,
    });
  } else {
    itemListElement.push({
      "@type": "ListItem",
      position: 3,
      name: product.name,
      item: canonicalUrl,
    });
  }

  return {
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

/**
 * Builds Schema.org compliant structured data for an individual product detail page.
 * Emits @graph containing the Product entity and the 4-tier BreadcrumbList.
 */
export function buildProductDetailJsonLd(
  product: {
    name: string;
    slug?: string;
    category?: string;
    description?: string;
    seoDescription?: string;
    shortDescription?: string;
    image?: string;
    brand?: string;
    model?: string;
    price?: number | null;
  },
  siteUrl: string = SITE.url
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      buildProductStructuredData(product, siteUrl),
      buildProductBreadcrumbJsonLd(product, siteUrl),
    ],
  };
}

/**
 * Formats a verified WhatsApp inquiry URL with pre-filled message mentioning the product name.
 */
export function buildWhatsAppInquiryUrl(productName: string, whatsappNumber: string = SITE.whatsapp): string {
  const message = `Hello, I would like to inquire about the product: ${productName}`;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
