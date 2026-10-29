import assert from "node:assert/strict";
import fs from "node:fs";
import { mock, test } from "node:test";
import { NextResponse } from "next/server.js";

import { register } from "node:module";
register(
  "data:text/javascript," + encodeURIComponent(`
    import { pathToFileURL } from "node:url";
    const root = pathToFileURL(process.cwd() + "/").href;
    export async function resolve(specifier, context, nextResolve) {
      if (specifier === "next/server") return { shortCircuit: true, url: new URL("node_modules/next/server.js", root).href };
      if (specifier.startsWith("@/")) return { shortCircuit: true, url: new URL("src/" + specifier.slice(2) + ".ts", root).href };
      return nextResolve(specifier, context);
    }
  `),
  import.meta.url,
);

mock.module("next/server", { namedExports: { NextResponse } });

const contactState = {
  session: null,
  admin: false,
  originError: null,
  limiter: null,
  limiterError: null,
  findCalls: 0,
  saved: 0,
  events: [],
  message: { unread: true, save: async () => { contactState.saved += 1; } },
};
const verificationState = { active: false, origin: null, user: null, logged: 0 };

mock.module("@/lib/api-auth", {
  namedExports: { getApiSession: async () => contactState.session },
});
mock.module("@/lib/auth", {
  namedExports: { isAdmin: () => contactState.admin },
});
mock.module("@/lib/mongoose", {
  defaultExport: async () => undefined,
});
mock.module("@/lib/store", {
  namedExports: { serializeMessage: (message) => ({ unread: message.unread }) },
});
mock.module("@/lib/request-security", {
  namedExports: {
    enforceRateLimit: async (...args) => {
      if (verificationState.active) return null;
      contactState.events.push("limit");
      if (contactState.limiterError) throw contactState.limiterError;
      return contactState.limiter;
    },
    requireSameOrigin: () => contactState.originError,
    readJsonObject: async () => ({ ok: true, data: { unread: false } }),
    privateJson: (data, init) => NextResponse.json(data, init),
  },
});
mock.module("@/lib/security-validation", {
  namedExports: { hasOnlyKeys: () => true },
});
mock.module("@/models/ContactMessage", {
  defaultExport: {
    findById: async () => {
      contactState.findCalls += 1;
      return contactState.message;
    },
  },
});
mock.module("mongoose", {
  namedExports: { isObjectIdOrHexString: () => true },
});

const { PATCH: patchContact } = await import("../src/app/api/contact/[id]/route.ts");

function resetContact() {
  contactState.session = null;
  contactState.admin = false;
  contactState.originError = null;
  contactState.limiter = null;
  contactState.limiterError = null;
  contactState.findCalls = 0;
  contactState.saved = 0;
  contactState.events = [];
}

function contactRequest() {
  return new Request("https://neomeditech.com.np/api/contact/message-1", {
    method: "PATCH",
    headers: { origin: "https://neomeditech.com.np", "content-type": "application/json" },
    body: JSON.stringify({ unread: false }),
  });
}

test("contact PATCH rejects unauthenticated and non-admin callers before limiting or mutation", async () => {
  resetContact();
  let response = await patchContact(contactRequest(), { params: Promise.resolve({ id: "message-1" }) });
  assert.equal(response.status, 403);
  assert.deepEqual(contactState.events, []);
  assert.equal(contactState.findCalls, 0);

  resetContact();
  contactState.session = { user: { email: "user@example.com" } };
  response = await patchContact(contactRequest(), { params: Promise.resolve({ id: "message-1" }) });
  assert.equal(response.status, 403);
  assert.deepEqual(contactState.events, []);
  assert.equal(contactState.findCalls, 0);
});

test("contact PATCH rejects same-origin failures before authentication and mutation", async () => {
  resetContact();
  contactState.originError = NextResponse.json({ message: "Forbidden" }, { status: 403 });
  contactState.session = { user: { email: "admin@example.com" } };
  contactState.admin = true;

  const response = await patchContact(contactRequest(), { params: Promise.resolve({ id: "message-1" }) });
  assert.equal(response.status, 403);
  assert.deepEqual(contactState.events, []);
  assert.equal(contactState.findCalls, 0);
});

