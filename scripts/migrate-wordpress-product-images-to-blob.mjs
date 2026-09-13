#!/usr/bin/env node

/**
 * Migration Script: Migrate WordPress Product Images to Vercel Blob
 *
 * Safety Guarantees:
 * - Defaults to --dry-run.
 * - Does NOT perform mutations without --apply AND --confirm=NEOMEDITECH_IMAGE_MIGRATION.
 * - Never prints secrets, MONGODB_URI, or BLOB_READ_WRITE_TOKEN.
 * - Enforces SSRF and magic-byte validation before any upload.
 * - Records all actions and rollback mappings into .local-migrations/.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import {
  planProductImageMigration,
  validateWordPressImageUrl,
  validateDownloadedImage,
  generateMigratedBlobPath,
  buildRollbackMap,
} from "../src/lib/product-image-migration.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// 1. Argument parsing
const args = process.argv.slice(2);
const isApply = args.includes("--apply");
const isDryRun = args.includes("--dry-run") || !isApply;
const confirmArg = args.find((a) => a.startsWith("--confirm="));
const confirmationValue = confirmArg ? confirmArg.split("=")[1] : null;

const rollbackArg = args.find((a) => a === "--rollback" || a.startsWith("--rollback="));
let rollbackFilePath = null;
if (rollbackArg) {
  if (rollbackArg.startsWith("--rollback=")) {
    rollbackFilePath = rollbackArg.split("=")[1];
  } else {
    const idx = args.indexOf("--rollback");
    rollbackFilePath = args[idx + 1];
  }
}

// Ensure .local-migrations folder exists
const migrationsDir = path.join(projectRoot, ".local-migrations");
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

// 2. Load environment variables securely from .env.local if not already in process.env
function getEnv(key) {
  if (process.env[key]) return process.env[key];
  const envLocalPath = path.join(projectRoot, ".env.local");
  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(`${key}=`)) {
        return trimmed.slice(key.length + 1).replace(/^["']|["']$/g, "").trim();
      }
    }
  }
  return null;
}

const mongoUri = getEnv("MONGODB_URI");
if (!mongoUri) {
  console.error("❌ ERROR: MONGODB_URI not found in environment or .env.local.");
  process.exit(1);
}

// 3. Rollback Mode
if (rollbackFilePath) {
  if (confirmationValue !== "NEOMEDITECH_IMAGE_ROLLBACK") {
    console.error("❌ ERROR: Rollback requires explicit confirmation flag:");
    console.error("   --confirm=NEOMEDITECH_IMAGE_ROLLBACK");
    process.exit(1);
  }

  const resolvedReportPath = path.resolve(projectRoot, rollbackFilePath);
  if (!fs.existsSync(resolvedReportPath)) {
    console.error(`❌ ERROR: Report file not found: ${resolvedReportPath}`);
    process.exit(1);
  }

  const reportData = JSON.parse(fs.readFileSync(resolvedReportPath, "utf8"));
  const rollbackMap = reportData.rollbackMap || [];
  if (rollbackMap.length === 0) {
    console.error("❌ ERROR: No rollback entries found in report.");
    process.exit(1);
  }

  console.log(`\n=== Executing Image Migration Rollback ===`);
  console.log(`Report: ${rollbackFilePath}`);
  console.log(`Entries to restore: ${rollbackMap.length}`);

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
    const db = mongoose.connection.db;
    const collection = db.collection("products");

    let restored = 0;
    for (const entry of rollbackMap) {
      const objId = mongoose.Types.ObjectId.isValid(entry.productId)
        ? new mongoose.Types.ObjectId(entry.productId)
        : entry.productId;

      await collection.updateOne(
        { _id: objId },
        { $set: { image: entry.originalImage, updatedAt: new Date() } }
      );
      restored++;
    }

    console.log(`\n✅ Rollback completed successfully! Restored ${restored} product image URLs.`);
  } catch (err) {
    console.error("❌ Rollback failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
  process.exit(0);
}

// 4. Apply Mode Safety Guard
let blobToken = null;
if (isApply) {
  if (confirmationValue !== "NEOMEDITECH_IMAGE_MIGRATION") {
    console.error("❌ SAFETY ABORT: Live migration requested without proper confirmation.");
    console.error("   To execute live migration to Vercel Blob and MongoDB, you must specify:");
    console.error("   node scripts/migrate-wordpress-product-images-to-blob.mjs --apply --confirm=NEOMEDITECH_IMAGE_MIGRATION");
    process.exit(1);
  }

  blobToken = getEnv("BLOB_READ_WRITE_TOKEN");
  if (!blobToken) {
    console.error("❌ ERROR: BLOB_READ_WRITE_TOKEN is required for live migration.");
    process.exit(1);
  }
}

// 5. Connect to MongoDB and fetch product catalogue
console.log("\n========================================================");
console.log(isApply ? "  LIVE IMAGE MIGRATION: WordPress -> Vercel Blob" : "  DRY RUN: WordPress -> Vercel Blob Dependency Audit");
console.log("========================================================\n");

let products = [];
try {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db;
  const collection = db.collection("products");
  const rawProducts = await collection.find({}).toArray();
  products = rawProducts.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    slug: p.slug,
    category: p.category,
    image: p.image,
    price: p.price,
    stock: p.stock,
    isActive: p.isActive,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
} catch (err) {
  console.error("❌ Failed to connect to MongoDB:", err.message);
  process.exit(1);
} finally {
  if (isDryRun) {
    await mongoose.disconnect();
  }
}

console.log(`Total products queried from MongoDB: ${products.length}`);

// 6. Generate Migration Plan
const plan = planProductImageMigration(products);

console.log("\n--- Breakdown by Image Source ---");
console.log(`- Pending WordPress Migration: ${plan.summary.pendingWordPressMigration}`);
console.log(`- Unique WordPress URLs:       ${plan.summary.uniqueWordPressUrls}`);
console.log(`- Already on Vercel Blob:       ${plan.summary.alreadyBlob}`);
console.log(`- Local Static Assets:          ${plan.summary.localStatic}`);
console.log(`- External Placeholders:        ${plan.summary.placeholder}`);
console.log(`- Missing/Empty Image:          ${plan.summary.missingOrEmpty}`);
console.log(`- Unrecognized Image Hosts:     ${plan.summary.unrecognized}`);
console.log(`- Invalid URLs / Errors:        ${plan.summary.errors}`);

// Identify Suspicious Test/Local Products
const suspicious = products.filter(
  (p) =>
    (p.image || "").startsWith("/products/") ||
    ["mula", "ms andy", "SEMSHANG LAMA YONJAN"].includes(p.name)
);

if (suspicious.length > 0) {
  console.log(`\n--- Suspicious / Inactive Test Products Detected (${suspicious.length}) ---`);
  for (const s of suspicious) {
    console.log(
      `  • ID: ${s.id} | Name: "${s.name}" | Active: ${s.isActive} | Image: ${s.image}`
    );
  }
  console.log("  ℹ Notice: These local test products will NOT be overwritten during WordPress migration.");
}

// 7. DRY-RUN EXECUTION
if (isDryRun) {
  console.log("\n--- Checking WordPress Source Image Availability ---");
  const uniqueUrls = Object.keys(plan.urlToProductIds);

  let verifiedCount = 0;
  let totalEstimatedBytes = 0;
  const urlStatusMap = {};

  for (const url of uniqueUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(url, { method: "HEAD", signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        verifiedCount++;
        const ct = res.headers.get("content-type") || "unknown";
        const cl = parseInt(res.headers.get("content-length") || "0", 10);
        totalEstimatedBytes += cl;
        urlStatusMap[url] = { status: res.status, contentType: ct, sizeBytes: cl };
      } else {
        urlStatusMap[url] = { status: res.status, error: `HTTP ${res.status}` };
      }
    } catch (fetchErr) {
      urlStatusMap[url] = { status: 0, error: fetchErr.message };
    }
  }

  console.log(`Verified remote accessibility: ${verifiedCount} / ${uniqueUrls.length} reachable.`);
  console.log(`Total estimated transfer size: ${(totalEstimatedBytes / (1024 * 1024)).toFixed(2)} MB`);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportFilename = `dry-run-${timestamp}.json`;
  const reportPath = path.join(migrationsDir, reportFilename);

  const dryRunReport = {
    mode: "dry-run",
    executedAt: new Date().toISOString(),
    summary: plan.summary,
    totalEstimatedBytes,
    uniqueUrlsChecked: uniqueUrls.length,
    urlStatusMap,
    plannedItems: plan.items,
  };

  fs.writeFileSync(reportPath, JSON.stringify(dryRunReport, null, 2), "utf8");

  console.log("\n========================================================");
  console.log(`✅ DRY RUN REPORT SAVED: .local-migrations/${reportFilename}`);
  console.log("   Zero Blobs uploaded. Zero database records modified.");
  console.log("========================================================\n");
  process.exit(0);
}

// 8. LIVE APPLY EXECUTION
console.log("\n--- LIVE APPLY: Downloading, Validating & Uploading to Vercel Blob ---");

// Dynamic import of @vercel/blob
const { put } = await import("@vercel/blob");

const uniqueUrls = Object.keys(plan.urlToProductIds);
const uploadedBlobMap = {}; // wpUrl -> blobUrl
const appliedRecords = [];
let uploadFailures = 0;

for (let i = 0; i < uniqueUrls.length; i++) {
  const wpUrl = uniqueUrls[i];
  const associatedProductIds = plan.urlToProductIds[wpUrl];
  console.log(`[${i + 1}/${uniqueUrls.length}] Processing: ${path.basename(wpUrl)}...`);

  try {
    // SSRF Check
    const urlValidation = validateWordPressImageUrl(wpUrl);
    if (!urlValidation.ok) {
      throw new Error(`SSRF check failed: ${urlValidation.reason}`);
    }

    // Download image
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(wpUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Failed to download: HTTP ${res.status}`);
    }

    const arrayBuf = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const declaredMime = res.headers.get("content-type");

    // Content & magic byte validation
    const validation = validateDownloadedImage(buffer, declaredMime);
    if (!validation.ok) {
      throw new Error(`Image validation failed: ${validation.reason}`);
    }

    const { mime, ext, sha256 } = validation.data;
    const blobPath = generateMigratedBlobPath(associatedProductIds[0], sha256, ext);

    // Upload to @vercel/blob
    const blob = await put(blobPath, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType: mime,
      token: blobToken,
    });

    uploadedBlobMap[wpUrl] = blob.url;
    console.log(`    Uploaded to Blob -> ${blob.url}`);

    // Update MongoDB for all products mapped to this image
    const db = mongoose.connection.db;
    const collection = db.collection("products");

    for (const pid of associatedProductIds) {
      const objId = mongoose.Types.ObjectId.isValid(pid)
        ? new mongoose.Types.ObjectId(pid)
        : pid;

      await collection.updateOne(
        { _id: objId },
        { $set: { image: blob.url, updatedAt: new Date() } }
      );

      appliedRecords.push({
        productId: pid,
        originalImage: wpUrl,
        newBlobUrl: blob.url,
      });
    }
  } catch (err) {
    uploadFailures++;
    console.error(`    ❌ Failed processing ${wpUrl}:`, err.message);
  }
}

// 9. Save Apply Report with Rollback Map
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const reportFilename = `migration-${timestamp}.json`;
const reportPath = path.join(migrationsDir, reportFilename);

const rollbackMap = buildRollbackMap(appliedRecords);

const applyReport = {
  mode: "apply",
  executedAt: new Date().toISOString(),
  totalProductsUpdated: appliedRecords.length,
  totalUniqueImagesMigrated: Object.keys(uploadedBlobMap).length,
  uploadFailures,
  appliedRecords,
  rollbackMap,
};

fs.writeFileSync(reportPath, JSON.stringify(applyReport, null, 2), "utf8");

try {
  await mongoose.disconnect();
} catch {}

console.log("\n========================================================");
console.log(`✅ LIVE MIGRATION COMPLETE`);
console.log(`   Products Updated: ${appliedRecords.length}`);
console.log(`   Blobs Created:    ${Object.keys(uploadedBlobMap).length}`);
console.log(`   Failures:         ${uploadFailures}`);
console.log(`   Migration Record: .local-migrations/${reportFilename}`);
console.log(`\nTo rollback this migration if ever needed:`);
console.log(`   node scripts/migrate-wordpress-product-images-to-blob.mjs --rollback=.local-migrations/${reportFilename} --confirm=NEOMEDITECH_IMAGE_ROLLBACK`);
console.log("========================================================\n");
