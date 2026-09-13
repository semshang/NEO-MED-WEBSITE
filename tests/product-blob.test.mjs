import assert from "node:assert/strict";
import test from "node:test";
import {
  validateProductImageInput,
  verifyImageSignature,
  generateSafeProductImageFilename,
  MAX_IMAGE_BYTES,
} from "../src/lib/product-image-validation.ts";
import { safePublicImagePath } from "../src/lib/security-validation.ts";

test("Task 3 - Test 1: Valid JPEG signature (FF D8 FF) is recognized and accepted", () => {
  const validJpegBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  assert.equal(verifyImageSignature(validJpegBuf, "image/jpeg"), true);
  assert.equal(verifyImageSignature(validJpegBuf, "image/jpg"), true);

  const dataUrl = "data:image/jpeg;base64," + validJpegBuf.toString("base64");
  const res = validateProductImageInput(dataUrl);
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.data.action, "upload");
    assert.equal(res.data.mime, "image/jpeg");
    assert.equal(res.data.ext, "jpg");
    assert.match(res.data.safeFilename, /^products\/product-\d+-[a-z0-9]+\.jpg$/);
  }
});

test("Task 3 - Test 2: Valid PNG signature (89 50 4E 47 0D 0A 1A 0A) is recognized and accepted", () => {
  const validPngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
  assert.equal(verifyImageSignature(validPngBuf, "image/png"), true);

  const dataUrl = "data:image/png;base64," + validPngBuf.toString("base64");
  const res = validateProductImageInput(dataUrl);
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.data.action, "upload");
    assert.equal(res.data.mime, "image/png");
    assert.equal(res.data.ext, "png");
    assert.match(res.data.safeFilename, /^products\/product-\d+-[a-z0-9]+\.png$/);
  }
});

test("Task 3 - Test 3: Valid WebP signature (RIFF at 0-3, WEBP at 8-11) is recognized and accepted", () => {
  const validWebpBuf = Buffer.concat([
    Buffer.from("RIFF", "ascii"),
    Buffer.from([0x20, 0x00, 0x00, 0x00]),
    Buffer.from("WEBP", "ascii"),
    Buffer.from([0x00, 0x00]),
  ]);
  assert.equal(verifyImageSignature(validWebpBuf, "image/webp"), true);

  const dataUrl = "data:image/webp;base64," + validWebpBuf.toString("base64");
  const res = validateProductImageInput(dataUrl);
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.data.action, "upload");
    assert.equal(res.data.mime, "image/webp");
    assert.equal(res.data.ext, "webp");
    assert.match(res.data.safeFilename, /^products\/product-\d+-[a-z0-9]+\.webp$/);
  }
});

test("Task 3 - Test 4: PNG MIME with HTML bytes is rejected with 400 signature mismatch", () => {
  const htmlBuf = Buffer.from("<html><head></head><body>evil script</body></html>");
  assert.equal(verifyImageSignature(htmlBuf, "image/png"), false);

  const dataUrl = "data:image/png;base64," + htmlBuf.toString("base64");
  const res = validateProductImageInput(dataUrl);
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.equal(res.status, 400);
    assert.match(res.message, /signature/i);
  }
});

test("Task 3 - Test 5: JPEG MIME with PNG bytes is rejected with 400 signature mismatch", () => {
  const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.equal(verifyImageSignature(pngBuf, "image/jpeg"), false);

  const dataUrl = "data:image/jpeg;base64," + pngBuf.toString("base64");
  const res = validateProductImageInput(dataUrl);
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.equal(res.status, 400);
    assert.match(res.message, /signature/i);
  }
});

test("Task 3 - Test 6: Malformed WebP header (missing WEBP marker) is rejected with 400", () => {
  const badWebpBuf = Buffer.concat([
    Buffer.from("RIFF", "ascii"),
    Buffer.from([0x20, 0x00, 0x00, 0x00]),
    Buffer.from("FAIL", "ascii"),
  ]);
  assert.equal(verifyImageSignature(badWebpBuf, "image/webp"), false);

  const dataUrl = "data:image/webp;base64," + badWebpBuf.toString("base64");
  const res = validateProductImageInput(dataUrl);
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.equal(res.status, 400);
    assert.match(res.message, /signature/i);
  }
});

test("Task 3 - Test 7: Unsupported MIME types (SVG, GIF, EXE, HTML) are rejected with 400", () => {
  const svgData = "data:image/svg+xml;base64," + Buffer.from("<svg></svg>").toString("base64");
  const gifData = "data:image/gif;base64," + Buffer.from("GIF89a").toString("base64");
  const exeData = "data:application/x-msdownload;base64," + Buffer.from("MZ").toString("base64");

  const resSvg = validateProductImageInput(svgData);
  assert.equal(resSvg.ok, false);
  if (!resSvg.ok) assert.equal(resSvg.status, 400);

  const resGif = validateProductImageInput(gifData);
  assert.equal(resGif.ok, false);
  if (!resGif.ok) assert.equal(resGif.status, 400);

  const resExe = validateProductImageInput(exeData);
  assert.equal(resExe.ok, false);
  if (!resExe.ok) assert.equal(resExe.status, 400);
});

