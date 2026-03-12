import { NextRequest, NextResponse } from "next/server";
import { RevolutClient } from "@/lib/revolut/client";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  try {
    const tokens = await RevolutClient.exchangeAuthorizationCode(code);

    // Deactivate existing connections
    await prisma.revolutConnection.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Save new connection
    await prisma.revolutConnection.create({
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenType: tokens.token_type,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        scope: "READ",
      },
    });

    return NextResponse.redirect(new URL("/settings?connected=true", request.url));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("OAuth callback error:", errorMessage);
    const errorUrl = new URL("/settings", request.url);
    errorUrl.searchParams.set("error", "oauth_failed");
    errorUrl.searchParams.set("details", errorMessage.slice(0, 200));
    return NextResponse.redirect(errorUrl);
  }
}
