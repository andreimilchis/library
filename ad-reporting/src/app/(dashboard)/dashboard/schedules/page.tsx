"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Plus, Calendar, Clock, Mail } from "lucide-react";
import { format } from "date-fns";

interface Schedule {
  id: string;
  name: string;
  frequency: string;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  hour: number;
  minute: number;
  timezone: string;
  isActive: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  dateRangeType: string;
  recipients: string[];
  client: { id: string; name: string; email: string };
  _count: { deliveryLogs: number };
}

interface Client {
  id: string;
  name: string;
  email: string;
}

const frequencyLabels: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  BIWEEKLY: "Bi-weekly",
  MONTHLY: "Monthly",
};

const dateRangeLabels: Record<string, string> = {
  YESTERDAY: "Yesterday",
  LAST_7_DAYS: "Last 7 Days",
  LAST_14_DAYS: "Last 14 Days",
  LAST_30_DAYS: "Last 30 Days",
  THIS_MONTH: "This Month",
  LAST_MONTH: "Last Month",
};

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    clientId: "",
    frequency: "WEEKLY",
    dayOfWeek: 1,
    hour: 9,
    minute: 0,
    dateRangeType: "LAST_7_DAYS",
    recipients: "",
  });

  const fetchData = () => {
    Promise.all([
      fetch("/api/schedules").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ])
      .then(([schedulesData, clientsData]) => {
        setSchedules(schedulesData.schedules || []);
        setClients(clientsData.clients || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          recipients: formData.recipients
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean),
          dayOfWeek:
            formData.frequency === "WEEKLY" || formData.frequency === "BIWEEKLY"
              ? formData.dayOfWeek
              : undefined,
        }),
      });
      if (res.ok) {
        setShowCreateModal(false);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to create schedule:", err);
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
          <h1 className="text-2xl font-bold text-gray-900">Schedules</h1>
          <p className="text-sm text-gray-500 mt-1">
            Automate report delivery to your clients
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Schedule
        </Button>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              No schedules yet. Set up automated report delivery.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Schedule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{schedule.name}</CardTitle>
                  <Badge variant={schedule.isActive ? "success" : "default"}>
                    {schedule.isActive ? "Active" : "Paused"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{schedule.client.name}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>
                    {frequencyLabels[schedule.frequency]} at{" "}
                    {String(schedule.hour).padStart(2, "0")}:
                    {String(schedule.minute).padStart(2, "0")}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    {dateRangeLabels[schedule.dateRangeType] || schedule.dateRangeType}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>
                    {schedule.recipients.length > 0
                      ? `${schedule.recipients.length} recipients`
                      : schedule.client.email}
                  </span>
                </div>

                {schedule.nextRunAt && (
                  <p className="text-xs text-gray-400">
                    Next run:{" "}
                    {format(new Date(schedule.nextRunAt), "dd MMM yyyy HH:mm")}
                  </p>
                )}
                {schedule.lastRunAt && (
                  <p className="text-xs text-gray-400">
                    Last run:{" "}
                    {format(new Date(schedule.lastRunAt), "dd MMM yyyy HH:mm")}
                  </p>
                )}

                <p className="text-xs text-gray-400">
                  {schedule._count.deliveryLogs} deliveries
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Schedule Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Schedule"
        size="lg"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <Input
            label="Schedule Name"
            placeholder="Weekly Facebook Ads Report"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={formData.dateRangeType}
                onChange={(e) =>
                  setFormData({ ...formData, dateRangeType: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="YESTERDAY">Yesterday</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="LAST_14_DAYS">Last 14 Days</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="THIS_MONTH">This Month</option>
                <option value="LAST_MONTH">Last Month</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hour (0-23)"
              type="number"
              min={0}
              max={23}
              value={formData.hour}
              onChange={(e) =>
                setFormData({ ...formData, hour: parseInt(e.target.value) })
              }
            />
            <Input
              label="Minute"
              type="number"
              min={0}
              max={59}
              value={formData.minute}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minute: parseInt(e.target.value),
                })
              }
            />
          </div>

          {(formData.frequency === "WEEKLY" ||
            formData.frequency === "BIWEEKLY") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Week
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dayOfWeek: parseInt(e.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              >
                <option value={1}>Monday</option>
                <option value={2}>Tuesday</option>
                <option value={3}>Wednesday</option>
                <option value={4}>Thursday</option>
                <option value={5}>Friday</option>
                <option value={6}>Saturday</option>
                <option value={0}>Sunday</option>
              </select>
            </div>
          )}

          <Input
            label="Additional Recipients (comma-separated emails)"
            placeholder="manager@example.com, cmo@example.com"
            value={formData.recipients}
            onChange={(e) =>
              setFormData({ ...formData, recipients: e.target.value })
            }
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Create Schedule
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
