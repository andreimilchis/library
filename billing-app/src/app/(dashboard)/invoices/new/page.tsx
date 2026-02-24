import { prisma } from "@/lib/prisma";
import { InvoiceForm } from "@/components/invoice-form";

async function getData() {
  const [clients, products, series] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.invoiceSeries.findMany({ where: { isActive: true }, orderBy: { prefix: "asc" } }),
  ]);

  return { clients, products, series };
}

export default async function NewInvoicePage() {
  const { clients, products, series } = await getData();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Factura noua</h1>
        <p className="text-muted-foreground">
          Completeaza datele pentru a emite o factura noua
        </p>
      </div>
      <InvoiceForm clients={clients} products={products} series={series} />
    </div>
  );
}
