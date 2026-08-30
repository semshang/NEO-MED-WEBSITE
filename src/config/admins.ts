import "server-only";

/** Server-only administrator allow-list. Set ADMIN_EMAILS as comma-separated addresses. */
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);
