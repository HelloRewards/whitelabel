import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    console.log("[SSO] Starting authentication process");
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      console.error("[SSO] Missing token in request");
      return NextResponse.redirect(
        new URL("/error?message=Missing token", request.url)
      );
    }

    console.log("[SSO] Token received, verifying...");
    const secret = process.env.SSO_SECRET;

    if (!secret) {
      console.error("[SSO] SSO_SECRET is not configured");
      return NextResponse.redirect(
        new URL("/error?message=Configuration error", request.url)
      );
    }

    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    console.log("[SSO] Token verified successfully:", { user_id: payload.user_id, email: payload.email });

    if (!payload.user_id || !payload.email) {
      console.error("[SSO] Invalid token payload - missing user_id or email");
      return NextResponse.redirect(
        new URL("/error?message=Invalid token payload", request.url)
      );
    }

    const sessionData = JSON.stringify({
      user_id: payload.user_id,
      email: payload.email,
      authenticated_at: Date.now(),
    });

    console.log("[SSO] Creating session and redirecting to /restaurants");
    const response = NextResponse.redirect(new URL("/restaurants", request.url));

    response.cookies.set({
      name: "hr_session",
      value: sessionData,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[SSO] Verification error:", error);

    return NextResponse.redirect(
      new URL("/error?message=Authentication failed", request.url)
    );
  }
}
