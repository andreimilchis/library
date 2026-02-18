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

    // Verify client belongs to agency
    const client = await prisma.client.findFirst({
      where: { id: clientId, agencyId: session.agencyId! },
    });

    if (!client) {
      return NextResponse.redirect(
        new URL("/dashboard/clients?error=client_not_found", request.url)
      );
    }

    // Exchange code for access token
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/facebook/callback`;
    const tokenUrl =
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `client_id=${process.env.FACEBOOK_APP_ID}` +
      `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&code=${code}`;

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      token_type: string;
      expires_in?: number;
      error?: { message: string };
    };

    if (tokenData.error) {
      return NextResponse.redirect(
        new URL(
          `/dashboard/clients/${clientId}?error=${encodeURIComponent(tokenData.error.message)}`,
          request.url
        )
      );
    }

    // Exchange for long-lived token
    const longLivedUrl =
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${process.env.FACEBOOK_APP_ID}` +
      `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
      `&fb_exchange_token=${tokenData.access_token}`;

    const longLivedResponse = await fetch(longLivedUrl);
    const longLivedData = (await longLivedResponse.json()) as {
      access_token: string;
      expires_in: number;
    };

    const accessToken = longLivedData.access_token || tokenData.access_token;
    const expiresIn = longLivedData.expires_in || tokenData.expires_in || 5184000;

    // Get ad accounts
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,currency,account_status&access_token=${accessToken}`
    );
    const accountsData = (await accountsResponse.json()) as {
      data: Array<{
        id: string;
        name: string;
        currency: string;
        account_status: number;
      }>;
    };

    const activeAccounts = (accountsData.data || []).filter(
      (a) => a.account_status === 1
    );

    if (activeAccounts.length === 0) {
      return NextResponse.redirect(
        new URL(
          `/dashboard/clients/${clientId}?error=no_active_ad_accounts`,
          request.url
        )
      );
    }

    // Connect the first active account (or all of them)
    const account = activeAccounts[0];
    const accountId = account.id.replace("act_", "");

    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    await prisma.dataSource.upsert({
      where: {
        platform_accountId_clientId: {
          platform: "FACEBOOK_ADS",
          accountId,
          clientId,
        },
      },
      update: {
        accessToken,
        refreshToken: accessToken,
        tokenExpiresAt,
        accountName: account.name,
        isActive: true,
        lastError: null,
      },
      create: {
        platform: "FACEBOOK_ADS",
        accountId,
        accountName: account.name,
        accessToken,
        refreshToken: accessToken,
        tokenExpiresAt,
        clientId,
      },
    });

    return NextResponse.redirect(
      new URL(
        `/dashboard/clients/${clientId}?connected=facebook`,
        request.url
      )
    );
  } catch (error) {
    console.error("Facebook OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/clients?error=oauth_failed", request.url)
    );
  }
}
