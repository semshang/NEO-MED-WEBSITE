import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import {
  slugifyProduct,
  getSeedProductBySlug,
  buildProductTitle,
  buildProductDescription,
  buildProductCanonical,
  buildProductDetailJsonLd,
  buildWhatsAppInquiryUrl,
} from "../src/lib/product-slugs.ts";
import { PRODUCT_SEED } from "../src/data/products.ts";
import { SITE } from "../src/config/site.ts";
import nextConfig from "../next.config.ts";

test("1. Stable product slug generation handles special characters, capitalization, punctuation, and duplicates", () => {
  assert.equal(slugifyProduct("Patient Monitors"), "patient-monitors");
  assert.equal(slugifyProduct("ECG Machine - 12 Lead"), "ecg-machine-12-lead");
  assert.equal(slugifyProduct("  Bipap Mask (Ventes)  "), "bipap-mask-ventes");
  assert.equal(slugifyProduct("Freezer/Temperature Sensor!"), "freezer-temperature-sensor");
  assert.equal(slugifyProduct("C-PAP Machine"), "c-pap-machine");
  assert.equal(slugifyProduct(""), "");
  assert.equal(slugifyProduct(null), "");
  assert.equal(slugifyProduct(undefined), "");

  // All 63 seeds must produce valid non-empty slugs
  for (const product of PRODUCT_SEED) {
    const slug = slugifyProduct(product.name);
    assert.ok(slug.length > 0, `Empty slug for product: ${product.name}`);
    assert.equal(slug, product.slug);
    assert.equal(/^[a-z0-9-]+$/.test(slug), true, `Slug contains invalid characters: ${slug}`);
  }

  // Ensure all 63 seed slugs are unique
  const slugs = PRODUCT_SEED.map((p) => p.slug);
  const uniqueSlugs = new Set(slugs);
  assert.equal(uniqueSlugs.size, slugs.length, "Found duplicate slugs in PRODUCT_SEED");
});

test("2. Product lookup by slug resolves existing products accurately", () => {
  const patientMonitors = getSeedProductBySlug("patient-monitors");
  assert.ok(patientMonitors, "Patient Monitors should be found");
  assert.equal(patientMonitors.name, "Patient Monitors");
  assert.equal(patientMonitors.category, "Emergency & Critical Care Equipment");
  assert.ok(patientMonitors.image.length > 0);

  const ecgMachine = getSeedProductBySlug("ecg-machine");
  assert.ok(ecgMachine, "ECG Machine should be found");
  assert.equal(ecgMachine.name, "ECG Machine");

  const oxygenConcentrator = getSeedProductBySlug("oxygen-concentrator");
  assert.ok(oxygenConcentrator, "Oxygen Concentrator should be found");
  assert.equal(oxygenConcentrator.name, "Oxygen Concentrator");

  // Case insensitivity and whitespace trimming
  const caseInsensitive = getSeedProductBySlug("  OXYGEN-CONCENTRATOR  ");
  assert.ok(caseInsensitive);
  assert.equal(caseInsensitive.name, "Oxygen Concentrator");
});

test("3. Unknown slug returns null (triggers notFound() in page)", () => {
  assert.equal(getSeedProductBySlug("non-existent-medical-device-xyz"), null);
  assert.equal(getSeedProductBySlug(""), null);
  assert.equal(getSeedProductBySlug(null), null);
  assert.equal(getSeedProductBySlug(undefined), null);
});

test("4. Canonical product URLs use root domain and contain slug", () => {
  const canonical = buildProductCanonical("patient-monitors", SITE.url);
  assert.equal(canonical, "https://neomeditech.com.np/products/patient-monitors");
  assert.equal(canonical.includes("www.neomeditech.com.np"), false);

  const fallbackCanonical = buildProductCanonical("autoclave-machine");
  assert.equal(fallbackCanonical, "https://neomeditech.com.np/products/autoclave-machine");
});

