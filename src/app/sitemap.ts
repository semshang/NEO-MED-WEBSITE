import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

const publicPaths = ["", "/about", "/shop", "/faq", "/contact", "/privacy-policy", "/terms-of-service"];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/shop" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
