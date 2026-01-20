// app/middleware.js
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function proxy(req) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;

  // Skip middleware for Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Only protect /dashboard (you can add more protected routes)
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Not logged in → redirect to /login
    if (!token) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  // If logged-in user goes to /login or /sign-up → redirect to /dashboard
  if (pathname === "/login" || pathname === "/sign-up") {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (token) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Only run middleware for all pages except _next and API routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
