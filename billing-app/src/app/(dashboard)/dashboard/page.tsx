import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, CreditCard, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    invoicedThisMonth,
    totalCollected,
    totalOutstanding,
    overdueInvoices,
    recentInvoices,
  ] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        issueDate: { gte: startOfMonth },
        status: { not: "CANCELLED" },
      },
      _sum: { total: true },
    }),
    prisma.payment.aggregate({
      where: {
        paymentDate: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: {
        status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] },
      },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: { status: "OVERDUE" },
      _sum: { total: true },
      _count: true,
    }),
    prisma.invoice.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { client: true },
    }),
  ]);

  return {
    invoicedThisMonth: invoicedThisMonth._sum.total ?? 0,
    totalCollected: totalCollected._sum.amount ?? 0,
    totalOutstanding: totalOutstanding._sum.total ?? 0,
    overdueAmount: overdueInvoices._sum.total ?? 0,
    overdueCount: overdueInvoices._count ?? 0,
    recentInvoices,
  };
}

const statusLabels: Record<string, string> = {
  DRAFT: "Ciorna",
  SENT: "Trimisa",
  PAID: "Platita",
  PARTIALLY_PAID: "Partial platita",
  OVERDUE: "Restanta",
  CANCELLED: "Anulata",
  STORNO: "Stornata",
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  DRAFT: "secondary",
  SENT: "default",
  PAID: "success",
  PARTIALLY_PAID: "warning",
  OVERDUE: "destructive",
  CANCELLED: "outline",
  STORNO: "outline",
};

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Prezentare generala a activitatii
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facturat luna aceasta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.invoicedThisMonth)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incasat luna aceasta</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalCollected)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold restant</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalOutstanding)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restante</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.overdueAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.overdueCount} facturi restante
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Facturi recente</CardTitle>
            <Link
              href="/invoices"
              className="text-sm text-blue-600 hover:underline"
            >
              Vezi toate
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nu exista facturi inca.{" "}
                <Link href="/invoices/new" className="text-blue-600 hover:underline">
                  Creeaza prima factura
                </Link>
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numar</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {invoice.seriesPrefix}
                          {String(invoice.number).padStart(4, "0")}
                        </Link>
                      </TableCell>
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell>
                        {formatCurrency(invoice.total, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant[invoice.status] ?? "secondary"}>
                          {statusLabels[invoice.status] ?? invoice.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actiuni rapide</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link
              href="/invoices/new"
              className="flex items-center gap-3 rounded-md border p-3 hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Factura noua</p>
                <p className="text-xs text-muted-foreground">Creeaza o factura noua</p>
              </div>
            </Link>
            <Link
              href="/clients"
              className="flex items-center gap-3 rounded-md border p-3 hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Client nou</p>
                <p className="text-xs text-muted-foreground">Adauga un client nou</p>
              </div>
            </Link>
            <Link
              href="/payments"
              className="flex items-center gap-3 rounded-md border p-3 hover:bg-gray-50 transition-colors"
            >
              <CreditCard className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Inregistreaza plata</p>
                <p className="text-xs text-muted-foreground">Inregistreaza o plata primita</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
