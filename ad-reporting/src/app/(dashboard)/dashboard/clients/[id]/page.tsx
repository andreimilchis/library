"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { PlatformBadge } from "@/components/dashboard/platform-badge";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { MetricsChart } from "@/components/dashboard/metrics-chart";
import {
  ArrowLeft,
  Plus,
  RefreshCw,
  Trash2,
  Send,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  MousePointerClick,
  Eye,
  Target,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

interface DataSource {
  id: string;
  platform: "FACEBOOK_ADS" | "GOOGLE_ADS" | "TIKTOK_ADS";
  accountId: string;
  accountName: string | null;
  isActive: boolean;
  lastSyncAt: string | null;
  lastError: string | null;
  tokenExpiresAt: string | null;
}

interface Client {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  website: string | null;
  industry: string | null;
  isActive: boolean;
  notes: string | null;
  createdAt: string;
  dataSources: DataSource[];
  _count: { reports: number; schedules: number };
}

interface MetricData {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  conversionValue: number;
  reach: number;
  purchases: number;
  purchaseValue: number;
  cpa: number;
  roas: number;
  ctr: number;
  cpc: number;
  cpm: number;
  [key: string]: unknown;
}

const platformInfo = {
  FACEBOOK_ADS: {
    name: "Facebook Ads",
    description: "Connect your Meta Business account to pull Facebook & Instagram ad data",
    color: "bg-blue-600",
    icon: "f",
  },
  GOOGLE_ADS: {
    name: "Google Ads",
    description: "Connect your Google Ads account for search, display & video campaign data",
    color: "bg-emerald-600",
    icon: "G",
  },
  TIKTOK_ADS: {
    name: "TikTok Ads",
    description: "Connect your TikTok Ads Manager for video campaign performance data",
    color: "bg-pink-600",
    icon: "T",
  },
};

export default function ClientDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [sendingReport, setSendingReport] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    companyName: "",
    website: "",
    industry: "",
    notes: "",
  });

  const [reportData, setReportData] = useState({
    title: "Weekly Performance Report",
    dateRangeStart: new Date(Date.now() - 7 * 86400000)
      .toISOString()
      .split("T")[0],
    dateRangeEnd: new Date(Date.now() - 86400000).toISOString().split("T")[0],
  });

  const fetchClient = useCallback(() => {
    fetch(`/api/clients/${clientId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.client) {
          setClient(data.client);
          setEditData({
            name: data.client.name,
            email: data.client.email,
            companyName: data.client.companyName || "",
            website: data.client.website || "",
            industry: data.client.industry || "",
            notes: data.client.notes || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [clientId]);

  const fetchMetrics = useCallback(() => {
    const end = new Date();
    const start = new Date(Date.now() - 30 * 86400000);
    fetch(
      `/api/metrics?clientId=${clientId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}&groupBy=day`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      })
      .catch(() => {});
  }, [clientId]);

  useEffect(() => {
    fetchClient();
    fetchMetrics();
  }, [fetchClient, fetchMetrics]);

  // Show success notification from OAuth redirect
  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected) {
      setNotification({
        type: "success",
        message: `${connected.charAt(0).toUpperCase() + connected.slice(1)} Ads connected successfully!`,
      });
      // Clean URL
      window.history.replaceState({}, "", `/dashboard/clients/${clientId}`);
    }
    if (error) {
      setNotification({
        type: "error",
        message: `Connection error: ${error.replace(/_/g, " ")}`,
      });
      window.history.replaceState({}, "", `/dashboard/clients/${clientId}`);
    }
  }, [searchParams, clientId]);

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleConnectPlatform = async (
    platform: "FACEBOOK_ADS" | "GOOGLE_ADS" | "TIKTOK_ADS"
  ) => {
    setConnectingPlatform(platform);
    try {
      const platformPath =
        platform === "FACEBOOK_ADS"
          ? "facebook"
          : platform === "GOOGLE_ADS"
            ? "google"
            : "tiktok";

      const res = await fetch(
        `/api/oauth/${platformPath}?clientId=${clientId}`
      );
      const data = await res.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        setNotification({
          type: "error",
          message: data.error || "Failed to initiate OAuth",
        });
      }
    } catch {
      setNotification({
        type: "error",
        message: "Failed to connect platform",
      });
    } finally {
      setConnectingPlatform(null);
    }
  };

  const handleSyncData = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/data-sources/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      const data = await res.json();

      if (data.results) {
        const totalRecords = data.results.reduce(
          (sum: number, r: { recordsCount: number }) => sum + r.recordsCount,
          0
        );
        setNotification({
          type: "success",
          message: `Synced ${totalRecords} records from ${data.results.length} data sources`,
        });
        fetchClient();
        fetchMetrics();
      }
    } catch {
      setNotification({ type: "error", message: "Sync failed" });
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async (dataSourceId: string) => {
    if (!confirm("Are you sure you want to disconnect this data source?"))
      return;
    try {
      await fetch(`/api/data-sources?id=${dataSourceId}`, {
        method: "DELETE",
      });
      fetchClient();
      setNotification({
        type: "success",
        message: "Data source disconnected",
      });
    } catch {
      setNotification({
        type: "error",
        message: "Failed to disconnect",
      });
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchClient();
        setNotification({
          type: "success",
          message: "Client updated successfully",
        });
      }
    } catch {
      setNotification({ type: "error", message: "Failed to update client" });
    }
  };

  const handleCreateAndSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingReport(true);
    try {
      // Create report
      const createRes = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reportData,
          clientId,
        }),
      });
      const createData = await createRes.json();

      if (createData.report) {
        // Send report
        const sendRes = await fetch(
          `/api/reports/${createData.report.id}/send`,
          { method: "POST" }
        );
        const sendData = await sendRes.json();

        if (sendData.success) {
          setNotification({
            type: "success",
            message: `Report sent to ${client?.email}`,
          });
        } else {
          setNotification({
            type: "error",
            message: sendData.error || "Failed to send report",
          });
        }
      }
      setShowReportModal(false);
    } catch {
      setNotification({ type: "error", message: "Failed to create report" });
    } finally {
      setSendingReport(false);
    }
  };

  // Compute totals from metrics
  const totals = metrics.reduce(
    (acc, m) => ({
      spend: acc.spend + (m.spend || 0),
      conversions: acc.conversions + (m.conversions || 0),
      conversionValue: acc.conversionValue + (m.conversionValue || 0),
      clicks: acc.clicks + (m.clicks || 0),
      impressions: acc.impressions + (m.impressions || 0),
      purchases: acc.purchases + (m.purchases || 0),
      reach: acc.reach + (m.reach || 0),
    }),
    {
      spend: 0,
      conversions: 0,
      conversionValue: 0,
      clicks: 0,
      impressions: 0,
      purchases: 0,
      reach: 0,
    }
  );

  const roas =
    totals.spend > 0 ? totals.conversionValue / totals.spend : 0;
  const cpa =
    totals.conversions > 0 ? totals.spend / totals.conversions : 0;
  const ctr =
    totals.impressions > 0
      ? (totals.clicks / totals.impressions) * 100
      : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Client not found</p>
        <a href="/dashboard/clients" className="text-blue-600 hover:underline mt-2 inline-block">
          Back to clients
        </a>
      </div>
    );
  }

  const connectedPlatforms = client.dataSources.map((ds) => ds.platform);
  const availablePlatforms = (
    ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"] as const
  ).filter((p) => !connectedPlatforms.includes(p));

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            notification.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {notification.message}
          <button
            onClick={() => setNotification(null)}
            className="ml-2 opacity-60 hover:opacity-100"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/dashboard/clients"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </a>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {client.name}
              </h1>
              <Badge variant={client.isActive ? "success" : "default"}>
                {client.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {client.companyName && `${client.companyName} · `}
              {client.email}
              {client.industry && ` · ${client.industry}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditModal(true)}
          >
            Edit Client
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncData}
            disabled={syncing || client.dataSources.length === 0}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${syncing ? "animate-spin" : ""}`}
            />
            {syncing ? "Syncing..." : "Sync Data"}
          </Button>
          <Button
            size="sm"
            onClick={() => setShowReportModal(true)}
            disabled={client.dataSources.length === 0}
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Send Report
          </Button>
        </div>
      </div>

      {/* Connected Platforms */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Connected Platforms</CardTitle>
          {availablePlatforms.length > 0 && (
            <Button
              size="sm"
              onClick={() => setShowConnectModal(true)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Connect Platform
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {client.dataSources.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">
                No platforms connected
              </p>
              <p className="text-gray-400 text-sm mb-4">
                Connect your first ad platform to start pulling data
              </p>
              <Button onClick={() => setShowConnectModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Connect Platform
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {client.dataSources.map((ds) => {
                const info = platformInfo[ds.platform];
                return (
                  <div
                    key={ds.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 ${info.color} text-white rounded-lg flex items-center justify-center font-bold text-lg`}
                        >
                          {info.icon}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {info.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {ds.accountName || ds.accountId}
                          </p>
                        </div>
                      </div>
                      <PlatformBadge platform={ds.platform} short />
                    </div>

                    <div className="space-y-1.5 text-xs mb-3">
                      <div className="flex justify-between text-gray-500">
                        <span>Status</span>
                        <span
                          className={
                            ds.isActive ? "text-green-600" : "text-red-600"
                          }
                        >
                          {ds.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Last sync</span>
                        <span>
                          {ds.lastSyncAt
                            ? new Date(ds.lastSyncAt).toLocaleDateString(
                                "ro-RO",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "Never"}
                        </span>
                      </div>
                      {ds.lastError && (
                        <div className="text-red-500 truncate">
                          Error: {ds.lastError}
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDisconnect(ds.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Disconnect
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* KPI Overview (only if we have metrics) */}
      {metrics.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
              label="CTR"
              value={formatPercent(ctr)}
              icon={<MousePointerClick className="w-5 h-5" />}
              color="orange"
            />
            <KpiCard
              label="Impressions"
              value={formatNumber(totals.impressions)}
              icon={<Eye className="w-5 h-5" />}
              color="teal"
            />
            <KpiCard
              label="CPA"
              value={formatCurrency(cpa)}
              icon={<Target className="w-5 h-5" />}
              color="red"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spend & Conversions (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricsChart
                  data={metrics}
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
                <CardTitle>ROAS & CPA Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricsChart
                  data={metrics}
                  type="line"
                  metrics={[
                    { key: "roas", label: "ROAS", color: "#7c3aed" },
                    { key: "cpa", label: "CPA", color: "#dc2626" },
                  ]}
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* If no metrics and no data sources */}
      {metrics.length === 0 && client.dataSources.length > 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-1">No data yet</p>
            <p className="text-gray-400 text-sm mb-4">
              Click &quot;Sync Data&quot; to pull the latest metrics from your
              connected platforms
            </p>
            <Button onClick={handleSyncData} disabled={syncing}>
              <RefreshCw
                className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`}
              />
              {syncing ? "Syncing..." : "Sync Now"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Connect Platform Modal */}
      <Modal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        title="Connect Ad Platform"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">
            Select the ad platform you want to connect. You will be redirected to
            authorize access to the ad account.
          </p>
          {(
            ["FACEBOOK_ADS", "GOOGLE_ADS", "TIKTOK_ADS"] as const
          ).map((platform) => {
            const info = platformInfo[platform];
            const isConnected = connectedPlatforms.includes(platform);
            const isConnecting = connectingPlatform === platform;

            return (
              <div
                key={platform}
                className={`border rounded-lg p-4 flex items-center justify-between ${
                  isConnected
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 ${info.color} text-white rounded-lg flex items-center justify-center font-bold text-xl`}
                  >
                    {info.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{info.name}</p>
                    <p className="text-sm text-gray-500">{info.description}</p>
                  </div>
                </div>
                {isConnected ? (
                  <Badge variant="success">Connected</Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnectPlatform(platform)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5" />
                    ) : (
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Connect
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Client"
      >
        <form onSubmit={handleUpdateClient} className="space-y-4">
          <Input
            label="Client Name"
            value={editData.name}
            onChange={(e) =>
              setEditData({ ...editData, name: e.target.value })
            }
            required
          />
          <Input
            label="Email"
            type="email"
            value={editData.email}
            onChange={(e) =>
              setEditData({ ...editData, email: e.target.value })
            }
            required
          />
          <Input
            label="Company Name"
            value={editData.companyName}
            onChange={(e) =>
              setEditData({ ...editData, companyName: e.target.value })
            }
          />
          <Input
            label="Website"
            value={editData.website}
            onChange={(e) =>
              setEditData({ ...editData, website: e.target.value })
            }
          />
          <Input
            label="Industry"
            value={editData.industry}
            onChange={(e) =>
              setEditData({ ...editData, industry: e.target.value })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              rows={3}
              value={editData.notes}
              onChange={(e) =>
                setEditData({ ...editData, notes: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Send Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Send Report"
      >
        <form onSubmit={handleCreateAndSendReport} className="space-y-4">
          <p className="text-sm text-gray-500">
            This will generate a performance report and send it to{" "}
            <strong>{client.email}</strong>
          </p>
          <Input
            label="Report Title"
            value={reportData.title}
            onChange={(e) =>
              setReportData({ ...reportData, title: e.target.value })
            }
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={reportData.dateRangeStart}
              onChange={(e) =>
                setReportData({
                  ...reportData,
                  dateRangeStart: e.target.value,
                })
              }
              required
            />
            <Input
              label="End Date"
              type="date"
              value={reportData.dateRangeEnd}
              onChange={(e) =>
                setReportData({
                  ...reportData,
                  dateRangeEnd: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={sendingReport}
            >
              {sendingReport ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5" />
                  Generating & Sending...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Generate & Send
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReportModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
