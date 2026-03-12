import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  console.log("[Token] API endpoint hit");

  try {
    console.log("[Token] Starting token generation...");
    const secret = process.env.SSO_SECRET;

    console.log("[Token] Secret exists:", !!secret);

    if (!secret) {
      console.error("[Token] SSO_SECRET is not configured");
      return NextResponse.json(
        { error: "SSO_SECRET is not configured" },
        { status: 500 }
      );
    }

    console.log("[Token] Encoding secret key...");
    const secretKey = new TextEncoder().encode(secret);

    console.log("[Token] Creating JWT...");
    const token = await new SignJWT({
      user_id: "demo_user_001",
      email: "demo@heymax.com",
      name: "Test User",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(secretKey);

    console.log("[Token] Token generated successfully, length:", token.length);
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error("[Token] Generation error:", error);
    console.error("[Token] Error details:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Failed to generate token", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
