import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

type RateLimitEntry = { count: number; resetAt: number };

const generalRateLimit = new Map<string, RateLimitEntry>();
const authRateLimit = new Map<string, RateLimitEntry>();
const intlProxy = createMiddleware(routing);

function clientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function applyRateLimit(request: NextRequest): NextResponse | null {
  const authRequest = request.nextUrl.pathname.startsWith("/api/auth");
  const limit = authRequest ? 5 : 60;
  const windowMs = 60_000;
  const records = authRequest ? authRateLimit : generalRateLimit;
  const key = clientIp(request);
  const now = Date.now();
  const current = records.get(key);

  if (!current || now >= current.resetAt) {
    records.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    return NextResponse.json(
      { message: "Too many requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": Math.ceil((current.resetAt - now) / 1000).toString() } }
    );
  }

  current.count += 1;
  return null;
}

function protectedRoute(pathname: string) {
  return /^\/(en|ne)\/(admin|account|checkout)(?:\/|$)/.test(pathname);
}

function pathLocale(pathname: string) {
  const locale = pathname.split("/")[1];
  return locale === "ne" ? "ne" : "en";
}

export default async function proxy(request: NextRequest) {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/api")) return NextResponse.next();
  if (!protectedRoute(pathname)) return intlProxy(request);

  const locale = pathLocale(pathname);
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(new URL(`/${locale}?login=true&callbackUrl=${callbackUrl}`, request.url));
  }

  if (pathname.includes("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL(`/${locale}?error=unauthorized`, request.url));
  }

  return intlProxy(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