test("contact PATCH returns limiter denial and does not mutate", async () => {
  resetContact();
  contactState.session = { user: { email: "admin@example.com" } };
  contactState.admin = true;
  contactState.limiter = NextResponse.json({ message: "Too many requests" }, { status: 429 });

  const response = await patchContact(contactRequest(), { params: Promise.resolve({ id: "message-1" }) });
  assert.equal(response.status, 429);
  assert.deepEqual(contactState.events, ["limit"]);
  assert.equal(contactState.findCalls, 0);
  assert.equal(contactState.saved, 0);
});

test("contact PATCH propagates limiter storage failure before mutation", async () => {
  resetContact();
  contactState.session = { user: { email: "admin@example.com" } };
  contactState.admin = true;
  contactState.limiterError = new Error("limiter unavailable");

  await assert.rejects(
    patchContact(contactRequest(), { params: Promise.resolve({ id: "message-1" }) }),
    /limiter unavailable/,
  );
  assert.deepEqual(contactState.events, ["limit"]);
  assert.equal(contactState.findCalls, 0);
  assert.equal(contactState.saved, 0);
});

test("valid admin contact PATCH limits before mutation and preserves response shape", async () => {
  resetContact();
  contactState.session = { user: { email: "admin@example.com" } };
  contactState.admin = true;

  const response = await patchContact(contactRequest(), { params: Promise.resolve({ id: "message-1" }) });
  assert.equal(response.status, 200);
  assert.deepEqual(contactState.events, ["limit"]);
  assert.equal(contactState.findCalls, 1);
  assert.equal(contactState.saved, 1);
  assert.deepEqual(await response.json(), { unread: false });
});

mock.module("@/lib/validation", {
  namedExports: { emailValue: (value) => (typeof value === "string" && value.includes("@") ? value : "") },
});
mock.module("@/lib/security-log", {
  namedExports: {
    logSecurityEvent: () => { verificationState.logged += 1; },
    logServerError: () => undefined,
  },
});
mock.module("@/lib/auth-origin", {
  namedExports: { getVerificationRedirectOrigin: () => verificationState.origin },
});
mock.module("@/models/User", {
  defaultExport: {
    findOneAndUpdate: async () => verificationState.user,
  },
});

const { GET: verifyEmail } = await import("../src/app/api/auth/verify-email/route.ts");

function verificationRequest(query = "") {
  return new Request(`https://evil.example/api/auth/verify-email${query}`, { headers: { host: "evil.example" } });
}

test("verification route returns generic 503 when canonical origin is unavailable", async () => {
  verificationState.active = true;
  verificationState.origin = null;
  verificationState.user = null;
  const response = await verifyEmail(verificationRequest("?token=invalid"));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).message, "Email verification is temporarily unavailable.");
  assert.equal(response.headers.get("location"), null);
});

test("verification route preserves invalid redirect flow without exposing configuration", async () => {
  verificationState.active = true;
  verificationState.origin = new URL("https://neomeditech.com.np");
  verificationState.user = null;
  const response = await verifyEmail(verificationRequest("?token=invalid"));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "https://neomeditech.com.np/?login=true&verification=invalid");
  assert.equal((await response.text()).includes("NEXTAUTH_URL"), false);
});

test("verification route produces the valid success redirect through the actual handler", async () => {
  verificationState.active = true;
  verificationState.origin = new URL("https://neomeditech.com.np");
  verificationState.user = { email: "customer@example.com" };
  const token = "a".repeat(64);
  const response = await verifyEmail(verificationRequest(`?token=${token}&email=customer%40example.com`));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "https://neomeditech.com.np/?login=true&verification=verified");
  assert.equal(verificationState.logged, 1);
});


