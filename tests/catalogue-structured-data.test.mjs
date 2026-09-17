import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import {
  canEmitProductRichResult,
  generateCatalogueJsonLd,
  serializeJsonLd,
} from "../src/lib/catalogue-structured-data.ts";
import { PRODUCT_SEED } from "../src/data/products.ts";
import { SITE } from "../src/config/site.ts";
import { BUSINESS_INFO, getBusinessStructuredData } from "../src/lib/business-info.ts";

test("1. catalogue structured data uses CollectionPage and ItemList, and does NOT emit Product objects", () => {
  const jsonLd = generateCatalogueJsonLd(PRODUCT_SEED, SITE.url);

  assert.equal(jsonLd["@context"], "https://schema.org");
  assert.equal(jsonLd["@type"], "CollectionPage");
  assert.equal(jsonLd.url, "https://neomeditech.com.np/shop");
  assert.equal(jsonLd.mainEntity["@type"], "ItemList");

  // Verify default fallback when siteUrl is omitted
  const defaultJsonLd = generateCatalogueJsonLd(PRODUCT_SEED);
  assert.equal(defaultJsonLd.url, "https://neomeditech.com.np/shop");

  // Verify that no item is typed as "Product"
  const serialized = JSON.stringify(jsonLd);
  assert.equal(serialized.includes('"@type":"Product"'), false);
  assert.equal(serialized.includes('"Product"'), false);
});

test("2. numberOfItems matches the active product count and inactive products are excluded", () => {
  const sampleProducts = [
    { name: "Active Machine 1", isActive: true },
    { name: "Inactive Machine 2", isActive: false },
    { name: "Active Machine 3", isActive: true },
    { name: "Implicitly Active Machine 4" },
  ];

  const jsonLd = generateCatalogueJsonLd(sampleProducts, "https://neomeditech.com.np");

  assert.equal(jsonLd.url, "https://neomeditech.com.np/shop");
  assert.equal(jsonLd.mainEntity.numberOfItems, 3);
  assert.equal(jsonLd.mainEntity.itemListElement.length, 3);
  assert.deepEqual(
    jsonLd.mainEntity.itemListElement.map((item) => item.name),
    ["Active Machine 1", "Active Machine 3", "Implicitly Active Machine 4"],
  );
});

test("3. every ListItem.position is valid, 1-indexed, and sequential", () => {
  const jsonLd = generateCatalogueJsonLd(PRODUCT_SEED, SITE.url);
  const elements = jsonLd.mainEntity.itemListElement;

  assert.ok(elements.length > 0);
  elements.forEach((item, index) => {
    assert.equal(item["@type"], "ListItem");
    assert.equal(item.position, index + 1);
    assert.ok(typeof item.name === "string" && item.name.length > 0);
  });
});

test("4. no fake Offer, price, rating, review or availability is generated", () => {
  const jsonLd = generateCatalogueJsonLd(PRODUCT_SEED, SITE.url);
  const serialized = JSON.stringify(jsonLd);

  assert.equal(serialized.includes('"offers"'), false);
  assert.equal(serialized.includes('"Offer"'), false);
  assert.equal(serialized.includes('"price"'), false);
  assert.equal(serialized.includes('"priceCurrency"'), false);
  assert.equal(serialized.includes('"rating"'), false);
  assert.equal(serialized.includes('"aggregateRating"'), false);
  assert.equal(serialized.includes('"review"'), false);
  assert.equal(serialized.includes('"availability"'), false);
});

test("5. canEmitProductRichResult correctly rejects inquiry-based products without pricing", () => {
  assert.equal(canEmitProductRichResult({ name: "Oxygen Concentrator", price: null }), false);
  assert.equal(canEmitProductRichResult({ name: "Monitor", price: undefined }), false);
  assert.equal(canEmitProductRichResult({ name: "Free Probe", price: 0 }), false);
  assert.equal(canEmitProductRichResult({ name: "Commercial Product", price: 150000 }), true);
});

test("6. JSON-LD values are safely serialized against script tag injection", () => {
  const dangerousData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Medical <script>alert('xss')</script> Products",
    url: "https://neomeditech.com.np/shop",
  };

  const serialized = serializeJsonLd(dangerousData);
  assert.equal(serialized.includes("<script>"), false);
  assert.equal(serialized.includes("</script>"), false);
  assert.equal(serialized.includes("\\u003cscript\\u003e"), true);
});

