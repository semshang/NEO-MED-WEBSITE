import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Basic in-memory rate limiting map
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 30; // max requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window

function applyRateLimit(req: NextRequest): NextResponse | null {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const now = Date.now();
  
  const windowData = rateLimitMap.get(ip);
  if (!windowData) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return null;
  }
  
  if (now - windowData.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return null;
  }
  
  if (windowData.count >= RATE_LIMIT) {
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

export default async function proxy(req: NextRequest) {
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
  // Match all request paths except api (handled explicitly), _next/static, _next/image, favicon.ico
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
