import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(
          `/dashboard/clients?error=${encodeURIComponent(error)}`,
          request.url
        )
      );
    }

    if (!code || !stateParam) {
      return NextResponse.redirect(
        new URL("/dashboard/clients?error=missing_params", request.url)
      );
    }

    const state = JSON.parse(
      Buffer.from(stateParam, "base64").toString("utf-8")
    );
    const { clientId } = state;

    // Verify client
    const client = await prisma.client.findFirst({
      where: { id: clientId, agencyId: session.agencyId! },
    });

    if (!client) {
      return NextResponse.redirect(
        new URL("/dashboard/clients?error=client_not_found", request.url)
      );
    }

    // Exchange code for tokens
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/google/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      error?: string;
      error_description?: string;
    };

    if (tokenData.error) {
      return NextResponse.redirect(
        new URL(
          `/dashboard/clients/${clientId}?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}`,
          request.url
        )
      );
    }

    // Get accessible customer IDs using Google Ads API
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
    const customersResponse = await fetch(
      "https://googleads.googleapis.com/v18/customers:listAccessibleCustomers",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "developer-token": developerToken,
        },
      }
    );

    const customersData = (await customersResponse.json()) as {
      resourceNames?: string[];
      error?: { message: string };
    };

    let accountId = "unknown";
    let accountName = "Google Ads Account";

    if (customersData.resourceNames && customersData.resourceNames.length > 0) {
      // Extract customer ID from "customers/1234567890"
      accountId = customersData.resourceNames[0].replace("customers/", "");

      // Try to get customer name
      try {
        const customerResponse = await fetch(
          `https://googleads.googleapis.com/v18/customers/${accountId}`,
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
              "developer-token": developerToken,
            },
          }
        );
        const customerData = (await customerResponse.json()) as {
          descriptiveName?: string;
        };
        if (customerData.descriptiveName) {
          accountName = customerData.descriptiveName;
        }
      } catch {
        // Ignore - we'll use default name
      }
    }

    const tokenExpiresAt = new Date(
      Date.now() + tokenData.expires_in * 1000
    );

    await prisma.dataSource.upsert({
      where: {
        platform_accountId_clientId: {
          platform: "GOOGLE_ADS",
          accountId,
          clientId,
        },
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt,
        accountName,
        isActive: true,
        lastError: null,
      },
      create: {
        platform: "GOOGLE_ADS",
        accountId,
        accountName,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiresAt,
        clientId,
      },
    });

    return NextResponse.redirect(
      new URL(
        `/dashboard/clients/${clientId}?connected=google`,
        request.url
      )
    );
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/clients?error=oauth_failed", request.url)
    );
  }
}