test("Task 3 - Test 8: Malformed base64 is rejected with 400", () => {
  const invalidB64 = "data:image/png;base64,!!!NotBase64@@@";
  const res = validateProductImageInput(invalidB64);
  assert.equal(res.ok, false);
  if (!res.ok) assert.equal(res.status, 400);
});

test("Task 3 - Test 9: Oversized decoded payload (>3MB) is rejected with 413", () => {
  const oversizedBuffer = Buffer.alloc(MAX_IMAGE_BYTES + 1024);
  // Give it a valid JPEG header so it fails strictly on size, not signature
  oversizedBuffer[0] = 0xff;
  oversizedBuffer[1] = 0xd8;
  oversizedBuffer[2] = 0xff;
  oversizedBuffer[3] = 0xe0;

  const oversizedData = "data:image/jpeg;base64," + oversizedBuffer.toString("base64");
  const res = validateProductImageInput(oversizedData);
  assert.equal(res.ok, false);
  if (!res.ok) assert.equal(res.status, 413);
});

test("Task 3 - Filename safety: Generated filenames have safe characters and matching extension", () => {
  const filenameJpg = generateSafeProductImageFilename("jpg");
  assert.match(filenameJpg, /^products\/product-\d+-[a-z0-9]+\.jpg$/);

  const filenamePng = generateSafeProductImageFilename("png");
  assert.match(filenamePng, /^products\/product-\d+-[a-z0-9]+\.png$/);
});

test("Task 3 - Preservation: Updating without a new image preserves existing image path", () => {
  const existingUrl = "https://store.public.blob.vercel-storage.com/products/existing.jpg";

  const resUndefined = validateProductImageInput(undefined, existingUrl, safePublicImagePath);
  assert.equal(resUndefined.ok, true);
  if (resUndefined.ok) {
    assert.equal(resUndefined.data.action, "preserve");
    assert.equal(resUndefined.data.image, existingUrl);
  }

  const resEmpty = validateProductImageInput("", existingUrl, safePublicImagePath);
  assert.equal(resEmpty.ok, true);
  if (resEmpty.ok) {
    assert.equal(resEmpty.data.action, "preserve");
    assert.equal(resEmpty.data.image, existingUrl);
  }

  const resNull = validateProductImageInput(null, existingUrl, safePublicImagePath);
  assert.equal(resNull.ok, true);
  if (resNull.ok) {
    assert.equal(resNull.data.action, "preserve");
    assert.equal(resNull.data.image, existingUrl);
  }
});

test("Task 4 - Public Blob Hostname: Valid <store>.public.blob.vercel-storage.com URLs are accepted", () => {
  const validUrl1 = "https://my-store.public.blob.vercel-storage.com/products/product-1.jpg";
  const validUrl2 = "https://abc-123.public.blob.vercel-storage.com/products/product-2.png";
  const validUrl3 = "https://prod-store-45.public.blob.vercel-storage.com/products/product-3.webp";

  assert.equal(safePublicImagePath(validUrl1), validUrl1);
  assert.equal(safePublicImagePath(validUrl2), validUrl2);
  assert.equal(safePublicImagePath(validUrl3), validUrl3);
});

test("Task 4 - Lookalike Rejection: Suffix confusion, domain suffix, and non-public Blob URLs are rejected", () => {
  // Suffix confusion without leading period before public
  assert.equal(safePublicImagePath("https://evilpublic.blob.vercel-storage.com/products/test.jpg"), "");

  // Lookalike with approved domain as path
  assert.equal(safePublicImagePath("https://evil.com/my-store.public.blob.vercel-storage.com/products/test.jpg"), "");

  // Lookalike appending approved domain as subdomain of attacker domain
  assert.equal(safePublicImagePath("https://my-store.public.blob.vercel-storage.com.attacker.com/test.jpg"), "");

  // Broader unapproved pattern (*.blob.vercel-storage.com without .public.)
  assert.equal(safePublicImagePath("https://my-store.blob.vercel-storage.com/products/test.jpg"), "");
});

test("Task 4 - URL Protocol and Structure: HTTP, credentials, unexpected ports, and protocol-relative URLs are rejected", () => {
  // HTTP protocol
  assert.equal(safePublicImagePath("http://my-store.public.blob.vercel-storage.com/products/test.jpg"), "");

  // Credentials in URL
  assert.equal(safePublicImagePath("https://admin:secret@my-store.public.blob.vercel-storage.com/products/test.jpg"), "");

  // Unexpected port
  assert.equal(safePublicImagePath("https://my-store.public.blob.vercel-storage.com:8443/products/test.jpg"), "");

  // Protocol-relative URL
  assert.equal(safePublicImagePath("//my-store.public.blob.vercel-storage.com/products/test.jpg"), "");
});

test("Task 4 - Legacy local path acceptance: Safe local paths are accepted, dangerous paths rejected", () => {
  assert.equal(safePublicImagePath("/products/glucometer.jpg"), "/products/glucometer.jpg");
  assert.equal(safePublicImagePath("/products/patient-monitor.png"), "/products/patient-monitor.png");

  // Path traversal
  assert.equal(safePublicImagePath("/products/../secret.png"), "");

  // Backslash
  assert.equal(safePublicImagePath("/products\\secret.png"), "");

  // Disallowed extension
  assert.equal(safePublicImagePath("/products/script.svg"), "");
});

