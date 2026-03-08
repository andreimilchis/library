/**
 * Financial Analytics Engine
 *
 * Calculates financial metrics, aggregations, and provides
 * query capabilities for the AI agent and dashboard.
 */

import { prisma } from "@/lib/db";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns";

export interface FinancialOverview {
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
  transactionCount: number;
  period: { from: Date; to: Date };
}

export interface CategorySpend {
  categoryId: string | null;
  categoryName: string;
  total: number;
  count: number;
  percentage: number;
}

export interface DailySpend {
  date: string;
  income: number;
  expenses: number;
  net: number;
}

export async function getFinancialOverview(
  from?: Date,
  to?: Date
): Promise<FinancialOverview> {
  const periodFrom = from || startOfMonth(new Date());
  const periodTo = to || endOfMonth(new Date());

  const transactions = await prisma.transaction.findMany({
    where: {
      transactionDate: {
        gte: periodFrom,
        lte: periodTo,
      },
    },
  });

  const totalIncome = transactions
    .filter((t) => t.direction === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.direction === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    totalExpenses,
    netCashflow: totalIncome - totalExpenses,
    transactionCount: transactions.length,
    period: { from: periodFrom, to: periodTo },
  };
}

export async function getSpendByCategory(
  from?: Date,
  to?: Date
): Promise<CategorySpend[]> {
  const periodFrom = from || startOfMonth(new Date());
  const periodTo = to || endOfMonth(new Date());

  const transactions = await prisma.transaction.findMany({
    where: {
      direction: "EXPENSE",
      transactionDate: {
        gte: periodFrom,
        lte: periodTo,
      },
    },
    include: { category: true },
  });

  const categoryMap = new Map<string, { name: string; total: number; count: number }>();

  for (const tx of transactions) {
    const key = tx.categoryId || "uncategorized";
    const name = tx.category?.name || "Uncategorized";
    const current = categoryMap.get(key) || { name, total: 0, count: 0 };
    current.total += tx.amount;
    current.count += 1;
    categoryMap.set(key, current);
  }

  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);

  return Array.from(categoryMap.entries())
    .map(([categoryId, data]) => ({
      categoryId: categoryId === "uncategorized" ? null : categoryId,
      categoryName: data.name,
      total: data.total,
      count: data.count,
      percentage: totalSpend > 0 ? (data.total / totalSpend) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export async function getDailySpend(days: number = 30): Promise<DailySpend[]> {
  const from = startOfDay(subDays(new Date(), days));
  const to = endOfDay(new Date());

  const transactions = await prisma.transaction.findMany({
    where: {
      transactionDate: { gte: from, lte: to },
    },
    orderBy: { transactionDate: "asc" },
  });

  const dailyMap = new Map<string, { income: number; expenses: number }>();

  for (const tx of transactions) {
    const dateKey = tx.transactionDate.toISOString().split("T")[0];
    const current = dailyMap.get(dateKey) || { income: 0, expenses: 0 };
    if (tx.direction === "INCOME") {
      current.income += tx.amount;
    } else {
      current.expenses += tx.amount;
    }
    dailyMap.set(dateKey, current);
  }

  return Array.from(dailyMap.entries()).map(([date, data]) => ({
    date,
    income: data.income,
    expenses: data.expenses,
    net: data.income - data.expenses,
  }));
}

export async function getMonthlyTrend(months: number = 6) {
  const from = startOfMonth(subMonths(new Date(), months - 1));
  const to = endOfMonth(new Date());

  const transactions = await prisma.transaction.findMany({
    where: {
      transactionDate: { gte: from, lte: to },
    },
  });

  const monthlyMap = new Map<string, { income: number; expenses: number }>();

  for (const tx of transactions) {
    const monthKey = `${tx.transactionDate.getFullYear()}-${String(tx.transactionDate.getMonth() + 1).padStart(2, "0")}`;
    const current = monthlyMap.get(monthKey) || { income: 0, expenses: 0 };
    if (tx.direction === "INCOME") {
      current.income += tx.amount;
    } else {
      current.expenses += tx.amount;
    }
    monthlyMap.set(monthKey, current);
  }

  return Array.from(monthlyMap.entries())
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export async function getSubscriptionSpend(): Promise<{
  totalMonthly: number;
  totalYearly: number;
  subscriptions: Array<{
    id: string;
    merchantName: string;
    amount: number;
    currency: string;
    billingCycle: string;
    monthlyEquivalent: number;
  }>;
}> {
  const subs = await prisma.subscription.findMany({
    where: { isActive: true },
  });

  const subscriptions = subs.map((s) => {
    let monthlyEquivalent = s.amount;
    switch (s.billingCycle) {
      case "WEEKLY":
        monthlyEquivalent = s.amount * 4.33;
        break;
      case "QUARTERLY":
        monthlyEquivalent = s.amount / 3;
        break;
      case "YEARLY":
        monthlyEquivalent = s.amount / 12;
        break;
    }

    return {
      id: s.id,
      merchantName: s.merchantName,
      amount: s.amount,
      currency: s.currency,
      billingCycle: s.billingCycle,
      monthlyEquivalent,
    };
  });

  const totalMonthly = subscriptions.reduce((sum, s) => sum + s.monthlyEquivalent, 0);

  return {
    totalMonthly,
    totalYearly: totalMonthly * 12,
    subscriptions,
  };
}

export async function getTopMerchants(limit: number = 10, from?: Date, to?: Date) {
  const periodFrom = from || startOfMonth(new Date());
  const periodTo = to || endOfMonth(new Date());

  const transactions = await prisma.transaction.findMany({
    where: {
      direction: "EXPENSE",
      merchantName: { not: null },
      transactionDate: { gte: periodFrom, lte: periodTo },
    },
  });

  const merchantMap = new Map<string, { total: number; count: number }>();

  for (const tx of transactions) {
    if (!tx.merchantName) continue;
    const current = merchantMap.get(tx.merchantName) || { total: 0, count: 0 };
    current.total += tx.amount;
    current.count += 1;
    merchantMap.set(tx.merchantName, current);
  }

  return Array.from(merchantMap.entries())
    .map(([merchant, data]) => ({ merchant, ...data }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}
