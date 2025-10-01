import { NextRequest, NextResponse } from "next/server";

// Protect all routes except auth pages and auth API.
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/api/auth")) return NextResponse.next();
  if (
    pathname.startsWith("/log-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/(auth)") ||
    pathname.startsWith("/")
  ) {
    return NextResponse.next();
  }
  try {
    const res = await fetch(new URL("/api/auth/session", req.nextUrl), {
      headers: { cookie: req.headers.get("cookie") ?? "" },
      cache: "no-store",
      redirect: "manual",
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data?.session) return NextResponse.next();
    }
  } catch {}
  const url = req.nextUrl.clone();
  url.pathname = "/log-in";
  url.searchParams.set(
    "callbackURL",
    req.nextUrl.pathname + req.nextUrl.search
  );
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