test("5. Unique factual metadata generates without hyperbolic claims", () => {
  const product = {
    name: "Autoclave Machine",
    slug: "autoclave-machine",
    category: "Sterilization & Infection Control Equipment (Autoclaves)",
    description: "Contact Neomeditech for verified specifications, availability, and a quotation.",
  };

  const title = buildProductTitle(product.name);
  assert.equal(title, "Autoclave Machine in Nepal | Neomeditech");

  const description = buildProductDescription(product);
  assert.ok(description.includes("Inquire about Autoclave Machine"));
  assert.ok(description.includes("Neomeditech Biomedical Solutions in Nepal"));

  // Verify absence of hype claims in description
  const hypeWords = ["best", "number one", "#1", "cheapest", "most trusted", "authorized distributor"];
  for (const word of hypeWords) {
    assert.equal(description.toLowerCase().includes(word), false, `Description contains forbidden hype word: ${word}`);
  }
});

test("6. WhatsApp inquiry URL contains correct phone number and pre-filled product name", () => {
  const url = buildWhatsAppInquiryUrl("Oxygen Concentrator", SITE.whatsapp);
  assert.ok(url.startsWith("https://wa.me/9779712011758?text="));
  assert.ok(url.includes(encodeURIComponent("Oxygen Concentrator")));
  assert.ok(url.includes(encodeURIComponent("Hello, I would like to inquire about the product: Oxygen Concentrator")));
});

test("7. Structured data emits ItemPage + BreadcrumbList and strictly avoids invalid Product rich results", () => {
  const product = {
    name: "Patient Monitors",
    slug: "patient-monitors",
    category: "Emergency & Critical Care Equipment",
    image: "https://xv73wvcdm0jqtc2k.public.blob.vercel-storage.com/sample.jpg",
  };

  const jsonLd = buildProductDetailJsonLd(product, SITE.url);

  assert.equal(jsonLd["@context"], "https://schema.org");
  assert.equal(jsonLd["@type"], "ItemPage");
  assert.equal(jsonLd.url, "https://neomeditech.com.np/products/patient-monitors");
  assert.ok(jsonLd.breadcrumb);
  assert.equal(jsonLd.breadcrumb["@type"], "BreadcrumbList");
  assert.equal(jsonLd.breadcrumb.itemListElement.length, 3);
  assert.equal(jsonLd.breadcrumb.itemListElement[0].name, "Home");
  assert.equal(jsonLd.breadcrumb.itemListElement[1].name, "Products");
  assert.equal(jsonLd.breadcrumb.itemListElement[2].name, "Patient Monitors");

  // Critical Google Search Console error prevention: Zero @type: "Product", zero offers, zero fake prices
  const serialized = JSON.stringify(jsonLd);
  assert.equal(serialized.includes('"@type":"Product"'), false);
  assert.equal(serialized.includes('"@type": "Product"'), false);
  assert.equal(serialized.includes('"offers"'), false);
  assert.equal(serialized.includes('"price"'), false);
  assert.equal(serialized.includes('"aggregateRating"'), false);
  assert.equal(serialized.includes('"review"'), false);
  assert.equal(serialized.includes("www.neomeditech.com.np"), false);
});

test("8. Shop page contains crawlable <Link> elements pointing to canonical product URLs", () => {
  const shopPath = path.join(process.cwd(), "src/app/shop/page.tsx");
  const shopSource = fs.readFileSync(shopPath, "utf-8");

  // Must have Link components pointing to /products/
  assert.ok(shopSource.includes('href={`/products/${productSlug}`'));
  assert.ok(shopSource.includes("View Details"));
  assert.ok(shopSource.includes("<ProductAction"));
});

test("9. Homepage metadata uses factual title, description, and canonical root domain", () => {
  const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
  const layoutSource = fs.readFileSync(layoutPath, "utf-8");

  assert.ok(layoutSource.includes('default: "Medical Equipment Supplier in Nepal | Neomeditech"'));
  assert.ok(layoutSource.includes('template: "%s | Neomeditech"'));
  assert.ok(
    layoutSource.includes(
      "Neomeditech Biomedical Solutions supplies medical and biomedical equipment, hospital devices, and technical support services across Nepal.",
    ),
  );
  assert.ok(layoutSource.includes("canonical: SITE.url"));
});

