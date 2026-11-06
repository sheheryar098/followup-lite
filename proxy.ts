import { NextResponse, type NextRequest } from "next/server";
import { isAuthEnabled, SESSION_COOKIE, sessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  const withPath = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/digest")) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get("authorization");
    if (secret && auth === `Bearer ${secret}`) return withPath;
    if (!isAuthEnabled()) return withPath;
  }

  if (!isAuthEnabled()) return withPath;
  if (pathname === "/login") return withPath;

  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  if (cookie === (await sessionToken())) return withPath;

  const login = new URL("/login", request.url);
  login.searchParams.set("from", pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|csv)$).*)",
  ],
};
