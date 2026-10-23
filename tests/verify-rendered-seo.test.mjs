import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

test("Phase 22 - Verify pre-rendered SEO HTML output for Category, Product, and Homepage", (t) => {
  // 1. Category Page
  const catPath = path.join(process.cwd(), ".next/server/app/products/category/respiratory-care.html");
  if (!fs.existsSync(catPath)) {
    t.skip("Build output .next/server/app/products/category/respiratory-care.html does not exist. Run next build with active DB first.");
    return;
  }
  const catHtml = fs.readFileSync(catPath, "utf-8");
  const $cat = cheerio.load(catHtml);

  assert.equal($cat("title").text(), "Respiratory Care in Nepal | Neomeditech");
  assert.equal($cat("h1").text(), "Respiratory Care in Nepal");
  assert.equal($cat('link[rel="canonical"]').attr("href"), "https://neomeditech.com.np/products/category/respiratory-care");
  assert.ok($cat('meta[name="description"]').attr("content")?.includes("respiratory care"));

  // Check Category JSON-LD (CollectionPage + ItemList + BreadcrumbList)
  let foundCategoryGraph = false;
  $cat('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($cat(el).html() || "{}");
      if (Array.isArray(data["@graph"])) {
        const types = data["@graph"].map((g) => g["@type"]);
        if (types.includes("CollectionPage") && types.includes("BreadcrumbList")) {
          foundCategoryGraph = true;
        }
      }
    } catch {}
  });
  assert.ok(foundCategoryGraph, "Category JSON-LD must contain CollectionPage and BreadcrumbList");

  // 2. Product Page (BiPAP Machine)
  const prodPath = path.join(process.cwd(), ".next/server/app/products/bipap-machine-advanced-respiratory-support.html");
  assert.ok(fs.existsSync(prodPath), "Product SSG HTML should exist");
  const prodHtml = fs.readFileSync(prodPath, "utf-8");
  const $prod = cheerio.load(prodHtml);

  assert.equal(
    $prod("title").text(),
    "BiPAP Respiratory Machine in Nepal | Neomeditech"
  );
  assert.equal(
    $prod("h1").text(),
    "BiPAP Machine - Advanced Respiratory Support in Nepal"
  );
  assert.equal(
    $prod('link[rel="canonical"]').attr("href"),
    "https://neomeditech.com.np/products/bipap-machine-advanced-respiratory-support"
  );
  assert.equal($prod('meta[name="robots"]').attr("content"), "index, follow");

  // Check Product JSON-LD (Must contain BreadcrumbList, and must NOT contain Product without Offer/review)
  let foundBreadcrumbGraph = false;
  let hasUnqualifiedProduct = false;
  $prod('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($prod(el).html() || "{}");
      if (Array.isArray(data["@graph"])) {
        const types = data["@graph"].map((g) => g["@type"]);
        if (types.includes("BreadcrumbList")) {
          foundBreadcrumbGraph = true;
        }
        if (types.includes("Product")) {
          hasUnqualifiedProduct = true;
        }
      }
    } catch {}
  });
  assert.ok(foundBreadcrumbGraph, "Product JSON-LD must contain BreadcrumbList");
  assert.equal(hasUnqualifiedProduct, false, "Inquiry-based BiPAP page must NOT emit unqualified Product schema");

  // 3. Homepage
  const homePath = path.join(process.cwd(), ".next/server/app/index.html");
  assert.ok(fs.existsSync(homePath), "Homepage SSG HTML should exist");
  const homeHtml = fs.readFileSync(homePath, "utf-8");
  const $home = cheerio.load(homeHtml);

  assert.ok($home("title").text().includes("Nepal"));
  assert.equal($home('link[rel="canonical"]').attr("href"), "https://neomeditech.com.np");
});
