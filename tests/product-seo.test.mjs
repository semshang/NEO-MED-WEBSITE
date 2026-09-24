import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import {
  slugifyProduct,
  getSeedProductBySlug,
  buildProductTitle,
  buildProductH1,
  buildProductDescription,
  buildProductCanonical,
  buildProductStructuredData,
  buildProductBreadcrumbJsonLd,
  buildProductDetailJsonLd,
  buildWhatsAppInquiryUrl,
  slugifyCategory,
  getCategoryBySlug,
  buildCategoryCanonical,
  buildCategoryTitle,
  buildCategoryH1,
} from "../src/lib/product-slugs.ts";
import { CATEGORIES, PRODUCT_SEED } from "../src/data/products.ts";
import { SITE } from "../src/config/site.ts";
import { generateCatalogueJsonLd } from "../src/lib/catalogue-structured-data.ts";
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

test("7. Structured data emits Product + BreadcrumbList in @graph and strictly avoids fake offers/ratings", () => {
  const product = {
    name: "Patient Monitors",
    slug: "patient-monitors",
    category: "Emergency & Critical Care Equipment",
    image: "https://xv73wvcdm0jqtc2k.public.blob.vercel-storage.com/sample.jpg",
  };

  const jsonLd = buildProductDetailJsonLd(product, SITE.url);

  assert.equal(jsonLd["@context"], "https://schema.org");
  assert.ok(Array.isArray(jsonLd["@graph"]));

  const productNode = jsonLd["@graph"].find((item) => item["@type"] === "Product");
  assert.ok(productNode, "Should contain Product node");
  assert.equal(productNode.name, "Patient Monitors");
  assert.equal(productNode.url, "https://neomeditech.com.np/products/patient-monitors");
  assert.deepEqual(productNode.image, ["https://xv73wvcdm0jqtc2k.public.blob.vercel-storage.com/sample.jpg"]);

  const breadcrumbNode = jsonLd["@graph"].find((item) => item["@type"] === "BreadcrumbList");
  assert.ok(breadcrumbNode, "Should contain BreadcrumbList node");
  assert.equal(breadcrumbNode.itemListElement.length, 4);
  assert.equal(breadcrumbNode.itemListElement[0].name, "Home");
  assert.equal(breadcrumbNode.itemListElement[1].name, "Products");
  assert.equal(breadcrumbNode.itemListElement[2].name, "Emergency & Critical Care Equipment");
  assert.equal(breadcrumbNode.itemListElement[3].name, "Patient Monitors");

  // Critical Google Search Console error prevention: Zero fake offers, zero fake ratings or reviews
  const serialized = JSON.stringify(jsonLd);
  assert.equal(serialized.includes('"offers"'), false);
  assert.equal(serialized.includes('"price"'), false);
  assert.equal(serialized.includes('"aggregateRating"'), false);
  assert.equal(serialized.includes('"review"'), false);
  assert.equal(serialized.includes("www.neomeditech.com.np"), false);

  // Even if internal price is present in database record, zero Offer markup is emitted
  // because customer-facing pages are quotation-based without visible retail prices.
  const pricedProduct = {
    ...product,
    price: 150000,
  };
  const pricedJsonLd = buildProductDetailJsonLd(pricedProduct, SITE.url);
  const pricedProductNode = pricedJsonLd["@graph"].find((item) => item["@type"] === "Product");
  assert.equal(pricedProductNode.offers, undefined);
  assert.equal(JSON.stringify(pricedJsonLd).includes('"offers"'), false);
  assert.equal(JSON.stringify(pricedJsonLd).includes('"price"'), false);
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
  assert.ok(itemSource.includes("hasOnlyKeys(body, ALLOWED_PRODUCT_KEYS)"));
  assert.ok(itemSource.includes("ALLOWED_PRODUCT_KEYS"));
  assert.equal(itemSource.includes('"slug"'), false, "slug must not be an allowed mutation key in PATCH");
  // PATCH & DELETE trigger invalidation
  assert.ok(itemSource.includes("revalidatePath(`/products/${product.slug}`)"));
  assert.ok(itemSource.includes('revalidatePath("/shop")'));
  assert.ok(itemSource.includes('revalidatePath("/sitemap.xml")'));
  assert.ok(itemSource.includes('revalidatePath("/")'));
});

