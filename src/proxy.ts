import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

type RateLimitEntry = { count: number; resetAt: number };

// Cheap per-instance protection. Sensitive writes also use MongoDB-backed limits in their route handlers.
const generalRateLimit = new Map<string, RateLimitEntry>();
const authRateLimit = new Map<string, RateLimitEntry>();

function clientIp(request: NextRequest) {
  const vercelIp = request.headers.get("x-vercel-ip")?.trim();
  if (vercelIp) return vercelIp.slice(0, 128);

  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 128);

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    const candidate = parts[parts.length - 1];
    if (candidate) return candidate.slice(0, 128);
  }

  return "unknown";
}

function pruneExpired(records: Map<string, RateLimitEntry>, now: number) {
  if (records.size < 10_000) return;
  for (const [key, entry] of records) {
    if (now >= entry.resetAt) records.delete(key);
  }
  while (records.size >= 10_000) {
    const oldestKey = records.keys().next().value;
    if (oldestKey === undefined) break;
    records.delete(oldestKey);
  }
}

function applyRateLimit(request: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV === "development") return null;

  const authRequest = request.nextUrl.pathname.startsWith("/api/auth");
  const limit = authRequest ? 20 : 120;
  const windowMs = 60_000;
  const records = authRequest ? authRateLimit : generalRateLimit;
  const key = clientIp(request).slice(0, 128);
  const now = Date.now();
  pruneExpired(records, now);
  const current = records.get(key);

  if (!current || now >= current.resetAt) {
    records.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    return NextResponse.json(
      { message: "Too many requests. Please try again shortly." },
      {
        status: 429,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": Math.ceil((current.resetAt - now) / 1000).toString(),
        },
      },
    );
  }

  current.count += 1;
  return null;
}

function isApiAdminRoute(pathname: string) {
  return pathname.startsWith("/api/admin") || pathname === "/api/settings" || pathname.startsWith("/api/settings/");
}

function isApiAccountRoute(pathname: string) {
  return pathname.startsWith("/api/account");
}

function protectedPageRoute(pathname: string) {
  return /^\/(admin|account)(?:\/|$)/.test(pathname);
}

export default async function proxy(request: NextRequest) {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { pathname, search } = request.nextUrl;

  if (isApiAdminRoute(pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    if (token.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    return response;
  }

  if (isApiAccountRoute(pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
    }
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    return response;
  }

  if (pathname.startsWith("/api") || !protectedPageRoute(pathname)) return NextResponse.next();

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    return NextResponse.redirect(new URL(`/?login=true&callbackUrl=${callbackUrl}`, request.url));
  }

  if (pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/?error=unauthorized", request.url));
  }

  if (pathname.startsWith("/account") && token.role === "admin") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};
