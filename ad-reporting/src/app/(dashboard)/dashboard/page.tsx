"use client";

import { useEffect, useState } from "react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MetricsChart } from "@/components/dashboard/metrics-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/dashboard/platform-badge";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  MousePointerClick,
  Eye,
  Target,
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  isActive: boolean;
  dataSources: Array<{
    platform: "FACEBOOK_ADS" | "GOOGLE_ADS" | "TIKTOK_ADS";
    isActive: boolean;
    lastSyncAt: string | null;
  }>;
  _count: { reports: number; schedules: number };
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(data.clients || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Demo data for the overview KPIs
  const overviewKpis = [
    {
      label: "Total Spend",
      value: formatCurrency(24580),
      change: 12.5,
      icon: <DollarSign className="w-5 h-5" />,
      color: "blue" as const,
    },
    {
      label: "ROAS",
      value: "3.42x",
      change: 8.3,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "green" as const,
    },
    {
      label: "Conversions",
      value: formatNumber(847),
      change: 15.2,
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "purple" as const,
    },
    {
      label: "CTR",
      value: formatPercent(2.34),
      change: -3.1,
      icon: <MousePointerClick className="w-5 h-5" />,
      color: "orange" as const,
    },
    {
      label: "Impressions",
      value: "1.2M",
      change: 22.1,
      icon: <Eye className="w-5 h-5" />,
      color: "teal" as const,
    },
    {
      label: "CPA",
      value: formatCurrency(29.01),
      change: -5.4,
      icon: <Target className="w-5 h-5" />,
      color: "red" as const,
    },
  ];

  // Demo chart data
  const chartData = Array.from({ length: 14 }, (_, i) => ({
    date: `${i + 1} Feb`,
    spend: Math.round(1200 + Math.random() * 800),
    conversions: Math.round(40 + Math.random() * 30),
    roas: +(2.5 + Math.random() * 2).toFixed(2),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of all campaigns across {clients.length} clients
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {overviewKpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            changeLabel="vs last period"
            icon={kpi.icon}
            color={kpi.color}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spend & Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricsChart
              data={chartData}
              type="area"
              metrics={[
                { key: "spend", label: "Spend (EUR)", color: "#2563eb" },
                {
                  key: "conversions",
                  label: "Conversions",
                  color: "#059669",
                },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ROAS Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MetricsChart
              data={chartData}
              type="line"
              metrics={[
                { key: "roas", label: "ROAS", color: "#7c3aed" },
              ]}
            />
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Active Clients</CardTitle>
          <a
            href="/dashboard/clients"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </a>
        </CardHeader>
        <CardContent className="p-0">
          {clients.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 text-sm">
                No clients yet. Add your first client to get started.
              </p>
              <a
                href="/dashboard/clients"
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Add Client
              </a>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platforms
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reports
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/dashboard/clients/${client.id}`)
                    }
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {client.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {client.companyName || client.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {client.dataSources.map((ds, i) => (
                          <PlatformBadge
                            key={i}
                            platform={ds.platform}
                            short
                          />
                        ))}
                        {client.dataSources.length === 0 && (
                          <span className="text-xs text-gray-400">
                            No sources
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {client._count.reports} reports
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={client.isActive ? "success" : "default"}
                      >
                        {client.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
