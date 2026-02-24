import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

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

const paymentMethodLabels: Record<string, string> = {
  TRANSFER_BANCAR: "Transfer bancar",
  NUMERAR: "Numerar",
  CARD: "Card",
  OP: "Ordin de plata",
  COMPENSARE: "Compensare",
};

async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      client: true,
      company: {
        include: { bankAccounts: true },
      },
      lines: {
        orderBy: { orderIndex: "asc" },
        include: { product: true },
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
  });
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await getInvoice(id);

  if (!invoice) {
    notFound();
  }

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = invoice.total - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {invoice.seriesPrefix}
              {String(invoice.number).padStart(4, "0")}
            </h1>
            <Badge variant={statusVariant[invoice.status] ?? "secondary"}>
              {statusLabels[invoice.status] ?? invoice.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Emisa la {formatDate(invoice.issueDate)} &middot; Scadenta {formatDate(invoice.dueDate)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/invoices/${invoice.id}/pdf`}
            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Descarca PDF
          </Link>
          <Link
            href={`/payments?invoiceId=${invoice.id}`}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            Inregistreaza plata
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Client</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{invoice.client.name}</p>
            {invoice.client.cui && <p className="text-sm text-muted-foreground">CUI: {invoice.client.cui}</p>}
            {invoice.client.address && <p className="text-sm text-muted-foreground">{invoice.client.address}</p>}
            {invoice.client.city && <p className="text-sm text-muted-foreground">{invoice.client.city}, {invoice.client.county}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Detalii factura</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Metoda plata: {paymentMethodLabels[invoice.paymentMethod] ?? invoice.paymentMethod}</p>
            <p>Moneda: {invoice.currency}</p>
            {invoice.currency !== "RON" && <p>Curs: {invoice.exchangeRate} RON</p>}
            {invoice.reverseCharge && <p className="text-orange-600 font-medium">Taxare inversa</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Totaluri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
            </div>
            {invoice.discountTotal > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-{formatCurrency(invoice.discountTotal, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>TVA:</span>
              <span>{formatCurrency(invoice.tvaAmount, invoice.currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-1">
              <span>Total:</span>
              <span>{formatCurrency(invoice.total, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Platit:</span>
              <span>{formatCurrency(totalPaid, invoice.currency)}</span>
            </div>
            {remaining > 0 && (
              <div className="flex justify-between font-medium text-red-600">
                <span>Ramas:</span>
                <span>{formatCurrency(remaining, invoice.currency)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Linii factura</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Descriere</TableHead>
                <TableHead>Cant.</TableHead>
                <TableHead>UM</TableHead>
                <TableHead>Pret unitar</TableHead>
                <TableHead>TVA %</TableHead>
                <TableHead>TVA</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lines.map((line, idx) => (
                <TableRow key={line.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <div>{line.description}</div>
                    {line.product && (
                      <div className="text-xs text-muted-foreground">
                        {line.product.sku && `SKU: ${line.product.sku}`}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{line.quantity}</TableCell>
                  <TableCell>{line.unitOfMeasure}</TableCell>
                  <TableCell>{formatCurrency(line.unitPrice, invoice.currency)}</TableCell>
                  <TableCell>{line.tvaRate}%</TableCell>
                  <TableCell>{formatCurrency(line.tvaAmount, invoice.currency)}</TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(line.lineTotal, invoice.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Observatii</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      {invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plati inregistrate</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Suma</TableHead>
                  <TableHead>Metoda</TableHead>
                  <TableHead>Referinta</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell>{paymentMethodLabels[payment.paymentMethod] ?? payment.paymentMethod}</TableCell>
                    <TableCell>{payment.reference || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
