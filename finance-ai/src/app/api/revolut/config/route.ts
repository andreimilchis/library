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
    },
    useSandbox,
    hasActiveConnection,
  });
}
