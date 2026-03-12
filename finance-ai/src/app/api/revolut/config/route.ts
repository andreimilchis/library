import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const clientId = process.env.REVOLUT_CLIENT_ID;
  const redirectUri = process.env.REVOLUT_REDIRECT_URI;
  const privateKey = process.env.REVOLUT_PRIVATE_KEY;
  const useSandbox = process.env.REVOLUT_USE_SANDBOX === "true";

  // Check for active connection
  let hasActiveConnection = false;
  try {
    const connection = await prisma.revolutConnection.findFirst({
      where: { isActive: true },
    });
    hasActiveConnection = !!connection;
  } catch {
    // DB might not be ready
  }

  return NextResponse.json({
    configured: !!(clientId && redirectUri && privateKey),
    envVars: {
      REVOLUT_CLIENT_ID: !!clientId,
      REVOLUT_REDIRECT_URI: !!redirectUri,
      REVOLUT_PRIVATE_KEY: !!privateKey,
      REVOLUT_USE_SANDBOX: process.env.REVOLUT_USE_SANDBOX || "not set",
    },
    // Show partial client_id for debugging (first 8 chars)
    clientIdPreview: clientId ? clientId.slice(0, 8) + "..." : "empty",
    redirectUri: redirectUri || "empty",
    useSandbox,
    hasActiveConnection,
  });
}
