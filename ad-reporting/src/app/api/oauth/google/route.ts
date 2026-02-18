import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "clientId required" }, { status: 400 });
    }

    const googleClientId = process.env.GOOGLE_ADS_CLIENT_ID;
    if (!googleClientId) {
      return NextResponse.json(
        { error: "Google Ads Client ID not configured" },
        { status: 500 }
      );
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/google/callback`;
    const state = Buffer.from(JSON.stringify({ clientId })).toString("base64");

    const scopes = [
      "https://www.googleapis.com/auth/adwords",
    ].join(" ");

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${googleClientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&state=${state}` +
      `&response_type=code` +
      `&access_type=offline` +
      `&prompt=consent`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