test("7. Shop page source does not render per-product Product JSON-LD inside card loops", () => {
  const shopPagePath = path.join(process.cwd(), "src/app/shop/page.tsx");
  const shopContent = fs.readFileSync(shopPagePath, "utf-8");

  // Verify that the invalid Product object generation is completely gone from the file
  assert.equal(shopContent.includes('"@type": "Product"'), false);
  assert.equal(shopContent.includes('"@type": "Offer"'), false);
  assert.equal(shopContent.includes("productJsonLd"), false);

  // Verify that the new catalogue structured data is integrated
  assert.equal(shopContent.includes("generateCatalogueJsonLd"), true);
  assert.equal(shopContent.includes("serializeJsonLd"), true);

  // Verify visible product cards and WhatsApp action component are preserved
  assert.equal(shopContent.includes("<ProductAction product={product} />"), true);
  assert.equal(shopContent.includes("product.image"), true);
  assert.equal(shopContent.includes("product.category"), true);
  assert.equal(shopContent.includes("product.name"), true);
});

test("8. Existing MedicalBusiness and FAQPage structured data remain intact and use serializeJsonLd", () => {
  const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");
  assert.ok(layoutContent.includes('"@type": "MedicalBusiness"'));
  assert.ok(layoutContent.includes('"@type": "PostalAddress"'));
  assert.ok(layoutContent.includes('"@type": "GeoCoordinates"'));
  assert.ok(layoutContent.includes("serializeJsonLd(orgJsonLd)"));

  const faqPath = path.join(process.cwd(), "src/app/faq/page.tsx");
  const faqContent = fs.readFileSync(faqPath, "utf-8");
  assert.ok(faqContent.includes('"@type": "FAQPage"'));
  assert.ok(faqContent.includes('"@type": "Question"'));
  assert.ok(faqContent.includes('"@type": "Answer"'));
  assert.ok(faqContent.includes("serializeJsonLd(jsonLd)"));
});

test("9. Root layout provides sitewide Organization and LocalBusiness (MedicalBusiness) schema with complete GBP details", () => {
  const layoutPath = path.join(process.cwd(), "src/app/layout.tsx");
  const layoutContent = fs.readFileSync(layoutPath, "utf-8");
  assert.ok(layoutContent.includes('"@type": "Organization"'));
  assert.ok(layoutContent.includes('"@type": "MedicalBusiness"'));
  assert.ok(layoutContent.includes("BUSINESS_INFO.address.streetAddress"));
  assert.ok(layoutContent.includes("BUSINESS_INFO.telephone"));
  assert.ok(layoutContent.includes("BUSINESS_INFO.sameAs"));
  assert.ok(layoutContent.includes("openingHoursSpecification"));

  const data = getBusinessStructuredData("https://neomeditech.com.np");
  assert.equal(data["@context"], "https://schema.org");
  assert.ok(Array.isArray(data["@graph"]));
  assert.equal(data["@graph"].length, 2);

  const org = data["@graph"].find((item) => item["@type"] === "Organization");
  assert.ok(org);
  assert.equal(org.name, BUSINESS_INFO.name);
  assert.equal(org.url, "https://neomeditech.com.np");
  assert.ok(org.logo);
  assert.ok(Array.isArray(org.sameAs));
  assert.equal(org.sameAs.length, 3);

  const business = data["@graph"].find((item) => item["@type"] === "MedicalBusiness");
  assert.ok(business);
  assert.equal(business.address["@type"], "PostalAddress");
  assert.equal(business.address.streetAddress, "Tarakeshwar-6");
  assert.equal(business.address.addressLocality, "Kathmandu");
  assert.equal(business.address.addressCountry, "NP");
  assert.equal(business.geo["@type"], "GeoCoordinates");
  assert.equal(business.telephone[0], "+977 9712011758");
  assert.ok(Array.isArray(business.openingHoursSpecification));
  assert.equal(business.parentOrganization["@id"], "https://neomeditech.com.np/#organization");

  const serialized = serializeJsonLd(data);
  assert.ok(!serialized.includes("<script>"));
  assert.ok(serialized.includes("Tarakeshwar-6"));
});
