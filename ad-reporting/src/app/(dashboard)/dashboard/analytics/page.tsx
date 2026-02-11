"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MetricsChart } from "@/components/dashboard/metrics-chart";
import { PlatformBadge } from "@/components/dashboard/platform-badge";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  MousePointerClick,
  Eye,
  Target,
  BarChart3,
  ShoppingBag,
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { format, subDays } from "date-fns";

interface Client {
  id: string;
  name: string;
}

export default function AnalyticsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(subDays(new Date(), 1), "yyyy-MM-dd"),
  });
  interface MetricsData {
    date?: string;
    platform?: string;
    spend: number;
    conversions: number;
    conversionValue: number;
    clicks: number;
    impressions: number;
    purchases: number;
    purchaseValue: number;
    addToCart: number;
    roas: number;
    cpa: number;
    ctr: number;
    cpc: number;
    cpm: number;
  }
  const [metrics, setMetrics] = useState<MetricsData[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<MetricsData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => setClients(data.clients || []))
      .catch(() => {});
  }, []);

  const fetchMetrics = async () => {
    if (!selectedClient) return;
    setLoading(true);

    try {
      const [dailyRes, platformRes] = await Promise.all([
        fetch(
          `/api/metrics?clientId=${selectedClient}&startDate=${dateRange.start}&endDate=${dateRange.end}&groupBy=day`
        ),
        fetch(
          `/api/metrics?clientId=${selectedClient}&startDate=${dateRange.start}&endDate=${dateRange.end}&groupBy=platform`
        ),
      ]);

      const dailyData = await dailyRes.json();
      const platformData = await platformRes.json();

      setMetrics((dailyData.metrics || []) as MetricsData[]);
      setPlatformMetrics((platformData.metrics || []) as MetricsData[]);
    } catch {
      console.error("Failed to fetch metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient, dateRange]);

  // Calculate totals from daily metrics
  const totals = metrics.reduce(
    (acc, m) => {
      acc.spend += (m.spend as number) || 0;
      acc.conversions += (m.conversions as number) || 0;
      acc.conversionValue += (m.conversionValue as number) || 0;
      acc.clicks += (m.clicks as number) || 0;
      acc.impressions += (m.impressions as number) || 0;
      acc.purchases += (m.purchases as number) || 0;
      acc.purchaseValue += (m.purchaseValue as number) || 0;
      acc.addToCart += (m.addToCart as number) || 0;
      return acc;
    },
    {
      spend: 0,
      conversions: 0,
      conversionValue: 0,
      clicks: 0,
      impressions: 0,
      purchases: 0,
      purchaseValue: 0,
      addToCart: 0,
    }
  );

  const roas = totals.spend > 0 ? totals.conversionValue / totals.spend : 0;
  const cpa = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
  const ctr =
    totals.impressions > 0
      ? (totals.clicks / totals.impressions) * 100
      : 0;
  const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  const aov =
    totals.purchases > 0 ? totals.purchaseValue / totals.purchases : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Deep dive into your client&apos;s advertising performance
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedClient ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Select a client to view analytics
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
            <KpiCard
              label="Total Spend"
              value={formatCurrency(totals.spend)}
              icon={<DollarSign className="w-5 h-5" />}
              color="blue"
            />
            <KpiCard
              label="ROAS"
              value={`${roas.toFixed(2)}x`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
            />
            <KpiCard
              label="Conversions"
              value={formatNumber(totals.conversions)}
              icon={<ShoppingCart className="w-5 h-5" />}
              color="purple"
            />
            <KpiCard
              label="Conv. Value"
              value={formatCurrency(totals.conversionValue)}
              icon={<DollarSign className="w-5 h-5" />}
              color="green"
            />
            <KpiCard
              label="CPA"
              value={formatCurrency(cpa)}
              icon={<Target className="w-5 h-5" />}
              color="red"
            />
            <KpiCard
              label="CTR"
              value={formatPercent(ctr)}
              icon={<MousePointerClick className="w-5 h-5" />}
              color="orange"
            />
            <KpiCard
              label="CPC"
              value={formatCurrency(cpc)}
              icon={<MousePointerClick className="w-5 h-5" />}
              color="blue"
            />
            <KpiCard
              label="AOV"
              value={formatCurrency(aov)}
              icon={<ShoppingBag className="w-5 h-5" />}
              color="teal"
            />
          </div>

          {/* Impressions & Clicks */}
          <div className="grid grid-cols-3 gap-4">
            <KpiCard
              label="Impressions"
              value={formatNumber(totals.impressions)}
              icon={<Eye className="w-5 h-5" />}
              color="teal"
            />
            <KpiCard
              label="Clicks"
              value={formatNumber(totals.clicks)}
              icon={<MousePointerClick className="w-5 h-5" />}
              color="blue"
            />
            <KpiCard
              label="Add to Cart"
              value={formatNumber(totals.addToCart)}
              icon={<ShoppingCart className="w-5 h-5" />}
              color="purple"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Spend</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricsChart
                  data={metrics as unknown as Record<string, unknown>[]}
                  type="area"
                  metrics={[
                    { key: "spend", label: "Spend", color: "#2563eb" },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversions & ROAS</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricsChart
                  data={metrics as unknown as Record<string, unknown>[]}
                  type="line"
                  metrics={[
                    {
                      key: "conversions",
                      label: "Conversions",
                      color: "#059669",
                    },
                    { key: "roas", label: "ROAS", color: "#7c3aed" },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CPA & CPC Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricsChart
                  data={metrics as unknown as Record<string, unknown>[]}
                  type="line"
                  metrics={[
                    { key: "cpa", label: "CPA", color: "#dc2626" },
                    { key: "cpc", label: "CPC", color: "#f59e0b" },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clicks & Impressions</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricsChart
                  data={metrics as unknown as Record<string, unknown>[]}
                  type="bar"
                  metrics={[
                    { key: "clicks", label: "Clicks", color: "#2563eb" },
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          {/* Platform Breakdown */}
          {platformMetrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Platform Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-500">
                          Platform
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">
                          Spend
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">
                          ROAS
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">
                          Conv.
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">
                          Conv. Value
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">
                          CPA
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">
                          CTR
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">
                          CPC
                        </th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">
                          Impressions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {platformMetrics.map((pm, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <PlatformBadge
                              platform={
                                pm.platform as
                                  | "FACEBOOK_ADS"
                                  | "GOOGLE_ADS"
                                  | "TIKTOK_ADS"
                              }
                            />
                          </td>
                          <td className="text-right py-3 px-4 font-medium">
                            {formatCurrency(pm.spend)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {(pm.roas || 0).toFixed(2)}x
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatNumber(pm.conversions)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(pm.conversionValue)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(pm.cpa)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatPercent(pm.ctr)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(pm.cpc)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatNumber(pm.impressions)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
