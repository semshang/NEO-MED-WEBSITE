import assert from "node:assert/strict";
import test from "node:test";
import {
  validateWordPressImageUrl,
  validateDownloadedImage,
  generateMigratedBlobPath,
  classifyProductImage,
  planProductImageMigration,
  buildRollbackMap,
  MAX_IMAGE_BYTES,
} from "../src/lib/product-image-migration.ts";

test("SSRF Protection: Authoritative WordPress URLs are accepted", () => {
  const validUrls = [
    "https://neomeditech.com.np/wp-content/uploads/2026/03/abpm50.webp",
    "https://neomeditech.com.np/wp-content/uploads/2026/02/Autoclave-Machine-310x310.jpg",
    "https://neomeditech.com.np/wp-content/uploads/2026/04/needle-cutter.png",
    "https://neomeditech.com.np/wp-content/uploads/2026/02/ot-Bed-310x310.avif",
  ];

  for (const url of validUrls) {
    const res = validateWordPressImageUrl(url);
    assert.equal(res.ok, true, `Expected valid: ${url}`);
    if (res.ok) {
      assert.equal(res.cleanUrl, url);
    }
  }
});

test("SSRF Protection: Non-HTTPS and disallowed protocols are rejected", () => {
  const invalid = [
    "http://neomeditech.com.np/wp-content/uploads/image.jpg",
    "ftp://neomeditech.com.np/wp-content/uploads/image.jpg",
    "file:///wp-content/uploads/image.jpg",
    "javascript:alert(1)",
  ];

  for (const url of invalid) {
    const res = validateWordPressImageUrl(url);
    assert.equal(res.ok, false, `Expected rejection for: ${url}`);
    if (!res.ok) {
      assert.match(res.reason, /protocol|syntax/i);
    }
  }
});

test("SSRF Protection: Hostname spoofing, local IPs, and cloud metadata are rejected", () => {
  const maliciousHosts = [
    "https://localhost/wp-content/uploads/image.jpg",
    "https://127.0.0.1/wp-content/uploads/image.jpg",
    "https://169.254.169.254/wp-content/uploads/image.jpg",
    "https://neomeditech.com.np.attacker.com/wp-content/uploads/image.jpg",
    "https://attacker.com/wp-content/uploads/image.jpg",
    "https://sub.neomeditech.com.np/wp-content/uploads/image.jpg",
  ];

  for (const url of maliciousHosts) {
    const res = validateWordPressImageUrl(url);
    assert.equal(res.ok, false, `Expected SSRF rejection: ${url}`);
    if (!res.ok) {
      assert.match(res.reason, /SSRF rejection|hostname/i);
    }
  }
});

test("SSRF Protection: Embedded credentials and non-standard ports are rejected", () => {
  const credsUrl = "https://user:pass@neomeditech.com.np/wp-content/uploads/image.jpg";
  const resCreds = validateWordPressImageUrl(credsUrl);
  assert.equal(resCreds.ok, false);
  if (!resCreds.ok) {
    assert.match(resCreds.reason, /credentials/i);
  }

  const portUrl = "https://neomeditech.com.np:8443/wp-content/uploads/image.jpg";
  const resPort = validateWordPressImageUrl(portUrl);
  assert.equal(resPort.ok, false);
  if (!resPort.ok) {
    assert.match(resPort.reason, /port/i);
  }
});

test("Path Safety: Directory traversal, queries, and disallowed extensions are rejected", () => {
  const traversalUrl = "https://neomeditech.com.np/wp-content/uploads/../../secret.jpg";
  assert.equal(validateWordPressImageUrl(traversalUrl).ok, false);

  const outsideWpUrl = "https://neomeditech.com.np/wp-includes/image.jpg";
  assert.equal(validateWordPressImageUrl(outsideWpUrl).ok, false);

  const queryUrl = "https://neomeditech.com.np/wp-content/uploads/image.jpg?foo=bar";
  assert.equal(validateWordPressImageUrl(queryUrl).ok, false);

  const phpUrl = "https://neomeditech.com.np/wp-content/uploads/shell.php";
  assert.equal(validateWordPressImageUrl(phpUrl).ok, false);

  const exeUrl = "https://neomeditech.com.np/wp-content/uploads/trojan.exe";
  assert.equal(validateWordPressImageUrl(exeUrl).ok, false);
});

test("Image Validation: Valid JPEG, PNG, WebP, and AVIF magic bytes are accepted", () => {
  // Valid JPEG
  const jpegBuf = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const resJpeg = validateDownloadedImage(jpegBuf, "image/jpeg");
  assert.equal(resJpeg.ok, true);
  if (resJpeg.ok) {
    assert.equal(resJpeg.data.mime, "image/jpeg");
    assert.equal(resJpeg.data.ext, "jpg");
  }

  // Valid PNG
  const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  const resPng = validateDownloadedImage(pngBuf, "image/png");
  assert.equal(resPng.ok, true);
  if (resPng.ok) {
    assert.equal(resPng.data.mime, "image/png");
    assert.equal(resPng.data.ext, "png");
  }

  // Valid WebP
  const webpBuf = Buffer.concat([
    Buffer.from("RIFF", "ascii"),
    Buffer.from([0x20, 0x00, 0x00, 0x00]),
    Buffer.from("WEBP", "ascii"),
  ]);
  const resWebp = validateDownloadedImage(webpBuf, "image/webp");
  assert.equal(resWebp.ok, true);
  if (resWebp.ok) {
    assert.equal(resWebp.data.mime, "image/webp");
    assert.equal(resWebp.data.ext, "webp");
  }

  // Valid AVIF
  const avifBuf = Buffer.concat([
    Buffer.from([0x00, 0x00, 0x00, 0x20]),
    Buffer.from("ftyp", "ascii"),
    Buffer.from("avif", "ascii"),
  ]);
  const resAvif = validateDownloadedImage(avifBuf, "image/avif");
  assert.equal(resAvif.ok, true);
  if (resAvif.ok) {
    assert.equal(resAvif.data.mime, "image/avif");
    assert.equal(resAvif.data.ext, "avif");
  }
});