import { getClientAddress } from "../src/lib/client-ip.ts";
import { getVerificationRedirectOrigin } from "../src/lib/auth-origin.ts";
import { getSecurityLogKey } from "../src/lib/security-log-config.ts";

const originalEnv = {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
};

function setEnv(values) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

test.after(() => setEnv(originalEnv));

test("client identity ignores undocumented and untrusted headers", () => {
  setEnv({ VERCEL: undefined });
  const request = new Request("https://neomeditech.com.np/api/test", {
    headers: {
      "x-vercel-ip": "198.51.100.10",
      "x-real-ip": "198.51.100.11",
      "x-forwarded-for": "198.51.100.12",
    },
  });
  assert.equal(getClientAddress(request), "unknown");
});

test("Vercel identity accepts valid IPv4 and IPv6 values and rejects malformed input", () => {
  setEnv({ VERCEL: "1" });
  const address = (value, extraHeaders = {}) =>
    getClientAddress(new Request("https://neomeditech.com.np", {
      headers: { ...extraHeaders, ...(value === undefined ? {} : { "x-forwarded-for": value }) },
    }));

  assert.equal(address("198.51.100.12"), "198.51.100.12");
  assert.equal(address("2001:db8::1"), "2001:db8::1");
  for (const value of [undefined, "", "   ", "not-an-ip", "198.51.100.12garbage", "2001:db8::1garbage", "198.51.100.12, 203.0.113.8", "x".repeat(129)]) {
    assert.equal(address(value), "unknown", `expected rejected address for ${value}`);
  }
  assert.equal(address(undefined, { "x-real-ip": "198.51.100.13" }), "unknown");
  assert.equal(address(undefined, { "x-vercel-ip": "198.51.100.14" }), "unknown");
});

test("verification origin fails closed in production", () => {
  setEnv({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://neomeditech.com.np", VERCEL_ENV: undefined });
  const request = new Request("https://evil.example/api/auth/verify-email");

  for (const value of [undefined, "not-a-url", "http://neomeditech.com.np", "https://evil.example"]) {
    setEnv({ NEXTAUTH_URL: value });
    assert.equal(getVerificationRedirectOrigin(request), null, `expected invalid origin for ${value}`);
  }

  setEnv({ NEXTAUTH_URL: "https://neomeditech.com.np" });
  assert.equal(getVerificationRedirectOrigin(request)?.origin, "https://neomeditech.com.np");
});

test("security logs require a production secret and keep development fallback explicit", () => {
  setEnv({ NODE_ENV: "production", NEXTAUTH_SECRET: undefined });
  assert.throws(() => getSecurityLogKey(), /NEXTAUTH_SECRET is required/);

  setEnv({ NEXTAUTH_SECRET: "test-only-secret" });
  assert.equal(getSecurityLogKey(), "test-only-secret");

  setEnv({ NODE_ENV: "development", NEXTAUTH_SECRET: undefined });
  assert.equal(getSecurityLogKey(), "development-only-security-log-key");
});

test("contact mutations use the existing authenticated MongoDB limiter", () => {
  const source = fs.readFileSync("src/app/api/contact/[id]/route.ts", "utf8");
  assert.match(source, /enforceRateLimit/);
  assert.match(source, /admin-contact-update/);
  assert.match(source, /session\.user\.email/);
  assert.match(source, /isAdmin\(session\)/);
  assert.match(source, /status: 403/);
  assert.ok(source.indexOf("if (!session?.user?.email || !isAdmin(session))") < source.indexOf('const rateLimit = await enforceRateLimit'));
});

test("rate-limit denial and storage-error paths remain fail closed", () => {
  const requestSecurity = fs.readFileSync("src/lib/request-security.ts", "utf8");
  const rateLimit = fs.readFileSync("src/lib/rate-limit.ts", "utf8");
  assert.match(requestSecurity, /status: 429/);
  assert.match(requestSecurity, /Retry-After/);
  assert.match(rateLimit, /if \(!\(typeof error === \"object\"/);
  assert.match(rateLimit, /throw error/);
});
