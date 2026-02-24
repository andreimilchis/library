import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

async function getClients(search?: string) {
  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { cui: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.client.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { invoices: true } },
    },
  });
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const clients = await getClients(params.search);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clienti</h1>
          <p className="text-muted-foreground">
            Gestioneaza clientii si datele lor fiscale
          </p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Client nou
        </Link>
      </div>

      <form className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            name="search"
            defaultValue={params.search}
            placeholder="Cauta dupa nume sau CUI..."
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

      {clients.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nu exista clienti.</p>
          <Link href="/clients/new" className="text-sm text-blue-600 hover:underline">
            Adauga primul client
          </Link>
        </div>
      ) : (
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nume</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>CUI</TableHead>
                <TableHead>Oras</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Facturi</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/clients/${client.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {client.name}
                    </Link>
                    {client.isBadPayer && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Rau platnic
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{client.type}</Badge>
                  </TableCell>
                  <TableCell>{client.cui || "-"}</TableCell>
                  <TableCell>{client.city || "-"}</TableCell>
                  <TableCell>{client.email || "-"}</TableCell>
                  <TableCell>{client._count.invoices}</TableCell>
                  <TableCell>
                    <Link
                      href={`/clients/${client.id}`}
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
