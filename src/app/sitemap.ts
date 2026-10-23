import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { getActiveCategoriesWithProducts, getAllPublicProducts } from "@/lib/catalog";
import { slugifyCategory } from "@/lib/product-slugs";

export const dynamic = "force-dynamic";

interface SitemapRoute {
  path: string;
  priority: number;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
}

const publicRoutes: SitemapRoute[] = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.8, changeFrequency: "weekly" },
  { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = publicRoutes.map((route) => ({
    url: `${SITE.url}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const activeCategories = await getActiveCategoriesWithProducts();
  const categoryEntries: MetadataRoute.Sitemap = activeCategories.map((category) => ({
    url: `${SITE.url}/products/category/${slugifyCategory(category)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const products = await getAllPublicProducts();
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE.url}/products/${product.slug}`,
    lastModified: product.updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
