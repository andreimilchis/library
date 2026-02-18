import { AdPlatform } from "@/generated/prisma/client";

const FACEBOOK_API_VERSION = "v21.0";
const FACEBOOK_GRAPH_URL = `https://graph.facebook.com/${FACEBOOK_API_VERSION}`;

interface FacebookInsight {
  date_start: string;
  date_stop: string;
  campaign_id?: string;
  campaign_name?: string;
  adset_id?: string;
  adset_name?: string;
  ad_id?: string;
  ad_name?: string;
  impressions: string;
  clicks: string;
  spend: string;
  reach: string;
  frequency: string;
  cpc: string;
  cpm: string;
  ctr: string;
  actions?: Array<{ action_type: string; value: string }>;
  action_values?: Array<{ action_type: string; value: string }>;
  video_p25_watched_actions?: Array<{ value: string }>;
  video_p50_watched_actions?: Array<{ value: string }>;
  video_p75_watched_actions?: Array<{ value: string }>;
  video_p100_watched_actions?: Array<{ value: string }>;
  video_play_actions?: Array<{ value: string }>;
}

export interface NormalizedMetrics {
  date: Date;
  platform: AdPlatform;
  campaignId: string | null;
  campaignName: string | null;
  adSetId: string | null;
  adSetName: string | null;
  adId: string | null;
  adName: string | null;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  conversionValue: number;
  reach: number;
  purchases: number;
  purchaseValue: number;
  addToCart: number;
  addToCartValue: number;
  checkoutInitiated: number;
  viewContent: number;
  videoViews: number;
  videoViews25: number;
  videoViews50: number;
  videoViews75: number;
  videoViews100: number;
  likes: number;
  comments: number;
  shares: number;
  rawData: Record<string, unknown>;
}

function getActionValue(
  actions: Array<{ action_type: string; value: string }> | undefined,
  actionType: string
): number {
  if (!actions) return 0;
  const action = actions.find((a) => a.action_type === actionType);
  return action ? parseFloat(action.value) : 0;
}

function getVideoMetric(
  videoActions: Array<{ value: string }> | undefined
): number {
  if (!videoActions || videoActions.length === 0) return 0;
  return parseFloat(videoActions[0].value);
}

export class FacebookAdsService {
  private accessToken: string;
  private accountId: string;

  constructor(accessToken: string, accountId: string) {
    this.accessToken = accessToken;
    this.accountId = accountId;
  }

  private async fetchApi(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<unknown> {
    const searchParams = new URLSearchParams({
      access_token: this.accessToken,
      ...params,
    });

    const url = `${FACEBOOK_GRAPH_URL}${endpoint}?${searchParams}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Facebook API Error: ${error.error?.message || response.statusText}`
      );
    }

    return response.json();
  }

  async getInsights(
    startDate: string,
    endDate: string,
    level: "campaign" | "adset" | "ad" | "account" = "campaign"
  ): Promise<NormalizedMetrics[]> {
    const fields = [
      "campaign_id",
      "campaign_name",
      "adset_id",
      "adset_name",
      "ad_id",
      "ad_name",
      "impressions",
      "clicks",
      "spend",
      "reach",
      "frequency",
      "cpc",
      "cpm",
      "ctr",
      "actions",
      "action_values",
      "video_p25_watched_actions",
      "video_p50_watched_actions",
      "video_p75_watched_actions",
      "video_p100_watched_actions",
      "video_play_actions",
    ].join(",");

    const data = (await this.fetchApi(
      `/act_${this.accountId}/insights`,
      {
        fields,
        time_range: JSON.stringify({
          since: startDate,
          until: endDate,
        }),
        level,
        time_increment: "1",
        limit: "500",
      }
    )) as { data: FacebookInsight[] };

    return this.normalizeInsights(data.data || []);
  }

  private normalizeInsights(insights: FacebookInsight[]): NormalizedMetrics[] {
    return insights.map((insight) => ({
      date: new Date(insight.date_start),
      platform: "FACEBOOK_ADS" as AdPlatform,
      campaignId: insight.campaign_id || null,
      campaignName: insight.campaign_name || null,
      adSetId: insight.adset_id || null,
      adSetName: insight.adset_name || null,
      adId: insight.ad_id || null,
      adName: insight.ad_name || null,
      impressions: parseInt(insight.impressions) || 0,
      clicks: parseInt(insight.clicks) || 0,
      spend: parseFloat(insight.spend) || 0,
      conversions:
        getActionValue(insight.actions, "offsite_conversion.fb_pixel_purchase") +
        getActionValue(insight.actions, "purchase"),
      conversionValue:
        getActionValue(
          insight.action_values,
          "offsite_conversion.fb_pixel_purchase"
        ) + getActionValue(insight.action_values, "purchase"),
      reach: parseInt(insight.reach) || 0,
      purchases: getActionValue(insight.actions, "purchase"),
      purchaseValue: getActionValue(insight.action_values, "purchase"),
      addToCart: getActionValue(insight.actions, "add_to_cart"),
      addToCartValue: getActionValue(insight.action_values, "add_to_cart"),
      checkoutInitiated: getActionValue(
        insight.actions,
        "initiate_checkout"
      ),
      viewContent: getActionValue(insight.actions, "view_content"),
      videoViews: getVideoMetric(insight.video_play_actions),
      videoViews25: getVideoMetric(insight.video_p25_watched_actions),
      videoViews50: getVideoMetric(insight.video_p50_watched_actions),
      videoViews75: getVideoMetric(insight.video_p75_watched_actions),
      videoViews100: getVideoMetric(insight.video_p100_watched_actions),
      likes: getActionValue(insight.actions, "like"),
      comments: getActionValue(insight.actions, "comment"),
      shares: getActionValue(insight.actions, "post"),
      rawData: insight as unknown as Record<string, unknown>,
    }));
  }

  async getAdAccounts(): Promise<
    Array<{ id: string; name: string; currency: string }>
  > {
    const data = (await this.fetchApi("/me/adaccounts", {
      fields: "id,name,currency,account_status",
    })) as {
      data: Array<{
        id: string;
        name: string;
        currency: string;
        account_status: number;
      }>;
    };

    return (data.data || [])
      .filter((a) => a.account_status === 1)
      .map((a) => ({
        id: a.id.replace("act_", ""),
        name: a.name,
        currency: a.currency,
      }));
  }

  async getCampaigns(): Promise<
    Array<{ id: string; name: string; status: string }>
  > {
    const data = (await this.fetchApi(
      `/act_${this.accountId}/campaigns`,
      {
        fields: "id,name,status,objective",
        limit: "100",
      }
    )) as {
      data: Array<{ id: string; name: string; status: string }>;
    };

    return data.data || [];
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const params = new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: process.env.FACEBOOK_APP_ID!,
      client_secret: process.env.FACEBOOK_APP_SECRET!,
      fb_exchange_token: refreshToken,
    });

    const response = await fetch(
      `${FACEBOOK_GRAPH_URL}/oauth/access_token?${params}`
    );
    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  }
}
