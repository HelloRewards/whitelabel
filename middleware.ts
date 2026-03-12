import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const protectedRoutes = ["/restaurants", "/checkout"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    const session = request.cookies.get("hr_session");

    if (!session) {
      return NextResponse.redirect(
        new URL("/error?message=Session required", request.url)
      );
    }

    try {
      const sessionData = JSON.parse(session.value);

      if (!sessionData.user_id || !sessionData.email) {
        return NextResponse.redirect(
          new URL("/error?message=Invalid session", request.url)
        );
      }
    } catch (error) {
      return NextResponse.redirect(
        new URL("/error?message=Invalid session", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
