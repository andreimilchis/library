import { AdPlatform } from "@prisma/client";
import { NormalizedMetrics } from "./facebook-ads";

const GOOGLE_ADS_API_VERSION = "v18";
const GOOGLE_ADS_API_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

interface GoogleAdsRow {
  campaign?: { id: string; name: string };
  adGroup?: { id: string; name: string };
  adGroupAd?: { ad: { id: string; name: string } };
  segments?: { date: string };
  metrics?: {
    impressions: string;
    clicks: string;
    costMicros: string;
    conversions: number;
    conversionsValue: number;
    allConversions: number;
    allConversionsValue: number;
    ctr: number;
    averageCpc: string;
    averageCpm: string;
    videoViews: string;
    videoQuartileP25Rate: number;
    videoQuartileP50Rate: number;
    videoQuartileP75Rate: number;
    videoQuartileP100Rate: number;
    engagements: string;
  };
}

export class GoogleAdsService {
  private accessToken: string;
  private customerId: string;
  private developerToken: string;

  constructor(
    accessToken: string,
    customerId: string,
    developerToken?: string
  ) {
    this.accessToken = accessToken;
    this.customerId = customerId.replace(/-/g, "");
    this.developerToken =
      developerToken || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
  }

  private async fetchApi(query: string): Promise<GoogleAdsRow[]> {
    const url = `${GOOGLE_ADS_API_URL}/customers/${this.customerId}/googleAds:searchStream`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "developer-token": this.developerToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Google Ads API Error: ${JSON.stringify(error.error?.message || error)}`
      );
    }

    const data = (await response.json()) as Array<{ results: GoogleAdsRow[] }>;
    return data.flatMap((batch) => batch.results || []);
  }

  async getInsights(
    startDate: string,
    endDate: string,
    level: "campaign" | "ad_group" | "ad" = "campaign"
  ): Promise<NormalizedMetrics[]> {
    const selectFields = [
      "segments.date",
      "metrics.impressions",
      "metrics.clicks",
      "metrics.cost_micros",
      "metrics.conversions",
      "metrics.conversions_value",
      "metrics.all_conversions",
      "metrics.all_conversions_value",
      "metrics.ctr",
      "metrics.average_cpc",
      "metrics.average_cpm",
      "metrics.video_views",
      "metrics.video_quartile_p25_rate",
      "metrics.video_quartile_p50_rate",
      "metrics.video_quartile_p75_rate",
      "metrics.video_quartile_p100_rate",
      "metrics.engagements",
    ];

    let resourceFields: string[];
    let resource: string;

    switch (level) {
      case "ad_group":
        resource = "ad_group";
        resourceFields = [
          "campaign.id",
          "campaign.name",
          "ad_group.id",
          "ad_group.name",
        ];
        break;
      case "ad":
        resource = "ad_group_ad";
        resourceFields = [
          "campaign.id",
          "campaign.name",
          "ad_group.id",
          "ad_group.name",
          "ad_group_ad.ad.id",
          "ad_group_ad.ad.name",
        ];
        break;
      default:
        resource = "campaign";
        resourceFields = ["campaign.id", "campaign.name"];
    }

    const query = `
      SELECT ${[...resourceFields, ...selectFields].join(", ")}
      FROM ${resource}
      WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        AND campaign.status != 'REMOVED'
      ORDER BY segments.date DESC
    `;

    const rows = await this.fetchApi(query);
    return this.normalizeRows(rows);
  }

  private normalizeRows(rows: GoogleAdsRow[]): NormalizedMetrics[] {
    return rows.map((row) => {
      const metrics = row.metrics || ({} as NonNullable<GoogleAdsRow["metrics"]>);
      const costMicros = parseInt(metrics.costMicros || "0");
      const spend = costMicros / 1_000_000;
      const impressions = parseInt(metrics.impressions || "0");
      const videoViews = parseInt(metrics.videoViews || "0");

      return {
        date: new Date(row.segments?.date || new Date()),
        platform: "GOOGLE_ADS" as AdPlatform,
        campaignId: row.campaign?.id || null,
        campaignName: row.campaign?.name || null,
        adSetId: row.adGroup?.id || null,
        adSetName: row.adGroup?.name || null,
        adId: row.adGroupAd?.ad?.id || null,
        adName: row.adGroupAd?.ad?.name || null,
        impressions,
        clicks: parseInt(metrics.clicks || "0"),
        spend,
        conversions: metrics.conversions || 0,
        conversionValue: metrics.conversionsValue || 0,
        reach: 0, // Google Ads doesn't provide reach at this level
        purchases: metrics.conversions || 0,
        purchaseValue: metrics.conversionsValue || 0,
        addToCart: 0, // Need to extract from conversion actions
        addToCartValue: 0,
        checkoutInitiated: 0,
        viewContent: 0,
        videoViews,
        videoViews25: impressions > 0
          ? Math.round(impressions * (metrics.videoQuartileP25Rate || 0))
          : 0,
        videoViews50: impressions > 0
          ? Math.round(impressions * (metrics.videoQuartileP50Rate || 0))
          : 0,
        videoViews75: impressions > 0
          ? Math.round(impressions * (metrics.videoQuartileP75Rate || 0))
          : 0,
        videoViews100: impressions > 0
          ? Math.round(impressions * (metrics.videoQuartileP100Rate || 0))
          : 0,
        likes: 0,
        comments: 0,
        shares: 0,
        rawData: row as unknown as Record<string, unknown>,
      };
    });
  }

  async getCampaigns(): Promise<
    Array<{ id: string; name: string; status: string }>
  > {
    const query = `
      SELECT campaign.id, campaign.name, campaign.status
      FROM campaign
      WHERE campaign.status != 'REMOVED'
      ORDER BY campaign.name
    `;

    const rows = await this.fetchApi(query);
    return rows.map((row) => ({
      id: row.campaign?.id || "",
      name: row.campaign?.name || "",
      status: "ACTIVE",
    }));
  }

  static async refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
        client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

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
