import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Basic in-memory rate limiting map
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const authRateLimitMap = new Map<string, { count: number; lastReset: number }>();

const RATE_LIMIT = 30; // max requests for general routes
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window

const AUTH_RATE_LIMIT = 5; // max requests for auth routes
const AUTH_RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window

function applyRateLimit(req: NextRequest): NextResponse | null {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const now = Date.now();
  const isAuthRoute = req.nextUrl.pathname.startsWith('/api/auth') || req.nextUrl.pathname.includes('login=true');
  
  const map = isAuthRoute ? authRateLimitMap : rateLimitMap;
  const limit = isAuthRoute ? AUTH_RATE_LIMIT : RATE_LIMIT;
  const window = isAuthRoute ? AUTH_RATE_LIMIT_WINDOW : RATE_LIMIT_WINDOW;

  const windowData = map.get(ip);
  if (!windowData) {
    map.set(ip, { count: 1, lastReset: now });
    return null;
  }
  
  if (now - windowData.lastReset > window) {
    map.set(ip, { count: 1, lastReset: now });
    return null;
  }
  
  if (windowData.count >= limit) {
    return new NextResponse(
      JSON.stringify({ error: "Too Many Requests. Please try again later." }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }
  
  windowData.count++;
  return null;
}

const intlMiddleware = createMiddleware(routing);

const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Strict protection for admin routes (including localized e.g. /en/admin)
    if (path.includes("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
      }
    }
    
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/?login=true",
    }
  }
);

export default async function middleware(req: NextRequest) {
  // Apply rate limit on all requests
  const rateLimitResponse = applyRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  const path = req.nextUrl.pathname;

  // Skip auth/intl for api routes
  if (path.startsWith("/api")) {
    return NextResponse.next();
  }

  // Define routes that require auth
  const isProtectedPath = path.includes("/admin") || path.includes("/account") || path.includes("/checkout");

  if (isProtectedPath) {
    return (authMiddleware as any)(req);
  } else {
    return intlMiddleware(req);
  }
}

export const config = {
  // Match all request paths except api, _next/static, _next/image, and static files (with dots)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
