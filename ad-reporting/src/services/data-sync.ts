import { prisma } from "@/lib/prisma";
import { AdPlatform } from "@prisma/client";
import { FacebookAdsService, NormalizedMetrics } from "./facebook-ads";
import { GoogleAdsService } from "./google-ads";
import { TikTokAdsService } from "./tiktok-ads";
import { format, subDays } from "date-fns";

export class DataSyncService {
  async syncDataSource(
    dataSourceId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ success: boolean; recordsCount: number; error?: string }> {
    const dataSource = await prisma.dataSource.findUnique({
      where: { id: dataSourceId },
    });

    if (!dataSource) {
      return { success: false, recordsCount: 0, error: "Data source not found" };
    }

    const start = startDate || subDays(new Date(), 7);
    const end = endDate || new Date();
    const startStr = format(start, "yyyy-MM-dd");
    const endStr = format(end, "yyyy-MM-dd");

    try {
      let metrics: NormalizedMetrics[];

      switch (dataSource.platform) {
        case "FACEBOOK_ADS": {
          const service = new FacebookAdsService(
            dataSource.accessToken,
            dataSource.accountId
          );
          metrics = await service.getInsights(startStr, endStr, "campaign");
          break;
        }
        case "GOOGLE_ADS": {
          const service = new GoogleAdsService(
            dataSource.accessToken,
            dataSource.accountId
          );
          metrics = await service.getInsights(startStr, endStr, "campaign");
          break;
        }
        case "TIKTOK_ADS": {
          const service = new TikTokAdsService(
            dataSource.accessToken,
            dataSource.accountId
          );
          metrics = await service.getInsights(startStr, endStr, "AUCTION_CAMPAIGN");
          break;
        }
        default:
          return {
            success: false,
            recordsCount: 0,
            error: `Unsupported platform: ${dataSource.platform}`,
          };
      }

      // Delete existing snapshots for this date range to avoid duplicates
      await prisma.metricSnapshot.deleteMany({
        where: {
          dataSourceId,
          date: { gte: start, lte: end },
        },
      });

      // Insert new snapshots
      const snapshots = metrics.map((m) => ({
        dataSourceId,
        date: m.date,
        campaignId: m.campaignId,
        campaignName: m.campaignName,
        adSetId: m.adSetId,
        adSetName: m.adSetName,
        adId: m.adId,
        adName: m.adName,
        impressions: m.impressions,
        clicks: m.clicks,
        spend: m.spend,
        conversions: m.conversions,
        conversionValue: m.conversionValue,
        reach: m.reach,
        purchases: m.purchases,
        purchaseValue: m.purchaseValue,
        addToCart: m.addToCart,
        addToCartValue: m.addToCartValue,
        checkoutInitiated: m.checkoutInitiated,
        viewContent: m.viewContent,
        videoViews: m.videoViews,
        videoViews25: m.videoViews25,
        videoViews50: m.videoViews50,
        videoViews75: m.videoViews75,
        videoViews100: m.videoViews100,
        likes: m.likes,
        comments: m.comments,
        shares: m.shares,
        rawData: m.rawData as object,
      }));

      if (snapshots.length > 0) {
        await prisma.metricSnapshot.createMany({ data: snapshots });
      }

      await prisma.dataSource.update({
        where: { id: dataSourceId },
        data: { lastSyncAt: new Date(), lastError: null },
      });

      return { success: true, recordsCount: snapshots.length };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await prisma.dataSource.update({
        where: { id: dataSourceId },
        data: { lastError: message },
      });
      return { success: false, recordsCount: 0, error: message };
    }
  }

  async syncAllClientSources(
    clientId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{ dataSourceId: string; platform: AdPlatform; success: boolean; recordsCount: number; error?: string }>> {
    const dataSources = await prisma.dataSource.findMany({
      where: { clientId, isActive: true },
    });

    type SyncResult = { dataSourceId: string; platform: AdPlatform; success: boolean; recordsCount: number; error?: string };

    const results = await Promise.allSettled(
      dataSources.map(async (ds): Promise<SyncResult> => {
        const result = await this.syncDataSource(ds.id, startDate, endDate);
        return {
          dataSourceId: ds.id,
          platform: ds.platform,
          ...result,
        };
      })
    );

    return results.map((r: PromiseSettledResult<SyncResult>, i: number): SyncResult => {
      if (r.status === "fulfilled") return r.value;
      return {
        dataSourceId: dataSources[i].id,
        platform: dataSources[i].platform,
        success: false,
        recordsCount: 0,
        error: (r as PromiseRejectedResult).reason?.message || "Sync failed",
      };
    });
  }

  async getAggregatedMetrics(
    clientId: string,
    startDate: Date,
    endDate: Date,
    platform?: AdPlatform,
    groupBy: "day" | "campaign" | "platform" = "day"
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      dataSource: { clientId, isActive: true },
      date: { gte: startDate, lte: endDate },
    };

    if (platform) {
      where.dataSource = { ...where.dataSource, platform };
    }

    const snapshots = await prisma.metricSnapshot.findMany({
      where,
      include: { dataSource: { select: { platform: true } } },
      orderBy: { date: "asc" },
    });

    if (groupBy === "day") {
      return this.aggregateByDay(snapshots);
    } else if (groupBy === "campaign") {
      return this.aggregateByCampaign(snapshots);
    } else {
      return this.aggregateByPlatform(snapshots);
    }
  }

