import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

async function getInvoices(search?: string, status?: string) {
  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { seriesPrefix: { contains: search, mode: "insensitive" } },
      { client: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  return prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { name: true } },
    },
    take: 100,
  });
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const invoices = await getInvoices(params.search, params.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Facturi</h1>
          <p className="text-muted-foreground">
            Gestioneaza facturile emise
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Factura noua
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        <form className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              name="search"
              defaultValue={params.search}
              placeholder="Cauta facturi..."
              className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            name="status"
            defaultValue={params.status}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Toate statusurile</option>
            <option value="DRAFT">Ciorna</option>
            <option value="SENT">Trimisa</option>
            <option value="PAID">Platita</option>
            <option value="PARTIALLY_PAID">Partial platita</option>
            <option value="OVERDUE">Restanta</option>
            <option value="CANCELLED">Anulata</option>
          </select>
          <button
            type="submit"
            className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
          >
            Filtreaza
          </button>
        </form>
      </div>

      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nu exista facturi.</p>
          <Link href="/invoices/new" className="text-sm text-blue-600 hover:underline">
            Creeaza prima factura
          </Link>
        </div>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numar</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Data emitere</TableHead>
                <TableHead>Data scadenta</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
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
                  <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                  <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(invoice.total, invoice.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[invoice.status] ?? "secondary"}>
                      {statusLabels[invoice.status] ?? invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Detalii
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