test("14. Category SEO slugs, canonicals, titles, and H1 generation work for all 23 valid categories", () => {
  const validCategories = CATEGORIES.filter((c) => c !== "All Products");
  assert.equal(validCategories.length, 23, "Expected 23 valid product categories");

  const slugs = new Set();
  for (const cat of validCategories) {
    const slug = slugifyCategory(cat);
    assert.ok(slug.length > 0, `Empty slug for category: ${cat}`);
    assert.equal(/^[a-z0-9-]+$/.test(slug), true, `Invalid slug format: ${slug}`);
    assert.equal(slugs.has(slug), false, `Duplicate category slug found: ${slug}`);
    slugs.add(slug);

    // Round-trip lookup
    const resolved = getCategoryBySlug(slug);
    assert.equal(resolved, cat, `Failed to resolve category from slug: ${slug}`);

    // Canonical URL
    const canonical = buildCategoryCanonical(slug, SITE.url);
    assert.equal(canonical, `https://neomeditech.com.np/products/category/${slug}`);

    // Title and H1
    const title = buildCategoryTitle(cat);
    const h1 = buildCategoryH1(cat);
    assert.ok(title.endsWith("| Neomeditech"));
    assert.ok(title.includes("Nepal"));
    assert.ok(h1.includes("Nepal"));
    // Ensure no duplicate "Nepal in Nepal"
    assert.equal(/nepal.*nepal/i.test(title), false);
    assert.equal(/nepal.*nepal/i.test(h1), false);
  }

  // Non-existent slug returns null
  assert.equal(getCategoryBySlug("non-existent-category-123"), null);
  assert.equal(getCategoryBySlug(""), null);
});

test("15. Product title and H1 prevent awkward duplicate 'in Nepal' and keep accessories natural", () => {
  // Normal equipment name without Nepal
  assert.equal(buildProductTitle("BiPAP Machine"), "BiPAP Machine in Nepal | Neomeditech");
  assert.equal(buildProductH1("BiPAP Machine"), "BiPAP Machine in Nepal");

  // Override mapped name
  assert.equal(
    buildProductTitle("BiPAP Machine - Advanced Respiratory Support"),
    "BiPAP Respiratory Machine in Nepal | Neomeditech"
  );

  // Name already containing Nepal
  assert.equal(buildProductTitle("Oxygen Concentrator in Nepal"), "Oxygen Concentrator in Nepal | Neomeditech");
  assert.equal(buildProductH1("Oxygen Concentrator in Nepal"), "Oxygen Concentrator in Nepal");

  // Admin customTitle override
  assert.equal(
    buildProductTitle("Patient Monitors", "Best Patient Monitor Nepal | Neomeditech"),
    "Best Patient Monitor Nepal | Neomeditech"
  );

  // Accessories, spare parts, consumables, cables, sensors retain natural H1 (no 'in Nepal')
  assert.equal(buildProductH1("Door Gasket"), "Door Gasket");
  assert.equal(buildProductH1("Bipap Circuit"), "Bipap Circuit");
  assert.equal(buildProductH1("ECG Cable"), "ECG Cable");
  assert.equal(buildProductH1("NIBP Cuff"), "NIBP Cuff");
  assert.equal(buildProductH1("Thermal Paper"), "Thermal Paper");
  assert.equal(buildProductH1("Oxygen Sensor"), "Oxygen Sensor");
  assert.equal(buildProductH1({ name: "Ventilator Circuit", category: "ICU Equipment" }), "Ventilator Circuit");
  assert.equal(buildProductH1({ name: "Patient Monitors", category: "Emergency & Critical Care Equipment" }), "Patient Monitors in Nepal");
});

test("16. Product meta description prioritizes admin seoDescription > shortDescription > factual fallback", () => {
  const base = { name: "ECG Machine" };

  // Factual fallback
  const fallback = buildProductDescription(base);
  assert.ok(fallback.includes("Inquire about ECG Machine"));

  // shortDescription override
  const withShort = buildProductDescription({ ...base, shortDescription: "12-lead portable hospital ECG." });
  assert.ok(withShort.startsWith("12-lead portable hospital ECG."));

  // seoDescription top priority
  const withSeo = buildProductDescription({
    ...base,
    shortDescription: "Short text",
    seoDescription: "Custom SEO description written for search engines.",
  });
  assert.equal(withSeo, "Custom SEO description written for search engines.");
});

