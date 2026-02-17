import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Using getToken (JWT verification only) instead of auth() to avoid
// importing provider modules (e.g. nodemailer) that are incompatible
// with the Edge runtime.

const PUBLIC_ROUTES = [
  "/",
  "/api/auth", // NextAuth routes (signin, callback, csrf, etc.)
  "/privacy-policy",
  "/tos",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. ADD: Security Headers Helper
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublic) {
    return response;
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Validate callbackUrl is a safe relative path (no protocol-relative or absolute URLs)
    const safeCallback = pathname.startsWith("/") && !pathname.startsWith("//") ? pathname : "/";
    const loginUrl = new URL("/", req.url);
    loginUrl.searchParams.set("callbackUrl", safeCallback);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};

