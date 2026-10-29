export function getVerificationRedirectOrigin(request: Request): URL | null {
  const configuredUrl = process.env.NEXTAUTH_URL?.trim();
  if (!configuredUrl) return process.env.NODE_ENV === "production" ? null : new URL(request.url);

  try {
    const baseUrl = new URL(configuredUrl);
    if (baseUrl.username || baseUrl.password || baseUrl.port || baseUrl.pathname !== "/" || baseUrl.search || baseUrl.hash) return null;

    const expectedUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://neomeditech.com.np");
    const previewHost = process.env.VERCEL_ENV === "preview" && baseUrl.hostname.endsWith(".vercel.app");
    if (process.env.NODE_ENV === "production" && (baseUrl.protocol !== "https:" || (!previewHost && baseUrl.host !== expectedUrl.host))) {
      return null;
    }

    return baseUrl;
  } catch {
    return null;
  }
}
