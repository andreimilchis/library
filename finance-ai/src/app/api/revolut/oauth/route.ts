import { NextResponse } from "next/server";
import { RevolutClient } from "@/lib/revolut/client";

export async function GET() {
  const clientId = process.env.REVOLUT_CLIENT_ID;
  const redirectUri = process.env.REVOLUT_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error: "Revolut API not configured",
        details: {
          REVOLUT_CLIENT_ID: clientId ? "set" : "missing",
          REVOLUT_REDIRECT_URI: redirectUri ? "set" : "missing",
          REVOLUT_PRIVATE_KEY: process.env.REVOLUT_PRIVATE_KEY ? "set" : "missing",
        },
      },
      { status: 500 }
    );
  }

  const url = RevolutClient.getAuthorizationUrl();
  return NextResponse.redirect(url);
}
