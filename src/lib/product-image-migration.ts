import crypto from "node:crypto";
import {
  verifyImageSignature,
  ALLOWED_IMAGE_MIMES,
  MAX_IMAGE_BYTES,
} from "./product-image-validation.ts";

export { MAX_IMAGE_BYTES, ALLOWED_IMAGE_MIMES };

export type ImageClassificationType =
  | "wordpress"
  | "blob"
  | "local_static"
  | "placeholder"
  | "missing"
  | "unrecognized";

export interface ProductMigrationItem {
  id: string;
  name: string;
  image?: string | null;
  category?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface ImageClassificationResult {
  type: ImageClassificationType;
  image: string;
  canMigrate: boolean;
  reason?: string;
}

export interface PlanItem {
  productId: string;
  productName: string;
  currentImage: string;
  classification: ImageClassificationType;
  action: "migrate" | "skip" | "error";
  reason: string;
  wpUrl?: string;
}

export interface MigrationPlan {
  summary: {
    totalProducts: number;
    pendingWordPressMigration: number;
    uniqueWordPressUrls: number;
    alreadyBlob: number;
    localStatic: number;
    placeholder: number;
    missingOrEmpty: number;
    unrecognized: number;
    errors: number;
  };
  uniqueWpUrlCount: number;
  items: PlanItem[];
  urlToProductIds: Record<string, string[]>;
}

export interface DownloadedImageResult {
  buffer: Buffer;
  mime: string;
  ext: string;
  sha256: string;
}

/**
 * Strictly validates a WordPress image URL for SSRF protection and path safety.
 */
export function validateWordPressImageUrl(url: unknown): {
  ok: true;
  cleanUrl: string;
} | {
  ok: false;
  reason: string;
} {
  if (typeof url !== "string") {
    return { ok: false, reason: "URL must be a string." };
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return { ok: false, reason: "URL cannot be empty." };
  }

  if (trimmed.length > 512) {
    return { ok: false, reason: "URL exceeds 512 characters." };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, reason: "Malformed URL syntax." };
  }

  if (parsed.protocol !== "https:") {
    return { ok: false, reason: `Invalid protocol: expected https: but got ${parsed.protocol}` };
  }

  const hostname = parsed.hostname.toLowerCase();
  if (hostname !== "neomeditech.com.np") {
    return {
      ok: false,
      reason: `SSRF rejection: hostname "${hostname}" does not match authoritative domain neomeditech.com.np.`,
    };
  }

  if (parsed.username || parsed.password) {
    return { ok: false, reason: "SSRF rejection: URL credentials are not allowed." };
  }

  if (parsed.port && parsed.port !== "443") {
    return { ok: false, reason: `SSRF rejection: non-standard port ${parsed.port}.` };
  }

  if (parsed.search || parsed.hash) {
    return { ok: false, reason: "Query strings and hash fragments are not allowed on media URLs." };
  }

  const pathname = parsed.pathname;
  if (!pathname.startsWith("/wp-content/uploads/")) {
    return { ok: false, reason: "Path must reside under /wp-content/uploads/." };
  }

  if (
    pathname.includes("..") ||
    pathname.includes("\\") ||
    /%(?:2f|5c|00)/i.test(pathname)
  ) {
    return { ok: false, reason: "Path traversal or illegal encoded characters detected." };
  }

  const extMatch = pathname.match(/\.([a-z0-9]+)$/i);
  if (!extMatch) {
    return { ok: false, reason: "Missing file extension in media path." };
  }

  const ext = extMatch[1].toLowerCase();
  const allowedExts = new Set(["jpg", "jpeg", "png", "webp", "avif"]);
  if (!allowedExts.has(ext)) {
    return { ok: false, reason: `File extension .${ext} is not an allowed image format.` };
  }

  return { ok: true, cleanUrl: parsed.toString() };
}

/**
 * Inspects downloaded image buffer, checks magic bytes against declared or detected MIME.
 */
export function validateDownloadedImage(
  buffer: Buffer,
  declaredContentType?: string | null,
): { ok: true; data: DownloadedImageResult } | { ok: false; reason: string } {
  if (!Buffer.isBuffer(buffer)) {
    return { ok: false, reason: "Payload is not a valid Buffer." };
  }

  if (buffer.byteLength === 0) {
    return { ok: false, reason: "Image payload is empty (0 bytes)." };
  }

  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      reason: `Image payload exceeds maximum allowed size of ${MAX_IMAGE_BYTES / (1024 * 1024)}MB.`,
    };
  }

  let mime = (declaredContentType || "").split(";")[0].toLowerCase().trim();

  // If MIME is missing or generic octet-stream, infer from magic bytes
  if (!mime || mime === "application/octet-stream" || !ALLOWED_IMAGE_MIMES[mime]) {
    if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      mime = "image/jpeg";
    } else if (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      mime = "image/png";
    } else if (
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    ) {
      mime = "image/webp";
    } else if (
      buffer.length >= 12 &&
      buffer.toString("ascii", 4, 8) === "ftyp" &&
      (buffer.toString("ascii", 8, 12) === "avif" || buffer.toString("ascii", 8, 12) === "avis")
    ) {
      mime = "image/avif";
    } else {
      return { ok: false, reason: "Cannot determine supported image format from payload magic bytes." };
    }
  }

  const mimeConfig = ALLOWED_IMAGE_MIMES[mime];
  if (!mimeConfig) {
    return { ok: false, reason: `Unsupported image MIME type: ${mime}` };
  }

  if (!verifyImageSignature(buffer, mime)) {
    return {
      ok: false,
      reason: `Image content signature does not match declared MIME type "${mime}".`,
    };
  }

  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

  return {
    ok: true,
    data: {
      buffer,
      mime: mimeConfig.mime,
      ext: mimeConfig.ext,
      sha256,
    },
  };
}