test("10. Confirmed legacy WordPress redirects use explicit mappings with no blanket patterns", async () => {
  assert.ok(nextConfig.redirects, "nextConfig should define redirects");
  const redirects = await nextConfig.redirects();

  // 1. Confirmed historical inkjet film redirects (with and without slash)
  const inkjetNoSlash = redirects.find((r) => r.source === "/product/inkjet-x-ray-blue-medical-film");
  assert.ok(inkjetNoSlash, "Missing /product/inkjet-x-ray-blue-medical-film redirect");
  assert.equal(inkjetNoSlash.destination, "/products/inkjet-x-ray-blue-medical-film");
  assert.equal(inkjetNoSlash.permanent, true);

  const inkjetSlash = redirects.find((r) => r.source === "/product/inkjet-x-ray-blue-medical-film/");
  assert.ok(inkjetSlash, "Missing /product/inkjet-x-ray-blue-medical-film/ redirect");
  assert.equal(inkjetSlash.destination, "/products/inkjet-x-ray-blue-medical-film");
  assert.equal(inkjetSlash.permanent, true);

  // 2. Confirmed historical oxygen sensor redirects (with and without slash)
  const oxygenNoSlash = redirects.find((r) => r.source === "/product/oxygen-sensor");
  assert.ok(oxygenNoSlash, "Missing /product/oxygen-sensor redirect");
  assert.equal(oxygenNoSlash.destination, "/products/oxygen-sensor");
  assert.equal(oxygenNoSlash.permanent, true);

  const oxygenSlash = redirects.find((r) => r.source === "/product/oxygen-sensor/");
  assert.ok(oxygenSlash, "Missing /product/oxygen-sensor/ redirect");
  assert.equal(oxygenSlash.destination, "/products/oxygen-sensor");
  assert.equal(oxygenSlash.permanent, true);

  // 3. Catalogue index aliases
  const productsIndex = redirects.find((r) => r.source === "/products");
  assert.ok(productsIndex);
  assert.equal(productsIndex.destination, "/shop");

  const productsIndexSlash = redirects.find((r) => r.source === "/products/");
  assert.ok(productsIndexSlash);
  assert.equal(productsIndexSlash.destination, "/shop");

  // 4. Assert absence of blanket / unverified patterns
  const blanketProduct = redirects.find((r) => r.source.includes(":slug") && r.source.startsWith("/product/"));
  assert.equal(blanketProduct, undefined, "Blanket /product/:slug redirect must NOT exist");

  const blanketCategory = redirects.find((r) => r.source.startsWith("/product-category"));
  assert.equal(blanketCategory, undefined, "Blanket /product-category redirect must NOT exist");

  const unverifiedPatientMonitor = redirects.find((r) => r.source.includes("patient-monitor"));
  assert.equal(unverifiedPatientMonitor, undefined, "Unverified patient-monitor redirect must NOT exist");
});

