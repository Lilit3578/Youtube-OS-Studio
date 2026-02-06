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

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublic) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)",
  ],
};