test("17. Inactive products (isActive: false or active: false) are excluded across all public surfaces", () => {
  const catalogPath = path.join(process.cwd(), "src/lib/catalog.ts");
  const catalogSource = fs.readFileSync(catalogPath, "utf-8");

  // Verify all MongoDB queries explicitly filter out both isActive: false and active: false
  assert.ok(
    catalogSource.includes("isActive: { $ne: false }, active: { $ne: false }"),
    "catalog.ts must query isActive: { $ne: false }, active: { $ne: false } to exclude inactive products",
  );

  // Seed lookup returns null for non-existent or inactive products
  assert.equal(getSeedProductBySlug("non-existent-device"), null);

  // Shop page source must filter out inactive products
  const shopPath = path.join(process.cwd(), "src/app/shop/page.tsx");
  const shopSource = fs.readFileSync(shopPath, "utf-8");
  assert.ok(shopSource.includes("product.isActive === false"));

  // All active seed products must not have inactive flags
  for (const product of PRODUCT_SEED) {
    assert.notEqual(product.isActive, false);
    assert.notEqual(product.active, false);
  }
});

test("18. Public product page and category page sources do not contain unverified 'Verified Equipment' claim", () => {
  const prodPagePath = path.join(process.cwd(), "src/app/products/[slug]/page.tsx");
  const prodPageSource = fs.readFileSync(prodPagePath, "utf-8");
  assert.equal(prodPageSource.includes("Verified Equipment"), false, "Must not contain 'Verified Equipment'");
  assert.equal(prodPageSource.includes("Verified Medical Equipment"), false, "Must not contain 'Verified Medical Equipment'");
  assert.ok(prodPageSource.includes("Medical Equipment"));
  assert.ok(prodPageSource.includes("Biomedical Sourcing"));

  const catPagePath = path.join(process.cwd(), "src/app/products/category/[slug]/page.tsx");
  const catPageSource = fs.readFileSync(catPagePath, "utf-8");
  assert.equal(catPageSource.includes("verified equipment"), false, "Must not contain 'verified equipment'");
});

test("19. Strict prevention of automatic production database seeding", () => {
  const catalogPath = path.join(process.cwd(), "src/lib/catalog.ts");
  const catalogSource = fs.readFileSync(catalogPath, "utf-8");

  // ensureCatalogSeeded strictly exits if in production and ALLOW_CATALOG_SEED !== 'true'
  assert.ok(
    catalogSource.includes('process.env.NODE_ENV === "production" && process.env.ALLOW_CATALOG_SEED !== "true"'),
    "ensureCatalogSeeded must guard against production auto-seeding",
  );

  // Read paths do not invoke ensureCatalogSeeded in production
  assert.ok(
    catalogSource.includes('if (process.env.NODE_ENV !== "production" || process.env.ALLOW_CATALOG_SEED === "true") {\n    await ensureCatalogSeeded();\n  }'),
    "Read paths must guard ensureCatalogSeeded call with non-production or explicit opt-in check",
  );

  // Products API route must also guard against auto-seeding in production
  const apiRoutePath = path.join(process.cwd(), "src/app/api/products/route.ts");
  const apiRouteSource = fs.readFileSync(apiRoutePath, "utf-8");
  assert.ok(
    apiRouteSource.includes('if (process.env.NODE_ENV !== "production" || process.env.ALLOW_CATALOG_SEED === "true") {\n    await ensureCatalogSeeded();\n  }'),
    "GET /api/products must not auto-seed in production",
  );
});

test("20. Public-facing code does not contain unverified 'authentic' marketing claims", () => {
  const publicFiles = [
    "src/app/products/[slug]/page.tsx",
    "src/app/products/category/[slug]/page.tsx",
    "src/app/shop/page.tsx",
    "src/app/about/page.tsx",
    "src/lib/product-slugs.ts",
    "src/lib/catalog.ts",
  ];

  for (const relativePath of publicFiles) {
    const fullPath = path.join(process.cwd(), relativePath);
    const content = fs.readFileSync(fullPath, "utf-8").toLowerCase();
    assert.equal(
      content.includes("authentic biomedical equipment"),
      false,
      `${relativePath} must not contain 'authentic biomedical equipment'`,
    );
    assert.equal(
      content.includes("authentic equipment"),
      false,
      `${relativePath} must not contain 'authentic equipment'`,
    );
  }
});

