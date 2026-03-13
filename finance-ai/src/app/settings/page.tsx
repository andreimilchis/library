"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, RefreshCw, Database, Brain } from "lucide-react";

function SettingsContent() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get("error");
  const oauthErrorDetails = searchParams.get("details");
  const oauthConnected = searchParams.get("connected");

  const [accounts, setAccounts] = useState<Array<{ id: string; name: string; balance: number; currency: string }>>([]);
  const [classificationStats, setClassificationStats] = useState<{
    pending: number;
    needsReview: number;
    classified: number;
    total: number;
  } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [configStatus, setConfigStatus] = useState<{
    configured: boolean;
    envVars: { REVOLUT_CLIENT_ID: boolean; REVOLUT_REDIRECT_URI: boolean; REVOLUT_PRIVATE_KEY: boolean };
    useSandbox: boolean;
    hasActiveConnection: boolean;
  } | null>(null);

  useEffect(() => {
    fetch("/api/revolut/accounts").then((r) => r.json()).then((d) => setAccounts(d.accounts || []));
    fetch("/api/classifications").then((r) => r.json()).then((d) => setClassificationStats(d));
    fetch("/api/revolut/config").then((r) => r.json()).then((d) => setConfigStatus(d));
  }, []);

  const handleConnect = () => {
    window.location.href = "/api/revolut/oauth";
  };

  const handleSyncAccounts = async () => {
    setSyncing(true);
    await fetch("/api/revolut/accounts", { method: "POST" });
    const res = await fetch("/api/revolut/accounts");
    const data = await res.json();
    setAccounts(data.accounts || []);
    setSyncing(false);
  };

  const handleClassify = async () => {
    setClassifying(true);
    await fetch("/api/classifications", { method: "POST" });
    const res = await fetch("/api/classifications");
    const data = await res.json();
    setClassificationStats(data);
    setClassifying(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your connections and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            <CardTitle>Revolut Connection</CardTitle>
          </div>
          <CardDescription>
            Connect your Revolut Business account to import transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {oauthConnected === "true" && configStatus?.hasActiveConnection && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm">
              <p className="font-medium text-green-700">Successfully connected to Revolut!</p>
            </div>
          )}

          {oauthError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm space-y-1">
              <p className="font-medium text-destructive">OAuth connection failed</p>
              {oauthErrorDetails && (
                <p className="text-muted-foreground text-xs break-all">{oauthErrorDetails}</p>
              )}
            </div>
          )}

          {configStatus && !configStatus.configured && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm space-y-1">
              <p className="font-medium text-destructive">Revolut API not configured</p>
              <p className="text-muted-foreground">
                Set the following environment variables in Vercel:
              </p>
              <ul className="list-disc list-inside text-muted-foreground text-xs">
                {!configStatus.envVars.REVOLUT_CLIENT_ID && <li>REVOLUT_CLIENT_ID</li>}
                {!configStatus.envVars.REVOLUT_REDIRECT_URI && <li>REVOLUT_REDIRECT_URI</li>}
                {!configStatus.envVars.REVOLUT_PRIVATE_KEY && <li>REVOLUT_PRIVATE_KEY</li>}
              </ul>
            </div>
          )}

          {configStatus?.hasActiveConnection && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm">
              <p className="font-medium text-green-700">Connected to Revolut</p>
              <p className="text-green-600 text-xs">
                {configStatus.useSandbox ? "Sandbox mode" : "Production mode"}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button onClick={handleConnect} disabled={configStatus !== null && !configStatus.configured}>
              Connect Revolut
            </Button>
            <Button variant="outline" onClick={handleSyncAccounts} disabled={syncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
              Sync Accounts
            </Button>
          </div>

          {accounts.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Connected Accounts</h4>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                  >
                    <span className="font-medium">{account.name}</span>
                    <Badge variant="success">
                      {account.balance.toFixed(2)} {account.currency}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <CardTitle>Classification Engine</CardTitle>
          </div>
          <CardDescription>
            Automatically classify your transactions into categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleClassify} disabled={classifying}>
            <RefreshCw className={`h-4 w-4 mr-2 ${classifying ? "animate-spin" : ""}`} />
            {classifying ? "Classifying..." : "Run Classification"}
          </Button>

          {classificationStats && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="p-3 rounded-lg bg-secondary text-center">
                <p className="text-2xl font-bold">{classificationStats.classified}</p>
                <p className="text-xs text-muted-foreground">Classified</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary text-center">
                <p className="text-2xl font-bold">{classificationStats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary text-center">
                <p className="text-2xl font-bold">{classificationStats.needsReview}</p>
                <p className="text-xs text-muted-foreground">Needs Review</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary text-center">
                <p className="text-2xl font-bold">{classificationStats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Webhook Configuration</CardTitle>
          </div>
          <CardDescription>
            Configure webhooks for real-time transaction updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-sm font-medium mb-1">Webhook URL</p>
            <code className="text-xs text-muted-foreground">
              {typeof window !== "undefined" ? window.location.origin : ""}/api/revolut/webhook
            </code>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Set this URL in your Revolut Business API settings to receive real-time transaction events.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
