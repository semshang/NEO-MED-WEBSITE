import assert from "node:assert/strict";
import test from "node:test";
import {
  hasOnlyKeys,
  isAcceptablePassword,
  safePublicImagePath,
  safeRedirectPath,
  validOrderNumber,
} from "../src/lib/security-validation.ts";

test("safe redirects stay on the application origin", () => {
  assert.equal(safeRedirectPath("/account?tab=orders"), "/account?tab=orders");
  assert.equal(safeRedirectPath("https://evil.example"), "/account");
  assert.equal(safeRedirectPath("//evil.example"), "/account");
  assert.equal(safeRedirectPath("/\\evil.example"), "/account");
  assert.equal(safeRedirectPath("/%2f%2fevil.example"), "/account");
  assert.equal(safeRedirectPath("/%5cevil.example"), "/account");
});

test("public image paths are restricted to safe local files and approved HTTPS hosts", () => {
  assert.equal(safePublicImagePath("/products/monitor.webp"), "/products/monitor.webp");
  assert.equal(
    safePublicImagePath("https://neomeditech.com.np/wp-content/uploads/2026/monitor.jpg"),
    "https://neomeditech.com.np/wp-content/uploads/2026/monitor.jpg",
  );
  assert.equal(safePublicImagePath("https://placehold.co/600x400.png"), "https://placehold.co/600x400.png");
  assert.equal(safePublicImagePath("javascript:alert(1)"), "");
  assert.equal(safePublicImagePath("http://placehold.co/600x400.png"), "");
  assert.equal(safePublicImagePath("https://evil.example/monitor.png"), "");
  assert.equal(safePublicImagePath("/products/../secret.png"), "");
  assert.equal(safePublicImagePath("/products/payload.svg"), "");
});

test("password policy enforces bounded input", () => {
  assert.equal(isAcceptablePassword("short"), false);
  assert.equal(isAcceptablePassword("a".repeat(12)), true);
  assert.equal(isAcceptablePassword("a".repeat(128)), true);
  assert.equal(isAcceptablePassword("a".repeat(129)), false);
});

test("object allowlists reject mass-assignment fields", () => {
  assert.equal(hasOnlyKeys({ name: "A", email: "a@example.com" }, ["name", "email"]), true);
  assert.equal(hasOnlyKeys({ name: "A", role: "admin" }, ["name", "email"]), false);
  assert.equal(hasOnlyKeys({ email: "a@example.com", $where: "sleep(1000)" }, ["email"]), false);
});

test("order numbers use the generated identifier format", () => {
  assert.equal(validOrderNumber("ORD-ABC12345"), "ORD-ABC12345");
  assert.equal(validOrderNumber({ $ne: null }), "");
  assert.equal(validOrderNumber("ORD-../../etc"), "");
  assert.equal(validOrderNumber("not-an-order"), "");
});
