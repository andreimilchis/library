import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyId = searchParams.get("companyId");
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (companyId) where.companyId = companyId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { cui: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      _count: { select: { invoices: true } },
    },
  });

  return NextResponse.json(clients);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = clientSchema.parse(body);

    // For now use first company - multi-company support comes later
    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "No company configured" }, { status: 400 });
    }

    const client = await prisma.client.create({
      data: {
        ...validated,
        companyId: company.id,
      },
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create client" },
      { status: 400 }
    );
  }
}