  private aggregateByDay(
    snapshots: Array<{
      date: Date;
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
      likes: number;
      comments: number;
      shares: number;
    }>
  ) {
    const byDay = new Map<string, typeof snapshots>();
    for (const s of snapshots) {
      const key = format(s.date, "yyyy-MM-dd");
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key)!.push(s);
    }

    return Array.from(byDay.entries()).map(([date, items]) => ({
      date,
      ...this.sumMetrics(items),
    }));
  }

  private aggregateByCampaign(
    snapshots: Array<{
      campaignId: string | null;
      campaignName: string | null;
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
      likes: number;
      comments: number;
      shares: number;
      dataSource: { platform: AdPlatform };
    }>
  ) {
    const byCampaign = new Map<string, typeof snapshots>();
    for (const s of snapshots) {
      const key = s.campaignId || "unknown";
      if (!byCampaign.has(key)) byCampaign.set(key, []);
      byCampaign.get(key)!.push(s);
    }

    return Array.from(byCampaign.entries()).map(([campaignId, items]) => ({
      campaignId,
      campaignName: items[0]?.campaignName || "Unknown",
      platform: items[0]?.dataSource?.platform,
      ...this.sumMetrics(items),
    }));
  }

  private aggregateByPlatform(
    snapshots: Array<{
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
      likes: number;
      comments: number;
      shares: number;
      dataSource: { platform: AdPlatform };
    }>
  ) {
    const byPlatform = new Map<string, typeof snapshots>();
    for (const s of snapshots) {
      const key = s.dataSource.platform;
      if (!byPlatform.has(key)) byPlatform.set(key, []);
      byPlatform.get(key)!.push(s);
    }

    return Array.from(byPlatform.entries()).map(([platform, items]) => ({
      platform,
      ...this.sumMetrics(items),
    }));
  }

  private sumMetrics(
    items: Array<{
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
      likes: number;
      comments: number;
      shares: number;
    }>
  ) {
    const sum = {
      impressions: 0,
      clicks: 0,
      spend: 0,
      conversions: 0,
      conversionValue: 0,
      reach: 0,
      purchases: 0,
      purchaseValue: 0,
      addToCart: 0,
      addToCartValue: 0,
      checkoutInitiated: 0,
      viewContent: 0,
      videoViews: 0,
      likes: 0,
      comments: 0,
      shares: 0,
    };

    for (const item of items) {
      sum.impressions += item.impressions;
      sum.clicks += item.clicks;
      sum.spend += item.spend;
      sum.conversions += item.conversions;
      sum.conversionValue += item.conversionValue;
      sum.reach += item.reach;
      sum.purchases += item.purchases;
      sum.purchaseValue += item.purchaseValue;
      sum.addToCart += item.addToCart;
      sum.addToCartValue += item.addToCartValue;
      sum.checkoutInitiated += item.checkoutInitiated;
      sum.viewContent += item.viewContent;
      sum.videoViews += item.videoViews;
      sum.likes += item.likes;
      sum.comments += item.comments;
      sum.shares += item.shares;
    }

    // Calculate derived metrics
    return {
      ...sum,
      cpa: sum.conversions > 0 ? sum.spend / sum.conversions : 0,
      roas: sum.spend > 0 ? sum.conversionValue / sum.spend : 0,
      ctr: sum.impressions > 0 ? (sum.clicks / sum.impressions) * 100 : 0,
      cpc: sum.clicks > 0 ? sum.spend / sum.clicks : 0,
      cpm: sum.impressions > 0 ? (sum.spend / sum.impressions) * 1000 : 0,
      conversionRate: sum.clicks > 0 ? (sum.conversions / sum.clicks) * 100 : 0,
      aov: sum.purchases > 0 ? sum.purchaseValue / sum.purchases : 0,
      costPerPurchase: sum.purchases > 0 ? sum.spend / sum.purchases : 0,
      costPerAddToCart: sum.addToCart > 0 ? sum.spend / sum.addToCart : 0,
      frequency: sum.reach > 0 ? sum.impressions / sum.reach : 0,
    };
  }
}
