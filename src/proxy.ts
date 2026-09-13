import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

type RateLimitEntry = { count: number; resetAt: number };

// Cheap per-instance protection. Sensitive writes also use MongoDB-backed limits in their route handlers.
const generalRateLimit = new Map<string, RateLimitEntry>();
const authRateLimit = new Map<string, RateLimitEntry>();

function clientIp(request: NextRequest) {
  return request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
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

function protectedRoute(pathname: string) {
  return /^\/(admin|account)(?:\/|$)/.test(pathname);
}

export default async function proxy(request: NextRequest) {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/api") || !protectedRoute(pathname)) return NextResponse.next();

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
