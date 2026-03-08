"use client";

import { FileText, Shield, Mail, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your NETkyu Contract Signer configuration
        </p>
      </div>

      <div className="grid gap-6">
        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Application</span>
              <span className="text-sm font-medium">NETkyu Contract Signer</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Architecture</span>
              <span className="text-sm font-medium">Next.js + PostgreSQL + Prisma</span>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Security features enabled for all documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Secure unique signing links per signer",
              "Timestamp logging for all signing events",
              "Signer email verification",
              "IP address logging",
              "Immutable signed PDF documents",
              "Full audit trail for every document",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Configuration
            </CardTitle>
            <CardDescription>
              Configure via environment variables
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-slate-50 p-4 font-mono text-xs space-y-1">
              <p>SMTP_HOST=smtp.resend.com</p>
              <p>SMTP_PORT=465</p>
              <p>SMTP_USER=resend</p>
              <p>SMTP_PASS=re_your_api_key</p>
              <p>SMTP_FROM=NETkyu &lt;contracts@netkyu.com&gt;</p>
            </div>
          </CardContent>
        </Card>

        {/* Storage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Storage
            </CardTitle>
            <CardDescription>
              Document storage configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Documents are stored locally by default. Configure S3-compatible
              storage via environment variables for production deployments.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
