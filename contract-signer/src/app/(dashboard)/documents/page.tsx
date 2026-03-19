"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Download,
  Bell,
  MoreHorizontal,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DocumentWithSigners = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  signers: {
    id: string;
    name: string;
    email: string;
    status: string;
  }[];
};

function getStatusBadge(status: string) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Signed
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3 w-3" />
          Pending signature
        </Badge>
      );
    case "DRAFT":
      return (
        <Badge variant="secondary" className="gap-1">
          Draft
        </Badge>
      );
    case "DECLINED":
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Declined
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithSigners[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendReminder(documentId: string) {
    const res = await fetch(`/api/documents/${documentId}/remind`, {
      method: "POST",
    });
    if (res.ok) {
      alert("Reminder sent successfully!");
    }
  }

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = documents.filter((d) => d.status === "PENDING").length;
  const completedCount = documents.filter(
    (d) => d.status === "COMPLETED"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track your contracts
          </p>
        </div>
        <Link href="/documents/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Sign documents
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Total documents</p>
          <p className="text-2xl font-bold">{documents.length}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Pending signature</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Documents Table */}
      <div className="rounded-xl border bg-white">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3">
            <FileText className="h-12 w-12 text-muted-foreground/30" />
            <div className="text-center">
              <p className="font-medium text-muted-foreground">
                {search ? "No documents found" : "No documents yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {search
                  ? "Try a different search term"
                  : "Get started by sending your first document for signature"}
              </p>
            </div>
            {!search && (
              <Link href="/documents/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Sign documents
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Signers</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => {
                const pendingSigners = doc.signers.filter(
                  (s) => s.status === "PENDING"
                );
                const signedSigners = doc.signers.filter(
                  (s) => s.status === "SIGNED"
                );
                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Link
                        href={`/documents/${doc.id}`}
                        className="flex items-center gap-3 font-medium hover:text-primary"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                          <FileText className="h-4 w-4 text-slate-500" />
                        </div>
                        {doc.name}
                      </Link>
                    </TableCell>
                    <TableCell>{getStatusBadge(doc.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {signedSigners.length}/{doc.signers.length} signed
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(doc.updatedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {doc.status === "COMPLETED" && (
                          <a
                            href={`/api/documents/${doc.id}/download`}
                            download
                          >
                            <Button variant="ghost" size="icon" title="Download PDF">
                              <Download className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                        {doc.status === "PENDING" && pendingSigners.length > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Send reminder"
                            onClick={() => sendReminder(doc.id)}
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
