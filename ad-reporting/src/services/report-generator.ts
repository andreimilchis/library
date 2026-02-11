import { prisma } from "@/lib/prisma";
import { DataSyncService } from "./data-sync";
import { EmailService } from "./email";
import { METRIC_DEFINITIONS, formatMetricValue } from "@/types/metrics";
import { format } from "date-fns";

export class ReportGeneratorService {
  private dataSyncService = new DataSyncService();
  private emailService = new EmailService();

  async generateAndSendReport(reportId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        client: {
          include: {
            agency: true,
            dataSources: { where: { isActive: true } },
          },
        },
        widgets: {
          include: { dataSource: true },
          orderBy: { position: "asc" },
        },
      },
    });

    if (!report) {
      return { success: false, error: "Report not found" };
    }

    try {
      // Update status to generating
      await prisma.report.update({
        where: { id: reportId },
        data: { status: "GENERATING" },
      });

      // Sync latest data for all client data sources
      await this.dataSyncService.syncAllClientSources(
        report.clientId,
        report.dateRangeStart,
        report.dateRangeEnd
      );

      // Get aggregated metrics
      const currentMetrics = await this.dataSyncService.getAggregatedMetrics(
        report.clientId,
        report.dateRangeStart,
        report.dateRangeEnd,
        undefined,
        "platform"
      );

      // Get comparison metrics if configured
      let comparisonMetrics = null;
      if (report.compareStart && report.compareEnd) {
        comparisonMetrics = await this.dataSyncService.getAggregatedMetrics(
          report.clientId,
          report.compareStart,
          report.compareEnd,
          undefined,
          "platform"
        );
      }

      // Calculate totals across all platforms
      const totals = this.calculateTotals(currentMetrics);
      const prevTotals = comparisonMetrics
        ? this.calculateTotals(comparisonMetrics)
        : null;

      // Generate the email summary HTML
      const summaryMetrics = this.buildSummaryMetrics(totals, prevTotals);
      const summaryHtml = this.emailService.generateMetricsSummaryHtml(
        summaryMetrics,
        report.client.agency?.primaryColor
      );

      // Add platform breakdown
      const platformBreakdownHtml = this.generatePlatformBreakdown(
        currentMetrics,
        report.client.agency?.primaryColor || "#2563eb"
      );

      // Send email
      const dateRange = `${format(report.dateRangeStart, "dd MMM yyyy")} - ${format(report.dateRangeEnd, "dd MMM yyyy")}`;

      const result = await this.emailService.sendReportEmail({
        to: report.client.email,
        clientName: report.client.name,
        reportTitle: report.title,
        dateRange,
        summaryHtml: summaryHtml + platformBreakdownHtml,
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${report.clientId}`,
        agencyName: report.client.agency?.name,
        agencyLogoUrl: report.client.agency?.logoUrl || undefined,
        primaryColor: report.client.agency?.primaryColor,
        smtpConfig: report.client.agency?.smtpHost
          ? {
              host: report.client.agency.smtpHost,
              port: report.client.agency.smtpPort || 587,
              user: report.client.agency.smtpUser || "",
              pass: report.client.agency.smtpPass || "",
            }
          : undefined,
        fromName: report.client.agency?.emailFromName || undefined,
        fromAddress: report.client.agency?.emailFromAddress || undefined,
      });

      if (result.success) {
        await prisma.report.update({
          where: { id: reportId },
          data: { status: "SENT", sentAt: new Date() },
        });

        await prisma.deliveryLog.create({
          data: {
            reportId,
            recipientEmail: report.client.email,
            status: "SENT",
            sentAt: new Date(),
          },
        });
      } else {
        await prisma.report.update({
          where: { id: reportId },
          data: { status: "FAILED" },
        });

        await prisma.deliveryLog.create({
          data: {
            reportId,
            recipientEmail: report.client.email,
            status: "FAILED",
            errorMessage: result.error,
          },
        });
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await prisma.report.update({
        where: { id: reportId },
        data: { status: "FAILED" },
      });
      return { success: false, error: message };
    }
  }

  private calculateTotals(
    platformMetrics: Array<Record<string, unknown>>
  ): Record<string, number> {
    const totals: Record<string, number> = {
      impressions: 0,
      clicks: 0,
      spend: 0,
      conversions: 0,
      conversionValue: 0,
      reach: 0,
      purchases: 0,
      purchaseValue: 0,
      addToCart: 0,
      videoViews: 0,
    };

    for (const pm of platformMetrics) {
      for (const key of Object.keys(totals)) {
        totals[key] += (pm[key] as number) || 0;
      }
    }

    // Derived
    totals.cpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
    totals.roas = totals.spend > 0 ? totals.conversionValue / totals.spend : 0;
    totals.ctr =
      totals.impressions > 0
        ? (totals.clicks / totals.impressions) * 100
        : 0;
    totals.cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    totals.cpm =
      totals.impressions > 0
        ? (totals.spend / totals.impressions) * 1000
        : 0;
    totals.conversionRate =
      totals.clicks > 0
        ? (totals.conversions / totals.clicks) * 100
        : 0;
    totals.aov =
      totals.purchases > 0
        ? totals.purchaseValue / totals.purchases
        : 0;

    return totals;
  }

  private buildSummaryMetrics(
    current: Record<string, number>,
    previous: Record<string, number> | null
  ): Array<{ label: string; value: string; change?: number }> {
    const metricsToShow = [
      "spend",
      "roas",
      "conversions",
      "conversion_value",
      "cpa",
      "ctr",
      "cpc",
      "purchases",
      "aov",
      "impressions",
      "clicks",
      "cpm",
    ];

    return metricsToShow.map((key) => {
      const def = METRIC_DEFINITIONS[key];
      const currentKey = key === "conversion_value" ? "conversionValue" : key;
      const value = current[currentKey] || 0;
      const label = def?.label || key;
      const formattedValue = def
        ? formatMetricValue(value, def.format)
        : value.toFixed(2);

      let change: number | undefined;
      if (previous) {
        const prevValue = previous[currentKey] || 0;
        if (prevValue > 0) {
          change = ((value - prevValue) / prevValue) * 100;
        }
      }

      return { label, value: formattedValue, change };
    });
  }

  private generatePlatformBreakdown(
    platformMetrics: Array<Record<string, unknown>>,
    primaryColor: string
  ): string {
    if (platformMetrics.length <= 1) return "";

    const platformLabels: Record<string, string> = {
      FACEBOOK_ADS: "Facebook Ads",
      GOOGLE_ADS: "Google Ads",
      TIKTOK_ADS: "TikTok Ads",
    };

    let html = `
      <div class="summary-section">
        <h3 style="color: ${primaryColor};">Platform Breakdown</h3>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:10px;text-align:left;border:1px solid #e5e7eb;">Platform</th>
              <th style="padding:10px;text-align:right;border:1px solid #e5e7eb;">Spend</th>
              <th style="padding:10px;text-align:right;border:1px solid #e5e7eb;">ROAS</th>
              <th style="padding:10px;text-align:right;border:1px solid #e5e7eb;">Conv.</th>
              <th style="padding:10px;text-align:right;border:1px solid #e5e7eb;">CPA</th>
              <th style="padding:10px;text-align:right;border:1px solid #e5e7eb;">CTR</th>
            </tr>
          </thead>
          <tbody>`;

    for (const pm of platformMetrics) {
      const platformName =
        platformLabels[pm.platform as string] || (pm.platform as string);
      html += `
            <tr>
              <td style="padding:10px;border:1px solid #e5e7eb;font-weight:600;">${platformName}</td>
              <td style="padding:10px;text-align:right;border:1px solid #e5e7eb;">${formatMetricValue(pm.spend as number, "currency")}</td>
              <td style="padding:10px;text-align:right;border:1px solid #e5e7eb;">${formatMetricValue(pm.roas as number, "multiplier")}</td>
              <td style="padding:10px;text-align:right;border:1px solid #e5e7eb;">${formatMetricValue(pm.conversions as number, "number")}</td>
              <td style="padding:10px;text-align:right;border:1px solid #e5e7eb;">${formatMetricValue(pm.cpa as number, "currency")}</td>
              <td style="padding:10px;text-align:right;border:1px solid #e5e7eb;">${formatMetricValue(pm.ctr as number, "percent")}</td>
            </tr>`;
    }

    html += `
          </tbody>
        </table>
      </div>`;

    return html;
  }
}
