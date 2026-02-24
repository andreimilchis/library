import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const invoiceId = searchParams.get("invoiceId");

  const where: Record<string, unknown> = {};
  if (invoiceId) where.invoiceId = invoiceId;

  const payments = await prisma.payment.findMany({
    where,
    orderBy: { paymentDate: "desc" },
    include: {
      invoice: {
        select: { id: true, seriesPrefix: true, number: true, total: true, currency: true },
      },
      client: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(payments);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = paymentSchema.parse(body);

    const invoice = await prisma.invoice.findUnique({
      where: { id: validated.invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = invoice.total - totalPaid;

    if (validated.amount > remaining + 0.01) {
      return NextResponse.json(
        { error: `Suma depaseste restul de plata (${remaining.toFixed(2)} ${invoice.currency})` },
        { status: 400 }
      );
    }

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          companyId: invoice.companyId,
          invoiceId: invoice.id,
          clientId: invoice.clientId,
          amount: validated.amount,
          currency: validated.currency,
          exchangeRate: validated.exchangeRate,
          paymentDate: new Date(validated.paymentDate),
          paymentMethod: validated.paymentMethod,
          reference: validated.reference,
          notes: validated.notes,
        },
      });

      // Update invoice status
      const newTotalPaid = totalPaid + validated.amount;
      let newStatus = invoice.status;
      if (newTotalPaid >= invoice.total - 0.01) {
        newStatus = "PAID";
      } else if (newTotalPaid > 0) {
        newStatus = "PARTIALLY_PAID";
      }

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: newStatus },
      });

      return p;
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Create payment error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment" },
      { status: 400 }
    );
  }
}
