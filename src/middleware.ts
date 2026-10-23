import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  // Protegge /dashboard richiedendo l'autenticazione (o l'accesso 1-Click su ambiente Demo)
  if (pathname.startsWith("/dashboard") && sessionCookie !== "authenticated_admin") {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();

  // Security Headers & supporto iframe per la vetrina interattiva su taaaac.eu/demo
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Content-Security-Policy",
    "frame-ancestors 'self' https://taaaac.eu https://*.taaaac.eu https://*.vercel.app http://localhost:*;"
  );
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