test("Image Validation: Inferred MIME from magic bytes when Content-Type is generic or missing", () => {
  const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  const resInferred = validateDownloadedImage(pngBuf, "application/octet-stream");
  assert.equal(resInferred.ok, true);
  if (resInferred.ok) {
    assert.equal(resInferred.data.mime, "image/png");
  }

  const resNoMime = validateDownloadedImage(pngBuf, null);
  assert.equal(resNoMime.ok, true);
  if (resNoMime.ok) {
    assert.equal(resNoMime.data.mime, "image/png");
  }
});

test("Image Validation: Disguised payloads and signature mismatches are rejected", () => {
  // HTML masquerading as image
  const htmlBuf = Buffer.from("<!DOCTYPE html><html><body>malicious payload</body></html>");
  const resHtml = validateDownloadedImage(htmlBuf, "image/jpeg");
  assert.equal(resHtml.ok, false);

  // JPEG declared but PNG bytes provided
  const pngBuf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const resMismatch = validateDownloadedImage(pngBuf, "image/jpeg");
  assert.equal(resMismatch.ok, false);
});

test("Image Validation: Empty and oversized payloads are rejected", () => {
  const emptyBuf = Buffer.alloc(0);
  const resEmpty = validateDownloadedImage(emptyBuf, "image/jpeg");
  assert.equal(resEmpty.ok, false);

  const oversizedBuf = Buffer.alloc(MAX_IMAGE_BYTES + 1024);
  const resOversized = validateDownloadedImage(oversizedBuf, "image/jpeg");
  assert.equal(resOversized.ok, false);
  if (!resOversized.ok) {
    assert.match(resOversized.reason, /maximum allowed size/i);
  }
});

test("Blob Path Generation: Generates deterministic, sanitized path", () => {
  const path = generateMigratedBlobPath("6a95bae31236f0b17f6f7117", "e3b0c44298fc1c149afbf4c8", "jpg");
  assert.equal(path, "products/migrated/6a95bae31236f0b17f6f7117-e3b0c44298fc.jpg");

  // Path with non-alphanumeric ID and extension
  const cleanPath = generateMigratedBlobPath("prod/bad/id!", "abcdef123456789", ".PNG");
  assert.equal(cleanPath, "products/migrated/prodbadid-abcdef123456.png");
});

test("Image Classification: Distinguishes all source categories accurately", () => {
  assert.equal(
    classifyProductImage("https://neomeditech.com.np/wp-content/uploads/2026/03/sample.jpg").type,
    "wordpress"
  );
  assert.equal(
    classifyProductImage("https://store-id.public.blob.vercel-storage.com/products/migrated/p1.webp").type,
    "blob"
  );
  assert.equal(classifyProductImage("/products/img_1788197603402.png").type, "local_static");
  assert.equal(classifyProductImage("/shop/ultrasound-probes.png").type, "local_static");
  assert.equal(classifyProductImage("https://placehold.co/600x600/F5F8FC/1a365d").type, "placeholder");
  assert.equal(classifyProductImage("").type, "missing");
  assert.equal(classifyProductImage(null).type, "missing");
  assert.equal(classifyProductImage("https://external-unknown.com/image.jpg").type, "unrecognized");
});

test("Migration Planning: Deduplication groups products sharing the same image", () => {
  const mockProducts = [
    { id: "1", name: "Product A", image: "https://neomeditech.com.np/wp-content/uploads/shared.jpg" },
    { id: "2", name: "Product B", image: "https://neomeditech.com.np/wp-content/uploads/shared.jpg" },
    { id: "3", name: "Product C", image: "https://neomeditech.com.np/wp-content/uploads/unique.jpg" },
    { id: "4", name: "Product D", image: "https://store.public.blob.vercel-storage.com/products/migrated/p4.jpg" },
    { id: "5", name: "Product E", image: "/products/img_test.png" },
    { id: "6", name: "Product F", image: "https://placehold.co/100x100" },
    { id: "7", name: "Product G", image: "" },
  ];

  const plan = planProductImageMigration(mockProducts);

  assert.equal(plan.summary.totalProducts, 7);
  assert.equal(plan.summary.pendingWordPressMigration, 3);
  assert.equal(plan.summary.uniqueWordPressUrls, 2); // shared.jpg and unique.jpg
  assert.equal(plan.summary.alreadyBlob, 1);
  assert.equal(plan.summary.localStatic, 1);
  assert.equal(plan.summary.placeholder, 1);
  assert.equal(plan.summary.missingOrEmpty, 1);

  // Verify deduplication mapping
  const sharedKey = "https://neomeditech.com.np/wp-content/uploads/shared.jpg";
  assert.deepEqual(plan.urlToProductIds[sharedKey], ["1", "2"]);
});

test("Rollback Map Builder: Constructs clean rollback mappings from migration records", () => {
  const applied = [
    { productId: "p1", originalImage: "https://neomeditech.com.np/wp-content/uploads/1.jpg", newBlobUrl: "https://blob/1.jpg" },
    { productId: "p2", originalImage: "https://neomeditech.com.np/wp-content/uploads/2.jpg", newBlobUrl: "https://blob/2.jpg" },
  ];

  const rollback = buildRollbackMap(applied);
  assert.equal(rollback.length, 2);
  assert.deepEqual(rollback[0], {
    productId: "p1",
    originalImage: "https://neomeditech.com.np/wp-content/uploads/1.jpg",
  });
});
