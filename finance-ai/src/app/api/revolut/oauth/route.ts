import { NextResponse } from "next/server";
import { RevolutClient } from "@/lib/revolut/client";

export async function GET() {
  const clientId = process.env.REVOLUT_CLIENT_ID;
  const redirectUri = process.env.REVOLUT_REDIRECT_URI;
  const privateKey = process.env.REVOLUT_PRIVATE_KEY;

  if (!clientId || !redirectUri || !privateKey) {
    return NextResponse.json(
      {
        error: "Revolut API not configured",
        details: {
          REVOLUT_CLIENT_ID: clientId ? "set" : "missing",
          REVOLUT_REDIRECT_URI: redirectUri ? "set" : "missing",
          REVOLUT_PRIVATE_KEY: privateKey ? "set" : "missing",
        },
      },
      { status: 500 }
    );
  }

  // Generate a random state parameter for CSRF protection
  const state = crypto.randomUUID();

  const url = RevolutClient.getAuthorizationUrl(state);
  const response = NextResponse.redirect(url);

  // Set cookie directly on the response to ensure it's included with the redirect
  response.cookies.set("revolut_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
