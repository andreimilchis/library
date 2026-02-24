import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validators";
import { computeLineTotals } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const clientId = searchParams.get("clientId");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (clientId) where.clientId = clientId;

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, name: true } },
      series: { select: { prefix: true } },
      _count: { select: { payments: true } },
    },
  });

  return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = invoiceSchema.parse(body);

    const company = await prisma.company.findFirst();
    if (!company) {
      return NextResponse.json({ error: "No company configured" }, { status: 400 });
    }

    // Get series and increment number
    const series = await prisma.invoiceSeries.findUnique({
      where: { id: validated.seriesId },
    });

    if (!series) {
      return NextResponse.json({ error: "Invoice series not found" }, { status: 400 });
    }

    const nextNumber = series.currentNumber + 1;

    // Calculate line totals
    let subtotal = 0;
    let totalTva = 0;
    let discountTotal = 0;

    const processedLines = validated.lines.map((line, index) => {
      const computed = computeLineTotals(
        line.quantity,
        line.unitPrice,
        line.tvaRate,
        line.discountType,
        line.discountValue
      );

      if (line.discountType && line.discountValue) {
        const rawSubtotal = line.quantity * line.unitPrice;
        if (line.discountType === "PERCENTAGE") {
          discountTotal += rawSubtotal * (line.discountValue / 100);
        } else {
          discountTotal += line.discountValue;
        }
      }

      subtotal += computed.subtotal;
      totalTva += computed.tvaAmount;

      return {
        productId: line.productId || undefined,
        description: line.description,
        quantity: line.quantity,
        unitOfMeasure: line.unitOfMeasure,
        unitPrice: line.unitPrice,
        tvaRate: line.tvaRate,
        tvaAmount: computed.tvaAmount,
        lineTotal: computed.lineTotal,
        discountType: line.discountType || undefined,
        discountValue: line.discountValue || undefined,
        orderIndex: index,
      };
    });

    const total = subtotal + totalTva;

    // Create invoice in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // Update series counter
      await tx.invoiceSeries.update({
        where: { id: series.id },
        data: { currentNumber: nextNumber },
      });

      // Create invoice with lines
      const inv = await tx.invoice.create({
        data: {
          companyId: company.id,
          seriesId: series.id,
          seriesPrefix: series.prefix,
          number: nextNumber,
          type: validated.type,
          clientId: validated.clientId,
          issueDate: new Date(validated.issueDate),
          dueDate: new Date(validated.dueDate),
          deliveryDate: validated.deliveryDate ? new Date(validated.deliveryDate) : undefined,
          currency: validated.currency,
          exchangeRate: validated.exchangeRate,
          language: validated.language,
          notes: validated.notes,
          paymentMethod: validated.paymentMethod,
          reverseCharge: validated.reverseCharge,
          subtotal: Math.round(subtotal * 100) / 100,
          tvaAmount: Math.round(totalTva * 100) / 100,
          total: Math.round(total * 100) / 100,
          discountTotal: Math.round(discountTotal * 100) / 100,
          lines: {
            create: processedLines,
          },
        },
        include: {
          client: true,
          lines: { include: { product: true } },
        },
      });

      return inv;
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create invoice" },
      { status: 400 }
    );
  }
}
