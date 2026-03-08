import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const accounts = await prisma.account.findMany({
    where: { state: "active" },
  });

  const balances = accounts.map((a) => ({
    id: a.id,
    name: a.name,
    balance: a.balance,
    currency: a.currency,
  }));

  const totalByCurrency = new Map<string, number>();
  for (const a of accounts) {
    totalByCurrency.set(a.currency, (totalByCurrency.get(a.currency) || 0) + a.balance);
  }

  return NextResponse.json({
    accounts: balances,
    totals: Object.fromEntries(totalByCurrency),
  });
}
