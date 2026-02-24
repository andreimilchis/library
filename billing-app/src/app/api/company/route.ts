import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { companySchema } from "@/lib/validators";

export async function GET() {
  const company = await prisma.company.findFirst({
    include: { bankAccounts: true, invoiceSeries: true },
  });

  if (!company) {
    return NextResponse.json(null);
  }

  return NextResponse.json(company);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = companySchema.parse(body);

    let company = await prisma.company.findFirst();

    if (company) {
      company = await prisma.company.update({
        where: { id: company.id },
        data: validated,
      });
    } else {
      company = await prisma.company.create({ data: validated });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Company update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update" },
      { status: 400 }
    );
  }
}
