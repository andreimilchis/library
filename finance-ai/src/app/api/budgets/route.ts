import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkBudgets } from "@/lib/analytics/budgets";

export async function GET() {
  const statuses = await checkBudgets();
  const budgets = await prisma.budget.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ budgets, statuses });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, categoryId, amount, currency, period } = body;

    if (!name || !amount) {
      return NextResponse.json({ error: "Name and amount are required" }, { status: 400 });
    }

    const budget = await prisma.budget.create({
      data: {
        name,
        categoryId: categoryId || null,
        amount: parseFloat(amount),
        currency: currency || "RON",
        period: period || "MONTHLY",
      },
    });

    return NextResponse.json({ budget });
  } catch (error) {
    console.error("Budget creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Creation failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Budget ID required" }, { status: 400 });
  }

  await prisma.budget.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ message: "Budget deactivated" });
}
