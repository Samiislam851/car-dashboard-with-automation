import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE_NAME, verifyAccessToken } from "@/lib/auth";

const AUTH_PAGES = ["/login", "/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  const user = token ? verifyAccessToken(token) : null;
  const isAdmin = user?.role === "admin";

  // Signed-in visitors have no reason to see the login / register forms.
  if (AUTH_PAGES.includes(pathname)) {
    return user ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }

  if (isAdmin) {
    return NextResponse.next();
  }

  // Admin APIs answer with JSON rather than bouncing the caller to a page.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Signed in but not an admin → home. Not signed in at all → log in first.
  return NextResponse.redirect(new URL(user ? "/" : "/login", request.url));
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*", "/login", "/register"],
};