/**
 * Deterministically generates target Blob path for migrated asset:
 * products/migrated/<product-id>-<hash-prefix>.<ext>
 */
export function generateMigratedBlobPath(
  productId: string,
  contentHash: string,
  ext: string,
): string {
  const safeId = productId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
  const hashPrefix = contentHash.replace(/[^a-f0-9]/gi, "").slice(0, 12).toLowerCase();
  const safeExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `products/migrated/${safeId}-${hashPrefix}.${safeExt}`;
}

/**
 * Classifies an image URL to determine whether it is a WordPress URL, Blob URL, local static, etc.
 */
export function classifyProductImage(image: string | null | undefined): ImageClassificationResult {
  if (!image || typeof image !== "string" || !image.trim()) {
    return { type: "missing", image: "", canMigrate: false, reason: "Product has no image specified." };
  }

  const trimmed = image.trim();

  if (trimmed.startsWith("https://neomeditech.com.np/wp-content/uploads/")) {
    return {
      type: "wordpress",
      image: trimmed,
      canMigrate: true,
      reason: "Legacy WordPress upload URL requiring migration to Vercel Blob.",
    };
  }

  if (trimmed.includes(".public.blob.vercel-storage.com")) {
    return {
      type: "blob",
      image: trimmed,
      canMigrate: false,
      reason: "Already hosted on Vercel Blob.",
    };
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return {
      type: "local_static",
      image: trimmed,
      canMigrate: false,
      reason: "Local static asset in public/ directory.",
    };
  }

  if (trimmed.includes("placehold.co")) {
    return {
      type: "placeholder",
      image: trimmed,
      canMigrate: false,
      reason: "External placeholder service (demo/fallback asset).",
    };
  }

  return {
    type: "unrecognized",
    image: trimmed,
    canMigrate: false,
    reason: "Unrecognized image source.",
  };
}

/**
 * Creates an end-to-end migration plan from a list of products.
 */
export function planProductImageMigration(products: ProductMigrationItem[]): MigrationPlan {
  const items: PlanItem[] = [];
  const urlToProductIds: Record<string, string[]> = {};

  const summary = {
    totalProducts: products.length,
    pendingWordPressMigration: 0,
    uniqueWordPressUrls: 0,
    alreadyBlob: 0,
    localStatic: 0,
    placeholder: 0,
    missingOrEmpty: 0,
    unrecognized: 0,
    errors: 0,
  };

  for (const product of products) {
    const classification = classifyProductImage(product.image);

    if (classification.type === "blob") {
      summary.alreadyBlob++;
      items.push({
        productId: product.id,
        productName: product.name,
        currentImage: product.image || "",
        classification: "blob",
        action: "skip",
        reason: "Already hosted on Vercel Blob.",
      });
      continue;
    }

    if (classification.type === "local_static") {
      summary.localStatic++;
      items.push({
        productId: product.id,
        productName: product.name,
        currentImage: product.image || "",
        classification: "local_static",
        action: "skip",
        reason: "Local static asset in public/.",
      });
      continue;
    }

    if (classification.type === "placeholder") {
      summary.placeholder++;
      items.push({
        productId: product.id,
        productName: product.name,
        currentImage: product.image || "",
        classification: "placeholder",
        action: "skip",
        reason: "External placeholder URL.",
      });
      continue;
    }

    if (classification.type === "missing") {
      summary.missingOrEmpty++;
      items.push({
        productId: product.id,
        productName: product.name,
        currentImage: "",
        classification: "missing",
        action: "skip",
        reason: "No image assigned.",
      });
      continue;
    }

    if (classification.type === "unrecognized") {
      summary.unrecognized++;
      items.push({
        productId: product.id,
        productName: product.name,
        currentImage: product.image || "",
        classification: "unrecognized",
        action: "skip",
        reason: "Unrecognized image host.",
      });
      continue;
    }

    // Must be "wordpress"
    const validation = validateWordPressImageUrl(product.image);
    if (!validation.ok) {
      summary.errors++;
      items.push({
        productId: product.id,
        productName: product.name,
        currentImage: product.image || "",
        classification: "wordpress",
        action: "error",
        reason: `Validation error: ${validation.reason}`,
      });
      continue;
    }

    summary.pendingWordPressMigration++;
    const wpUrl = validation.cleanUrl;
    if (!urlToProductIds[wpUrl]) {
      urlToProductIds[wpUrl] = [];
    }
    urlToProductIds[wpUrl].push(product.id);

    items.push({
      productId: product.id,
      productName: product.name,
      currentImage: wpUrl,
      classification: "wordpress",
      action: "migrate",
      reason: "WordPress upload URL ready for migration to Vercel Blob.",
      wpUrl,
    });
  }

  summary.uniqueWordPressUrls = Object.keys(urlToProductIds).length;

  return {
    summary,
    uniqueWpUrlCount: summary.uniqueWordPressUrls,
    items,
    urlToProductIds,
  };
}

/**
 * Builds rollback entries from applied migration results.
 */
export function buildRollbackMap(
  appliedRecords: Array<{ productId: string; originalImage: string; newBlobUrl: string }>,
): Array<{ productId: string; originalImage: string }> {
  return appliedRecords
    .filter((r) => r.productId && r.originalImage)
    .map((r) => ({
      productId: r.productId,
      originalImage: r.originalImage,
    }));
}
