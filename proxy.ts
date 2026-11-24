import { NextResponse, type NextRequest } from "next/server";
import {
  hasValidSessionFormat,
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/cookie";

const PUBLIC_EXACT_PATHS = new Set([
  "/offline",
  "/manifest.webmanifest",
  "/sw.js",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
]);

const PUBLIC_PREFIXES = ["/_next/", "/icon/", "/apple-icon/"];
const STATIC_FILE_PATTERN = /\.[^/]+$/;

function isPublicAssetOrRoute(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.has(pathname)) {
    return true;
  }
  if (pathname === "/icon" || pathname === "/apple-icon") {
    return true;
  }
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  return STATIC_FILE_PATTERN.test(pathname);
}

function hasValidSessionCookie(request: NextRequest): boolean {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) {
    return false;
  }
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) {
    return verifySessionToken(raw, secret) !== null;
  }
  return hasValidSessionFormat(raw);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Browser/tool probes (e.g. Chrome devtools' /.well-known/appspecific/*.json) have no page here.
  // Answer 404 directly so they never fall into the app's catch-all route.
  if (pathname.startsWith("/.well-known/")) {
    return new NextResponse(null, { status: 404 });
  }

  if (isPublicAssetOrRoute(pathname)) {
    return NextResponse.next();
  }

  const isAuthenticated = hasValidSessionCookie(request);

  if (pathname === "/login" || pathname.startsWith("/login/")) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sw\\.js|icon(?:/.*)?|apple-icon(?:/.*)?|robots\\.txt|sitemap\\.xml).*)",
  ],
};
