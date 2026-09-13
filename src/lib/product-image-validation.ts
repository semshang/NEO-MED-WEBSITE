export const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // 3 MB decoded

export const ALLOWED_IMAGE_MIMES: Record<string, { ext: string; mime: string }> = {
  "image/jpeg": { ext: "jpg", mime: "image/jpeg" },
  "image/jpg": { ext: "jpg", mime: "image/jpeg" },
  "image/png": { ext: "png", mime: "image/png" },
  "image/webp": { ext: "webp", mime: "image/webp" },
  "image/avif": { ext: "avif", mime: "image/avif" },
};

/**
 * Validates file content matches declared image MIME type by inspecting magic bytes.
 * - JPEG: begins with FF D8 FF
 * - PNG: begins with 89 50 4E 47 0D 0A 1A 0A
 * - WebP: begins with RIFF (bytes 0-3) and WEBP (bytes 8-11)
 * - AVIF: bytes 4-7 are 'ftyp' and bytes 8-11 are 'avif' or 'avis'
 */
export function verifyImageSignature(buffer: Buffer, declaredMime: string): boolean {
  const mime = declaredMime.toLowerCase().trim();

  if (mime === "image/jpeg" || mime === "image/jpg") {
    if (buffer.byteLength < 3) return false;
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mime === "image/png") {
    if (buffer.byteLength < 8) return false;
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 && // 'P'
      buffer[2] === 0x4e && // 'N'
      buffer[3] === 0x47 && // 'G'
      buffer[4] === 0x0d && // '\r'
      buffer[5] === 0x0a && // '\n'
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  if (mime === "image/webp") {
    if (buffer.byteLength < 12) return false;
    const riff = buffer.toString("ascii", 0, 4);
    const webp = buffer.toString("ascii", 8, 12);
    return riff === "RIFF" && webp === "WEBP";
  }

  if (mime === "image/avif") {
    if (buffer.byteLength < 12) return false;
    const ftyp = buffer.toString("ascii", 4, 8);
    const brand = buffer.toString("ascii", 8, 12);
    return ftyp === "ftyp" && (brand === "avif" || brand === "avis");
  }

  return false;
}

export function generateSafeProductImageFilename(ext: string): string {
  const sanitizedExt = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).slice(2, 10);
  return `products/product-${timestamp}-${randomSuffix}.${sanitizedExt}`;
}

export type ProductImageValidationSuccess =
  | { action: "preserve"; image: string }
  | { action: "use_existing_or_url"; image: string }
  | {
      action: "upload";
      buffer: Buffer;
      mime: string;
      ext: string;
      safeFilename: string;
    };

export type ProductImageValidationResult =
  | { ok: true; data: ProductImageValidationSuccess }
  | { ok: false; status: number; message: string };

/**
 * Pure validation helper for product image inputs.
 * Accepts data URLs (decodes, verifies base64, checks size, verifies magic bytes)
 * or existing safe paths/URLs (delegating to optional pathValidator).
 */
export function validateProductImageInput(
  imageInput: unknown,
  existingImage = "",
  pathValidator?: (path: unknown) => string,
): ProductImageValidationResult {
  if (imageInput === undefined || imageInput === null || imageInput === "") {
    return { ok: true, data: { action: "preserve", image: existingImage } };
  }

  if (typeof imageInput !== "string") {
    return { ok: false, status: 400, message: "Invalid image input." };
  }

  const trimmed = imageInput.trim();
  if (!trimmed) {
    return { ok: true, data: { action: "preserve", image: existingImage } };
  }

  // If already an existing URL or local path (not a base64 data-URL)
  if (!trimmed.startsWith("data:")) {
    if (pathValidator) {
      const validated = pathValidator(trimmed);
      if (!validated) {
        return { ok: false, status: 400, message: "Invalid or untrusted image path." };
      }
      return { ok: true, data: { action: "use_existing_or_url", image: validated } };
    }
    return { ok: true, data: { action: "use_existing_or_url", image: trimmed } };
  }

  // Validate data URL structure: data:<mime>;base64,<payload>
  const match = trimmed.match(/^data:([A-Za-z0-9/+-]+);base64,(.+)$/);
  if (!match) {
    return { ok: false, status: 400, message: "Invalid image data format." };
  }

  const rawMime = match[1].toLowerCase().trim();
  const rawData = match[2].trim();

  const mimeConfig = ALLOWED_IMAGE_MIMES[rawMime];
  if (!mimeConfig) {
    return {
      ok: false,
      status: 400,
      message: "Unsupported image type. Only JPEG, PNG, WebP, and AVIF images are permitted.",
    };
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(rawData)) {
    return { ok: false, status: 400, message: "Malformed base64 image data." };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(rawData, "base64");
  } catch {
    return { ok: false, status: 400, message: "Failed to decode base64 image." };
  }

  if (buffer.byteLength === 0) {
    return { ok: false, status: 400, message: "Empty image data." };
  }

  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    return {
      ok: false,
      status: 413,
      message: `Image exceeds maximum allowed size of ${MAX_IMAGE_BYTES / (1024 * 1024)}MB.`,
    };
  }

  if (!verifyImageSignature(buffer, rawMime)) {
    return {
      ok: false,
      status: 400,
      message: "Image content does not match the declared MIME type signature.",
    };
  }

  const safeFilename = generateSafeProductImageFilename(mimeConfig.ext);

  return {
    ok: true,
    data: {
      action: "upload",
      buffer,
      mime: mimeConfig.mime,
      ext: mimeConfig.ext,
      safeFilename,
    },
  };
}
