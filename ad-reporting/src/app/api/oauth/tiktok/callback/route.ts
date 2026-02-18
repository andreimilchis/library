import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);

    const authCode = searchParams.get("auth_code");
    const stateParam = searchParams.get("state");

    if (!authCode || !stateParam) {
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

    // Exchange auth code for access token
    const tokenResponse = await fetch(
      "https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: process.env.TIKTOK_APP_ID,
          secret: process.env.TIKTOK_APP_SECRET,
          auth_code: authCode,
          grant_type: "authorization_code",
        }),
      }
    );

    const tokenResult = (await tokenResponse.json()) as {
      code: number;
      message: string;
      data: {
        access_token: string;
        refresh_token: string;
        advertiser_ids: string[];
        scope: string[];
        expires_in?: number;
      };
    };

    if (tokenResult.code !== 0) {
      return NextResponse.redirect(
        new URL(
          `/dashboard/clients/${clientId}?error=${encodeURIComponent(tokenResult.message)}`,
          request.url
        )
      );
    }

    const { access_token, refresh_token, advertiser_ids } = tokenResult.data;

    if (!advertiser_ids || advertiser_ids.length === 0) {
      return NextResponse.redirect(
        new URL(
          `/dashboard/clients/${clientId}?error=no_advertiser_accounts`,
          request.url
        )
      );
    }

    // Use the first advertiser ID
    const advertiserId = advertiser_ids[0];

    // Try to get advertiser info
    let accountName = `TikTok Ads (${advertiserId})`;
    try {
      const infoResponse = await fetch(
        `https://business-api.tiktok.com/open_api/v1.3/advertiser/info/?advertiser_ids=["${advertiserId}"]`,
        {
          headers: { "Access-Token": access_token },
        }
      );
      const infoResult = (await infoResponse.json()) as {
        data: { list: Array<{ advertiser_name: string }> };
      };
      if (infoResult.data?.list?.[0]?.advertiser_name) {
        accountName = infoResult.data.list[0].advertiser_name;
      }
    } catch {
      // Ignore - we'll use default name
    }

    const expiresIn = tokenResult.data.expires_in || 86400;
    const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

    await prisma.dataSource.upsert({
      where: {
        platform_accountId_clientId: {
          platform: "TIKTOK_ADS",
          accountId: advertiserId,
          clientId,
        },
      },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
        accountName,
        isActive: true,
        lastError: null,
      },
      create: {
        platform: "TIKTOK_ADS",
        accountId: advertiserId,
        accountName,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
        clientId,
      },
    });

    return NextResponse.redirect(
      new URL(
        `/dashboard/clients/${clientId}?connected=tiktok`,
        request.url
      )
    );
  } catch (error) {
    console.error("TikTok OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/clients?error=oauth_failed", request.url)
    );
  }
}
