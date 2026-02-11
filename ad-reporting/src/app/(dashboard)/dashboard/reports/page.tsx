"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Plus, Send, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface Report {
  id: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "GENERATING" | "READY" | "SENT" | "FAILED";
  dateRangeStart: string;
  dateRangeEnd: string;
  sentAt: string | null;
  createdAt: string;
  client: { id: string; name: string; email: string };
  _count: { widgets: number; deliveryLogs: number };
}

interface Client {
  id: string;
  name: string;
  email: string;
}

const statusConfig = {
  DRAFT: { label: "Draft", variant: "default" as const, icon: FileText },
  GENERATING: { label: "Generating", variant: "info" as const, icon: Clock },
  READY: { label: "Ready", variant: "warning" as const, icon: CheckCircle },
  SENT: { label: "Sent", variant: "success" as const, icon: CheckCircle },
  FAILED: { label: "Failed", variant: "danger" as const, icon: XCircle },
};

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    clientId: "",
    dateRangeStart: format(new Date(Date.now() - 7 * 86400000), "yyyy-MM-dd"),
    dateRangeEnd: format(new Date(Date.now() - 86400000), "yyyy-MM-dd"),
  });

  const fetchData = () => {
    Promise.all([
      fetch("/api/reports").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ])
      .then(([reportsData, clientsData]) => {
        setReports(reportsData.reports || []);
        setClients(clientsData.clients || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to create report:", err);
    }
  };

  const handleSendReport = async (reportId: string) => {
    setSending(reportId);
    try {
      await fetch(`/api/reports/${reportId}/send`, { method: "POST" });
      fetchData();
    } catch (err) {
      console.error("Failed to send report:", err);
    } finally {
      setSending(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and send performance reports to your clients
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </Button>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              No reports yet. Create your first report to get started.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Report
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Client
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Date Range
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((report) => {
                  const config = statusConfig[report.status];
                  return (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {report.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          Created{" "}
                          {format(new Date(report.createdAt), "dd MMM yyyy")}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {report.client.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(
                          new Date(report.dateRangeStart),
                          "dd MMM"
                        )}{" "}
                        -{" "}
                        {format(
                          new Date(report.dateRangeEnd),
                          "dd MMM yyyy"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {(report.status === "DRAFT" ||
                          report.status === "READY") && (
                          <Button
                            size="sm"
                            onClick={() => handleSendReport(report.id)}
                            disabled={sending === report.id}
                          >
                            {sending === report.id ? (
                              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5" />
                            ) : (
                              <Send className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Send
                          </Button>
                        )}
                        {report.status === "SENT" && (
                          <span className="text-xs text-green-600">
                            Sent{" "}
                            {report.sentAt &&
                              format(new Date(report.sentAt), "dd MMM HH:mm")}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Create Report Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Report"
        size="lg"
      >
        <form onSubmit={handleCreateReport} className="space-y-4">
          <Input
            label="Report Title"
            placeholder="Weekly Performance Report"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <select
              value={formData.clientId}
              onChange={(e) =>
                setFormData({ ...formData, clientId: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              required
            >
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.dateRangeStart}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dateRangeStart: e.target.value,
                })
              }
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.dateRangeEnd}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  dateRangeEnd: e.target.value,
                })
              }
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Create Report
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
