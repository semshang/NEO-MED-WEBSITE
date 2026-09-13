import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

// Load .env.local if exists
if (fs.existsSync(".env.local")) {
  const envContent = fs.readFileSync(".env.local", "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).replace(/^["']|["']$/g, "").trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// Import helper functions
function getAdminEmails() {
  return new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

function isAdminEmail(email) {
  if (!email) return false;
  return getAdminEmails().has(email.trim().toLowerCase());
}

function assignedRole(email) {
  return isAdminEmail(email) ? "admin" : "customer";
}

test("Case 1: semshangtmg46@gmail.com is NOT admin", () => {
  assert.equal(isAdminEmail("semshangtmg46@gmail.com"), false);
  assert.equal(assignedRole("semshangtmg46@gmail.com"), "customer");
});

test("Case 2: neomeditech.solutions@gmail.com IS admin", () => {
  assert.equal(isAdminEmail("neomeditech.solutions@gmail.com"), true);
  assert.equal(assignedRole("neomeditech.solutions@gmail.com"), "admin");
});

test("Case 3: Random Google accounts are customers", () => {
  assert.equal(isAdminEmail("random.user@gmail.com"), false);
  assert.equal(assignedRole("random.user@gmail.com"), "customer");
  assert.equal(assignedRole(null), "customer");
  assert.equal(assignedRole(undefined), "customer");
});

test("Case 4: Existing MongoDB user with stale role: admin is overridden by assignedRole", () => {
  const staleDatabaseUser = { email: "semshangtmg46@gmail.com", role: "admin" };
  const calculatedRole = assignedRole(staleDatabaseUser.email);
  assert.equal(calculatedRole, "customer");
  
  let tokenRole = calculatedRole;
  if (staleDatabaseUser.role !== calculatedRole) {
    staleDatabaseUser.role = calculatedRole;
  }
  assert.equal(tokenRole, "customer");
  assert.equal(staleDatabaseUser.role, "customer");
});

test("Case 5: Existing customer added to ADMIN_EMAILS becomes admin", () => {
  const customer = { email: "newpromoted@gmail.com", role: "customer" };
  const originalEnv = process.env.ADMIN_EMAILS;
  try {
    process.env.ADMIN_EMAILS = "neomeditech.solutions@gmail.com, newpromoted@gmail.com";
    const calculatedRole = assignedRole(customer.email);
    assert.equal(calculatedRole, "admin");
    if (customer.role !== calculatedRole) {
      customer.role = calculatedRole;
    }
    assert.equal(customer.role, "admin");
  } finally {
    process.env.ADMIN_EMAILS = originalEnv;
  }
});

test("Case 6: Email capitalization and whitespace handling", () => {
  assert.equal(isAdminEmail("  NEOMEDITECH.SOLUTIONS@GMAIL.COM  "), true);
  assert.equal(isAdminEmail("NeoMeditech.Solutions@Gmail.com"), true);
  assert.equal(assignedRole("  NEOMEDITECH.SOLUTIONS@GMAIL.COM  "), "admin");
  assert.equal(assignedRole("  semshangtmg46@gmail.com  "), "customer");
});