test("21. Empty database behavior across sitemap, shop, structured data, and category routes", () => {
  // 1. Catalogue JSON-LD with empty products produces valid CollectionPage and ItemList with 0 items
  const emptyLd = generateCatalogueJsonLd([]);
  assert.equal(emptyLd["@type"], "CollectionPage");
  assert.equal(emptyLd.mainEntity["@type"], "ItemList");
  assert.equal(emptyLd.mainEntity.numberOfItems, 0);
  assert.deepEqual(emptyLd.mainEntity.itemListElement, []);

  // 2. AdminProvider initializes INITIAL_PRODUCTS to empty array in production
  const adminProviderPath = path.join(process.cwd(), "src/components/admin/AdminProvider.tsx");
  const adminProviderSource = fs.readFileSync(adminProviderPath, "utf-8");
  assert.ok(
    adminProviderSource.includes('process.env.NODE_ENV === "production"\n    ? []\n    : PRODUCT_SEED.map'),
    "AdminProvider must default INITIAL_PRODUCTS to [] in production",
  );

  // 3. Category page source returns notFound() (404) if products array is empty
  const catPagePath = path.join(process.cwd(), "src/app/products/category/[slug]/page.tsx");
  const catPageSource = fs.readFileSync(catPagePath, "utf-8");
  assert.ok(
    catPageSource.includes("if (products.length === 0) {\n    notFound();\n  }"),
    "Category page must return notFound() when 0 products exist",
  );

  // 4. Shop page renders empty state notice
  const shopPath = path.join(process.cwd(), "src/app/shop/page.tsx");
  const shopSource = fs.readFileSync(shopPath, "utf-8");
  assert.ok(
    shopSource.includes("No products found matching your criteria."),
    "Shop page must contain empty state text",
  );
});

test("22. generateStaticParams audits: uses MongoDB catalog source and safely handles database failure without fake seed fallback", () => {
  const prodPagePath = path.join(process.cwd(), "src/app/products/[slug]/page.tsx");
  const prodPageSource = fs.readFileSync(prodPagePath, "utf-8");

  // Dynamic params must remain enabled so post-deployment products render on-demand
  assert.ok(prodPageSource.includes("export const dynamicParams = true;"));
  assert.ok(prodPageSource.includes("await getAllPublicProducts();"));
  assert.ok(prodPageSource.includes("return [];"), "Product generateStaticParams must return [] on DB error, not seed fallback");

  const catPagePath = path.join(process.cwd(), "src/app/products/category/[slug]/page.tsx");
  const catPageSource = fs.readFileSync(catPagePath, "utf-8");

  assert.ok(catPageSource.includes("export const dynamicParams = true;"));
  assert.ok(catPageSource.includes("await getActiveCategoriesWithProducts();"));
  assert.ok(catPageSource.includes("return [];"), "Category generateStaticParams must return [] on DB error, not seed fallback");
});

test("23. Revalidation lifecycle on product create, update, and delete covers all public paths", () => {
  const apiRoutePath = path.join(process.cwd(), "src/app/api/products/route.ts");
  const apiRouteSource = fs.readFileSync(apiRoutePath, "utf-8");
  assert.ok(apiRouteSource.includes("revalidatePath(`/products/${product.slug}`)"));
  assert.ok(apiRouteSource.includes("revalidatePath(`/products/category/${slugifyCategory(product.category)}`)"));
  assert.ok(apiRouteSource.includes('revalidatePath("/sitemap.xml")'));
  assert.ok(apiRouteSource.includes('revalidatePath("/shop")'));

  const idRoutePath = path.join(process.cwd(), "src/app/api/products/[id]/route.ts");
  const idRouteSource = fs.readFileSync(idRoutePath, "utf-8");
  // PATCH revalidation
  assert.ok(idRouteSource.includes("revalidatePath(`/products/${product.slug}`)"));
  assert.ok(idRouteSource.includes("revalidatePath(`/products/category/${slugifyCategory(product.category)}`)"));
  assert.ok(idRouteSource.includes("revalidatePath(`/products/category/${slugifyCategory(existingProduct.category)}`)"));
  // DELETE revalidation
  assert.ok(idRouteSource.includes('revalidatePath("/sitemap.xml")'));
});


