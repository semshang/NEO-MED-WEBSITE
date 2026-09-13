import "server-only";
import { createHmac } from "crypto";

type SafeDetails = Record<string, string | number | boolean | null | undefined>;

function pseudonymize(value: string) {
  const key = process.env.NEXTAUTH_SECRET ?? "development-only-security-log-key";
  return createHmac("sha256", key).update(value.toLowerCase()).digest("hex").slice(0, 20);
}

function sanitizeDetails(details: SafeDetails) {
  return Object.fromEntries(Object.entries(details).map(([key, value]) => {
    if (typeof value === "string" && /^(email|actor|customer)$/i.test(key)) {
      return [`${key}Hash`, pseudonymize(value)];
    }
    return [key, value];
  }));
}

export function logSecurityEvent(event: string, details: SafeDetails = {}) {
  console.info(JSON.stringify({ level: "security", event, at: new Date().toISOString(), ...sanitizeDetails(details) }));
}

export function logServerError(context: string, error: unknown) {
  const errorName = error instanceof Error ? error.name : "UnknownError";
  const developmentMessage = process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined;
  console.error(JSON.stringify({ level: "error", context, errorName, message: developmentMessage, at: new Date().toISOString() }));
}
