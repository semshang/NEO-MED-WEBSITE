import { SITE } from "../config/site.ts";

export interface CatalogueProduct {
  name: string;
  isActive?: boolean;
  category?: string;
  image?: string;
  description?: string;
  price?: number | null;
}

export interface CatalogueListItem {
  "@type": "ListItem";
  position: number;
  name: string;
}

export interface CatalogueItemList {
  "@type": "ItemList";
  numberOfItems: number;
  itemListElement: CatalogueListItem[];
}

export interface CatalogueJsonLd {
  "@context": "https://schema.org";
  "@type": "CollectionPage";
  name: string;
  url: string;
  description: string;
  mainEntity: CatalogueItemList;
}

/**
 * Validates whether a product meets Google's strict requirements for a standalone Product rich result.
 * Under Google search guidelines, a Product rich result MUST specify either:
 * - 'offers' (with valid price and priceCurrency)
 * - 'review' (genuine user review)
 * - 'aggregateRating'
 *
 * For inquiry-based medical equipment without public pricing or reviews, this returns false
 * to prevent generating invalid Product structured data.
 */
export function canEmitProductRichResult(product: CatalogueProduct): boolean {
  if (typeof product.price === "number" && !Number.isNaN(product.price) && product.price > 0) {
    return true;
  }
  return false;
}

/**
 * Builds compliant Schema.org CollectionPage and ItemList structured data for the Shop catalogue.
 * Strictly avoids emitting incomplete Product rich-result items that trigger Google Search Console errors.
 */
export function generateCatalogueJsonLd(
  products: CatalogueProduct[],
  siteUrl?: string,
): CatalogueJsonLd {
  const normalizedUrl = (siteUrl || SITE.url).replace(/\/+$/, "");
  const activeProducts = products.filter((p) => p.isActive !== false);

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Medical Equipment Products",
    url: `${normalizedUrl}/shop`,
    description:
      "Browse our comprehensive range of high-quality medical and hospital equipment in Nepal.",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: activeProducts.length,
      itemListElement: activeProducts.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: product.name,
      })),
    },
  };
}

/**
 * Safely serializes JSON-LD to prevent XSS / script-tag injection when embedded into HTML.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");
}
