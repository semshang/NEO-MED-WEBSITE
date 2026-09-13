export const MAX_JSON_BODY_BYTES = 32 * 1024;
export const MAX_ORDER_ITEMS = 25;

export function hasOnlyKeys(value: Record<string, unknown>, allowedKeys: readonly string[]): boolean {
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every((key) => allowed.has(key));
}

export function isAcceptablePassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 12 && value.length <= 128 && value.trim().length > 0;
}

export function safePublicImagePath(value: unknown): string {
  if (typeof value !== "string") return "";
  const path = value.trim();
  if (!path || path.length > 512) return "";

  if (path.startsWith("/") && !path.startsWith("//")) {
    if (path.includes("\\") || path.includes("..") || path.includes("?") || path.includes("#") || path.includes("%")) return "";
    return /^\/[A-Za-z0-9/_-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(path) ? path : "";
  }

  try {
    const url = new URL(path);
    if (url.protocol !== "https:" || url.username || url.password || url.port || url.search || url.hash) return "";
    if (url.hostname === "neomeditech.com.np" && url.pathname.startsWith("/wp-content/uploads/")) return url.toString();
    if (url.hostname === "placehold.co" && /^\/[A-Za-z0-9/%?&=+_.:-]+$/.test(url.pathname)) return url.toString();
    if (
      url.hostname.endsWith(".public.blob.vercel-storage.com") &&
      /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i.test(url.hostname) &&
      /^\/[A-Za-z0-9/_-]+\.(?:avif|gif|jpe?g|png|webp)$/i.test(url.pathname)
    ) {
      return url.toString();
    }
  } catch {
    return "";
  }

  return "";
}

export function safeRedirectPath(value: string | null | undefined, fallback = "/account"): string {
  if (!value || value.length > 2048 || !value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\") || /[\u0000-\u001F\u007F]/.test(value) || /%(?:2f|5c)/i.test(value)) return fallback;

  try {
    const parsed = new URL(value, "https://navigation.invalid");
    if (parsed.origin !== "https://navigation.invalid") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function validOrderNumber(value: unknown): string {
  if (typeof value !== "string") return "";
  return /^ORD-[A-Z0-9]{6,32}$/.test(value) ? value : "";
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[character] ?? character);
}
