import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

// Basic in-memory rate limiting map
// In production (Vercel/Edge), use Redis (e.g. @upstash/ratelimit) since this resets per instance.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
const RATE_LIMIT = 20; // max requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute window

function applyRateLimit(req: NextRequest): NextResponse | null {
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const now = Date.now();
  
  const windowData = rateLimitMap.get(ip);
  if (!windowData) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return null; // OK
  }
  
  if (now - windowData.lastReset > RATE_LIMIT_WINDOW) {
    // Reset window
    rateLimitMap.set(ip, { count: 1, lastReset: now });
    return null; // OK
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

const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Strict protection for admin routes
    if (path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
      }
    }
    
    // Other matched routes just need any valid session (guaranteed by authorized callback)
    return NextResponse.next();
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
  // 1. Apply rate limit on every matched request (API routes, login flows, etc.)
  const rateLimitResponse = applyRateLimit(req);
  if (rateLimitResponse) return rateLimitResponse;

  // 2. Delegate to next-auth middleware for session checking
  // We have to cast req to any to satisfy the withAuth typings which expect NextRequestWithAuth internally
  return (authMiddleware as any)(req);
}

// Matcher defines which routes are protected by the middleware
export const config = {
  matcher: [
    "/admin/:path*", 
    "/account/:path*", 
    "/checkout/:path*",
    "/api/:path*" // Also rate limit any backend API routes
  ],
};

