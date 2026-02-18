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

    const appId = process.env.TIKTOK_APP_ID;
    if (!appId) {
      return NextResponse.json(
        { error: "TikTok App ID not configured" },
        { status: 500 }
      );
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/tiktok/callback`;
    const state = Buffer.from(JSON.stringify({ clientId })).toString("base64");

    const authUrl =
      `https://business-api.tiktok.com/portal/auth?` +
      `app_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
