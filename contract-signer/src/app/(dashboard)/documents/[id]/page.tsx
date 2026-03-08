"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Bell,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type DocumentDetail = {
  id: string;
  name: string;
  status: string;
  originalPdfUrl: string;
  signedPdfUrl: string | null;
  message: string | null;
  createdAt: string;
  updatedAt: string;
  user: { name: string; email: string };
  signers: {
    id: string;
    name: string;
    email: string;
    status: string;
    signedAt: string | null;
    signerIp: string | null;
  }[];
  auditLog: {
    id: string;
    action: string;
    details: string | null;
    ipAddress: string | null;
    createdAt: string;
    signer: { name: string } | null;
  }[];
};

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
    case "SIGNED":
      return <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Signed</Badge>;
    case "PENDING":
      return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    case "DECLINED":
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Declined</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocument();
  }, [params.id]);

  async function fetchDocument() {
    try {
      const res = await fetch(`/api/documents/${params.id}`);
      if (res.ok) {
        setDoc(await res.json());
      } else {
        router.push("/documents");
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendReminder() {
    const res = await fetch(`/api/documents/${params.id}/remind`, {
      method: "POST",
    });
    if (res.ok) {
      alert("Reminder sent to pending signers!");
    }
  }

  if (loading || !doc) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link href="/documents">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{doc.name}</h1>
            <p className="text-sm text-muted-foreground">
              Created {new Date(doc.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} by {doc.user.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {doc.status === "PENDING" && (
            <Button variant="outline" className="gap-2" onClick={sendReminder}>
              <Bell className="h-4 w-4" />
              Send reminder
            </Button>
          )}
          <a href={`/api/documents/${doc.id}/download`} download>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main content */}
        <div className="col-span-2 space-y-6">
          {/* Status card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Document Status
                {getStatusBadge(doc.status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doc.message && (
                <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  {doc.message}
                </div>
              )}
              <div className="space-y-3">
                {doc.signers.map((signer) => (
                  <div
                    key={signer.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                        <User className="h-4 w-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{signer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {signer.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(signer.status)}
                      {signer.signedAt && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(signer.signedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit trail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {doc.auditLog.map((log, i) => (
                <div key={log.id} className="relative pl-4">
                  {i < doc.auditLog.length - 1 && (
                    <div className="absolute left-[7px] top-6 h-full w-px bg-border" />
                  )}
                  <div className="flex gap-3">
                    <div className="mt-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-white" />
                    <div>
                      <p className="text-sm font-medium">{log.action}</p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground">
                          {log.details}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {log.signer && ` - ${log.signer.name}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
