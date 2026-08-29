import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Strict protection for admin routes
    if (path.startsWith("/admin")) {
      if (token?.role !== "admin") {
        return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
      }
    }
    
    // Other routes in matcher (/account, /checkout) just need any valid session,
    // which is already guaranteed by the `authorized` callback below returning true for any token.
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

// Matcher defines which routes are protected by the middleware
export const config = {
  matcher: [
    "/admin/:path*", 
    "/account/:path*", 
    "/checkout/:path*"
  ],
};