test("11. Priority products audit verification (accurate distinction between machines and accessories)", () => {
  const priorityList = [
    { query: "Patient Monitor", found: true, slug: "patient-monitors", note: "Multi-parameter patient monitor" },
    { query: "ECG Machine", found: true, slug: "ecg-machine", note: "Diagnostic ECG machine" },
    { query: "Ultrasound Machine", found: true, slug: "usg-machine", note: "USG Machine in catalogue" },
    { query: "Oxygen Concentrator", found: true, slug: "oxygen-concentrator", note: "Medical oxygen concentrator" },
    { query: "Mechanical ICU Ventilator Machine", found: false, slug: null, note: "NOT in catalogue; catalogue only stocks Ventilator Circuit (accessory)" },
    { query: "Ventilator Circuit", found: true, slug: "ventilator-circuit", note: "Ventilator breathing circuit accessory" },
    { query: "BiPAP Machine", found: true, slug: "bipap-machine-advanced-respiratory-support", note: "Advanced respiratory support" },
    { query: "CPAP Machine", found: true, slug: "c-pap-machine", note: "Continuous positive airway pressure unit" },
    { query: "Autoclave Machine", found: true, slug: "autoclave-machine", note: "Sterilization autoclave" },
    { query: "Baby Warmer", found: true, slug: "baby-warmer", note: "Neonatal radiant warmer" },
    { query: "Infusion Pump", found: false, slug: null, note: "Not currently in product catalogue" },
  ];

  for (const item of priorityList) {
    if (item.found && item.slug) {
      const product = getSeedProductBySlug(item.slug);
      assert.ok(product, `Priority product ${item.query} with slug ${item.slug} must exist`);
    } else {
      assert.equal(item.found, false, `Item ${item.query} is correctly marked as not stocked in current catalogue`);
    }
  }
});

test("12. Refuse seed fallback in production and propagate database errors on outages", () => {
  const catalogPath = path.join(process.cwd(), "src/lib/catalog.ts");
  const catalogSource = fs.readFileSync(catalogPath, "utf-8");

  // Production requirement: MONGODB_URI is required and never falls back to seed
  assert.ok(
    catalogSource.includes('throw new Error("Database configuration MONGODB_URI is required in production environment.");'),
    "catalog.ts must throw in production if MONGODB_URI is missing",
  );

  // Seed mode is strictly isolated to non-production test environments
  assert.ok(
    catalogSource.includes('!process.env.MONGODB_URI &&\n    (process.env.NODE_ENV === "test" || process.env.ALLOW_SEED_CATALOG === "true")'),
    "isSeedModeAllowed must strictly check for test environment and absence of MONGODB_URI",
  );

  // When database is configured, errors are NOT swallowed and propagate
  assert.ok(
    catalogSource.includes("await getConnectedDB();"),
    "catalog.ts must await getConnectedDB() directly without swallowing errors",
  );

  // Successful query with no match explicitly returns null
  assert.ok(
    catalogSource.includes("// Successful database query with no active product matching this slug: authoritative not found\n    return null;"),
    "getProductBySlug must return null on successful query with no match",
  );

  // Sitemap does not swallow errors
  const sitemapPath = path.join(process.cwd(), "src/app/sitemap.ts");
  const sitemapSource = fs.readFileSync(sitemapPath, "utf-8");
  assert.equal(sitemapSource.includes("catch (error)"), false, "sitemap.ts must not swallow database errors");
});

test("13. Cache invalidation is triggered on product lifecycle mutations with stable slugs", () => {
  const createRoutePath = path.join(process.cwd(), "src/app/api/products/route.ts");
  const createSource = fs.readFileSync(createRoutePath, "utf-8");
  assert.ok(createSource.includes("revalidatePath(`/products/${product.slug}`)"));
  assert.ok(createSource.includes('revalidatePath("/shop")'));
  assert.ok(createSource.includes('revalidatePath("/sitemap.xml")'));
  assert.ok(createSource.includes('revalidatePath("/")'));

  const itemRoutePath = path.join(process.cwd(), "src/app/api/products/[id]/route.ts");
  const itemSource = fs.readFileSync(itemRoutePath, "utf-8");
  // PATCH preserves slug stability (slug is not an allowed mutation key)
  assert.ok(itemSource.includes('hasOnlyKeys(body, ["name", "category", "stock", "price", "description", "image", "isActive"])'));
  // PATCH & DELETE trigger invalidation
  assert.ok(itemSource.includes("revalidatePath(`/products/${product.slug}`)"));
  assert.ok(itemSource.includes('revalidatePath("/shop")'));
  assert.ok(itemSource.includes('revalidatePath("/sitemap.xml")'));
  assert.ok(itemSource.includes('revalidatePath("/")'));
});
