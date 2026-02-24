import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getProducts(search?: string) {
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.product.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const products = await getProducts(params.search);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produse & Servicii</h1>
          <p className="text-muted-foreground">
            Catalogul de produse si servicii
          </p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Produs / Serviciu nou
        </Link>
      </div>

      <form className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            name="search"
            defaultValue={params.search}
            placeholder="Cauta dupa nume sau SKU..."
            className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200"
        >
          Cauta
        </button>
      </form>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nu exista produse sau servicii.</p>
          <Link href="/products/new" className="text-sm text-blue-600 hover:underline">
            Adauga primul produs
          </Link>
        </div>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Pret</TableHead>
                <TableHead>TVA</TableHead>
                <TableHead>UM</TableHead>
                <TableHead>Stoc</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant={product.type === "PRODUCT" ? "default" : "secondary"}>
                      {product.type === "PRODUCT" ? "Produs" : "Serviciu"}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.sku || "-"}</TableCell>
                  <TableCell>{formatCurrency(product.defaultPrice, product.currency)}</TableCell>
                  <TableCell>{product.tvaRate}%</TableCell>
                  <TableCell>{product.unitOfMeasure}</TableCell>
                  <TableCell>
                    {product.stockTrackingEnabled ? (
                      <span
                        className={
                          product.minStockAlert && product.currentStock <= product.minStockAlert
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {product.currentStock}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isActive ? "success" : "outline"}>
                      {product.isActive ? "Activ" : "Inactiv"}
                    </Badge>
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
