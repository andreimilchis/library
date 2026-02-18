import { AdPlatform } from "@prisma/client";
import { NormalizedMetrics } from "./facebook-ads";

const TIKTOK_API_URL = "https://business-api.tiktok.com/open_api/v1.3";

interface TikTokMetricsRow {
  dimensions: {
    stat_time_day?: string;
    campaign_id?: string;
    adgroup_id?: string;
    ad_id?: string;
  };
  metrics: {
    campaign_name?: string;
    adgroup_name?: string;
    ad_name?: string;
    impressions: string;
    clicks: string;
    spend: string;
    conversion: string;
    total_purchase_value: string;
    total_onsite_shopping_value: string;
    reach: string;
    frequency: number;
    cpc: string;
    cpm: string;
    ctr: string;
    cost_per_conversion: string;
    result_rate: string;
    video_views_p25: string;
    video_views_p50: string;
    video_views_p75: string;
    video_views_p100: string;
    video_play_actions: string;
    likes: string;
    comments: string;
    shares: string;
    complete_payment?: string;
    initiate_checkout?: string;
    add_to_cart?: string;
    page_browse_view?: string;
    total_complete_payment_rate?: string;
  };
}

export class TikTokAdsService {
  private accessToken: string;
  private advertiserId: string;

  constructor(accessToken: string, advertiserId: string) {
    this.accessToken = accessToken;
    this.advertiserId = advertiserId;
  }

  private async fetchApi(
    endpoint: string,
    params: Record<string, unknown> = {}
  ): Promise<unknown> {
    const url = `${TIKTOK_API_URL}${endpoint}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Access-Token": this.accessToken,
        "Content-Type": "application/json",
      },
      body: undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `TikTok API Error: ${error.message || response.statusText}`
      );
    }

    return response.json();
  }

  private async postApi(
    endpoint: string,
    body: Record<string, unknown> = {}
  ): Promise<unknown> {
    const url = `${TIKTOK_API_URL}${endpoint}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Access-Token": this.accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `TikTok API Error: ${error.message || response.statusText}`
      );
    }

    return response.json();
  }

  async getInsights(
    startDate: string,
    endDate: string,
    level: "AUCTION_CAMPAIGN" | "AUCTION_ADGROUP" | "AUCTION_AD" = "AUCTION_CAMPAIGN"
  ): Promise<NormalizedMetrics[]> {
    const metrics = [
      "campaign_name",
      "adgroup_name",
      "ad_name",
      "impressions",
      "clicks",
      "spend",
      "conversion",
      "total_purchase_value",
      "total_onsite_shopping_value",
      "reach",
      "frequency",
      "cpc",
      "cpm",
      "ctr",
      "cost_per_conversion",
      "video_views_p25",
      "video_views_p50",
      "video_views_p75",
      "video_views_p100",
      "video_play_actions",
      "likes",
      "comments",
      "shares",
      "complete_payment",
      "initiate_checkout",
      "add_to_cart",
      "page_browse_view",
    ];

    const dimensions: string[] = ["stat_time_day"];
    if (level === "AUCTION_CAMPAIGN") dimensions.push("campaign_id");
    if (level === "AUCTION_ADGROUP")
      dimensions.push("campaign_id", "adgroup_id");
    if (level === "AUCTION_AD")
      dimensions.push("campaign_id", "adgroup_id", "ad_id");

    const searchParams = new URLSearchParams({
      advertiser_id: this.advertiserId,
      report_type: level,
      data_level: level,
      dimensions: JSON.stringify(dimensions),
      metrics: JSON.stringify(metrics),
      start_date: startDate,
      end_date: endDate,
      page_size: "200",
      lifetime: "false",
    });

    const url = `${TIKTOK_API_URL}/report/integrated/get/?${searchParams}`;
    const response = await fetch(url, {
      headers: {
        "Access-Token": this.accessToken,
      },
    });

    const result = (await response.json()) as {
      code: number;
      message: string;
      data: { list: TikTokMetricsRow[] };
    };

    if (result.code !== 0) {
      throw new Error(`TikTok API Error: ${result.message}`);
    }

    return this.normalizeRows(result.data?.list || []);
  }

  private normalizeRows(rows: TikTokMetricsRow[]): NormalizedMetrics[] {
    return rows.map((row) => {
      const m = row.metrics;
      const d = row.dimensions;
      const purchaseValue =
        parseFloat(m.total_purchase_value || "0") +
        parseFloat(m.total_onsite_shopping_value || "0");
      const purchases = parseFloat(m.complete_payment || m.conversion || "0");

      return {
        date: new Date(d.stat_time_day || new Date()),
        platform: "TIKTOK_ADS" as AdPlatform,
        campaignId: d.campaign_id || null,
        campaignName: m.campaign_name || null,
        adSetId: d.adgroup_id || null,
        adSetName: m.adgroup_name || null,
        adId: d.ad_id || null,
        adName: m.ad_name || null,
        impressions: parseInt(m.impressions || "0"),
        clicks: parseInt(m.clicks || "0"),
        spend: parseFloat(m.spend || "0"),
        conversions: parseFloat(m.conversion || "0"),
        conversionValue: purchaseValue,
        reach: parseInt(m.reach || "0"),
        purchases,
        purchaseValue,
        addToCart: parseFloat(m.add_to_cart || "0"),
        addToCartValue: 0, // TikTok doesn't provide ATC value directly
        checkoutInitiated: parseFloat(m.initiate_checkout || "0"),
        viewContent: parseFloat(m.page_browse_view || "0"),
        videoViews: parseInt(m.video_play_actions || "0"),
        videoViews25: parseInt(m.video_views_p25 || "0"),
        videoViews50: parseInt(m.video_views_p50 || "0"),
        videoViews75: parseInt(m.video_views_p75 || "0"),
        videoViews100: parseInt(m.video_views_p100 || "0"),
        likes: parseInt(m.likes || "0"),
        comments: parseInt(m.comments || "0"),
        shares: parseInt(m.shares || "0"),
        rawData: row as unknown as Record<string, unknown>,
      };
    });
  }

  async getCampaigns(): Promise<
    Array<{ id: string; name: string; status: string }>
  > {
    const searchParams = new URLSearchParams({
      advertiser_id: this.advertiserId,
      page_size: "100",
    });

    const url = `${TIKTOK_API_URL}/campaign/get/?${searchParams}`;
    const response = await fetch(url, {
      headers: { "Access-Token": this.accessToken },
    });

    const result = (await response.json()) as {
      data: {
        list: Array<{
          campaign_id: string;
          campaign_name: string;
          status: string;
        }>;
      };
    };

    return (result.data?.list || []).map((c) => ({
      id: c.campaign_id,
      name: c.campaign_name,
      status: c.status,
    }));
  }

  static async refreshToken(
    appId: string,
    appSecret: string,
    refreshTokenStr: string
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const response = await fetch(
      `${TIKTOK_API_URL}/oauth2/refresh_token/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_id: appId,
          secret: appSecret,
          refresh_token: refreshTokenStr,
          grant_type: "refresh_token",
        }),
      }
    );

    const result = (await response.json()) as {
      data: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };
    };

    return {
      accessToken: result.data.access_token,
      refreshToken: result.data.refresh_token,
      expiresIn: result.data.expires_in,
    };
  }
}
