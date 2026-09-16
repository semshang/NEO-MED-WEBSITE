import type { Metadata } from "next";
import { SITE } from "../config/site.ts";

/** Keep search and sharing metadata aligned with each page's own canonical URL. */
export function createPageMetadata(title: string, description: string, pathname: string): Metadata {
  const fullTitle = title + " | " + SITE.shortName;
  const canonical = new URL(pathname, SITE.url).href;
  const image = new URL("/hero-equipment.webp", SITE.url).href;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "en_US",
      title: fullTitle,
      description,
      url: canonical,
      images: [{ url: image, width: 1024, height: 768, alt: "Neomeditech medical equipment supplier Nepal" }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
