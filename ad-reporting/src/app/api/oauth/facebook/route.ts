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

    const appId = process.env.FACEBOOK_APP_ID;
    if (!appId) {
      return NextResponse.json(
        { error: "Facebook App ID not configured" },
        { status: 500 }
      );
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/facebook/callback`;
    const state = Buffer.from(JSON.stringify({ clientId })).toString("base64");

    const scopes = [
      "ads_read",
      "ads_management",
      "read_insights",
      "business_management",
    ].join(",");

    const authUrl =
      `https://www.facebook.com/v21.0/dialog/oauth?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=${scopes}` +
      `&state=${state}` +
      `&response_type=code`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
