import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const series = await prisma.invoiceSeries.findMany({
    orderBy: { prefix: "asc" },
  });
  return NextResponse.json(series);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "No company configured" }, { status: 400 });
    }

    const series = await prisma.invoiceSeries.create({
      data: {
        companyId: company.id,
        prefix: body.prefix,
        currentNumber: body.startNumber || 0,
        type: body.type || "FACTURA",
        isActive: true,
      },
    });

    return NextResponse.json(series, { status: 201 });
  } catch (error) {
    console.error("Create series error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create series" },
      { status: 400 }
    );
  }
}
