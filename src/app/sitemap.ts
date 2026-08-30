import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";
import { routing } from "@/i18n/routing";

const publicPaths = ["", "/about", "/shop", "/faq", "/contact", "/privacy-policy", "/terms-of-service"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    publicPaths.map((path) => ({
      url: `${SITE.url}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" || path === "/shop" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.7,
    })),
  );
}
