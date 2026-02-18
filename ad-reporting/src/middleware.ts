import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session-token")?.value;

  // Public routes
  const publicPaths = ["/", "/auth/login", "/auth/register", "/api/auth"];
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  // API routes that don't need auth check in middleware
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated and trying to access dashboard
  if (pathname.startsWith("/dashboard") && !sessionToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect to dashboard if authenticated and trying to access auth pages
  if (
    (pathname.startsWith("/auth/") || pathname === "/") &&
    sessionToken
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
