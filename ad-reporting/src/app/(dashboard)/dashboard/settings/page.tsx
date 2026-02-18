"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Palette, Mail, Globe } from "lucide-react";

interface AgencySettings {
  name: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  customDomain: string;
  emailFromName: string;
  emailFromAddress: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AgencySettings>({
    name: "",
    logoUrl: "",
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    accentColor: "#3b82f6",
    customDomain: "",
    emailFromName: "",
    emailFromAddress: "",
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.agency) {
          setSettings({
            name: data.agency.name || "",
            logoUrl: data.agency.logoUrl || "",
            primaryColor: data.agency.primaryColor || "#2563eb",
            secondaryColor: data.agency.secondaryColor || "#1e40af",
            accentColor: data.agency.accentColor || "#3b82f6",
            customDomain: data.agency.customDomain || "",
            emailFromName: data.agency.emailFromName || "",
            emailFromAddress: data.agency.emailFromAddress || "",
            smtpHost: data.agency.smtpHost || "",
            smtpPort: data.agency.smtpPort || 587,
            smtpUser: data.agency.smtpUser || "",
            smtpPass: data.agency.smtpPass || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage("Settings saved successfully");
      } else {
        setMessage("Failed to save settings");
      }
    } catch {
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure your agency branding and email settings
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg text-sm ${
            message.includes("success")
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Branding */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            <CardTitle>Branding & White Label</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Agency Name"
            value={settings.name}
            onChange={(e) =>
              setSettings({ ...settings, name: e.target.value })
            }
          />
          <Input
            label="Logo URL"
            placeholder="https://youragency.com/logo.png"
            value={settings.logoUrl}
            onChange={(e) =>
              setSettings({ ...settings, logoUrl: e.target.value })
            }
          />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) =>
                    setSettings({ ...settings, primaryColor: e.target.value })
                  }
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) =>
                    setSettings({ ...settings, primaryColor: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      secondaryColor: e.target.value,
                    })
                  }
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                />
                <Input
                  value={settings.secondaryColor}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      secondaryColor: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accent Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) =>
                    setSettings({ ...settings, accentColor: e.target.value })
                  }
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                />
                <Input
                  value={settings.accentColor}
                  onChange={(e) =>
                    setSettings({ ...settings, accentColor: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-4 p-6 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">
              Report Header Preview
            </p>
            <div
              className="rounded-lg p-6 text-center"
              style={{ background: settings.primaryColor }}
            >
              {settings.logoUrl && (
                <img
                  src={settings.logoUrl}
                  alt="Logo"
                  className="h-8 mx-auto mb-2"
                />
              )}
              <h3 className="text-white text-lg font-semibold">
                {settings.name || "Your Agency"}
              </h3>
              <p className="text-white/80 text-sm">
                Weekly Performance Report
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Domain */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <CardTitle>Custom Domain</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            label="Custom Domain (for client dashboards)"
            placeholder="reports.youragency.com"
            value={settings.customDomain}
            onChange={(e) =>
              setSettings({ ...settings, customDomain: e.target.value })
            }
          />
          <p className="text-xs text-gray-400 mt-2">
            Set up a CNAME record pointing to your app URL
          </p>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <CardTitle>Email Configuration (SMTP)</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="From Name"
              placeholder="Your Agency"
              value={settings.emailFromName}
              onChange={(e) =>
                setSettings({ ...settings, emailFromName: e.target.value })
              }
            />
            <Input
              label="From Email"
              placeholder="reports@youragency.com"
              value={settings.emailFromAddress}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  emailFromAddress: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SMTP Host"
              placeholder="smtp.gmail.com"
              value={settings.smtpHost}
              onChange={(e) =>
                setSettings({ ...settings, smtpHost: e.target.value })
              }
            />
            <Input
              label="SMTP Port"
              type="number"
              value={settings.smtpPort}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  smtpPort: parseInt(e.target.value) || 587,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SMTP User"
              value={settings.smtpUser}
              onChange={(e) =>
                setSettings({ ...settings, smtpUser: e.target.value })
              }
            />
            <Input
              label="SMTP Password"
              type="password"
              value={settings.smtpPass}
              onChange={(e) =>
                setSettings({ ...settings, smtpPass: e.target.value })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
