import type { MetadataRoute } from "next";
import { SITE } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/en/admin/", "/ne/admin/", "/en/account/", "/ne/account/", "/en/checkout/", "/ne/checkout/"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
