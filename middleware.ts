import { NextRequest, NextResponse } from "next/server";

// Decode base64url JWT payload safely in Edge runtime
function decodeJwtPayload(token: string): { exp?: number; roles?: string[]; userId?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Public API endpoints that don't require authentication
const PUBLIC_API_PREFIXES = [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/verify-captcha",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, next internal paths, and images
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Read auth_token from cookies or authorization header
  const tokenCookie = request.cookies.get("auth_token")?.value;
  let token = tokenCookie;
  if (!token) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }
  }

  // Verify token expiry and structure
  let isAuthenticated = false;
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && (!payload.exp || payload.exp * 1000 > Date.now())) {
      isAuthenticated = true;
    }
  }

  // 3. Handling /login route
  if (pathname === "/login") {
    // If user is already authenticated, redirect them to the home dashboard
    if (isAuthenticated) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    // Allow unauthenticated users to access /login
    return NextResponse.next();
  }

  // 4. Handling API routes
  if (pathname.startsWith("/api/")) {
    const isPublicApi = PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (isPublicApi) {
      return NextResponse.next();
    }

    // Special case for /api/auth/me: let the route handler itself return 401 and clean up cookie
    if (pathname === "/api/auth/me") {
      return NextResponse.next();
    }

    // Protected API: if not authenticated, return 401 Unauthorized
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Phiên đăng nhập đã hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.",
        },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // 5. Handling all protected pages: /, /admin/*, /teacher/*, /student/*, /classes/*, /ranking, /profile, etc.
  if (!isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Store original destination to redirect after login if desired
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    
    const response = NextResponse.redirect(loginUrl);
    // If an invalid/expired token was present, purge the cookie
    if (tokenCookie) {
      response.cookies.set("auth_token", "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
