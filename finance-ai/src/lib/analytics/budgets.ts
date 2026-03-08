/**
 * Budget & Alert System
 *
 * Manages budgets and triggers alerts when thresholds are exceeded.
 */

import { prisma } from "@/lib/db";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from "date-fns";

interface BudgetStatus {
  budgetId: string;
  name: string;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  isExceeded: boolean;
}

export async function checkBudgets(): Promise<BudgetStatus[]> {
  const budgets = await prisma.budget.findMany({
    where: { isActive: true },
  });

  const statuses: BudgetStatus[] = [];

  for (const budget of budgets) {
    const { from, to } = getBudgetPeriod(budget.period);

    const where: Record<string, unknown> = {
      direction: "EXPENSE" as const,
      transactionDate: { gte: from, lte: to },
    };

    if (budget.categoryId) {
      where.categoryId = budget.categoryId;
    }

    const transactions = await prisma.transaction.findMany({ where });
    const spent = transactions.reduce((sum, t) => sum + t.amount, 0);

    const status: BudgetStatus = {
      budgetId: budget.id,
      name: budget.name,
      limit: budget.amount,
      spent,
      remaining: budget.amount - spent,
      percentUsed: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
      isExceeded: spent > budget.amount,
    };

    statuses.push(status);

    // Create alert if exceeded
    if (status.isExceeded) {
      const existingAlert = await prisma.alert.findFirst({
        where: {
          type: "BUDGET_EXCEEDED",
          budgetId: budget.id,
          createdAt: { gte: from },
        },
      });

      if (!existingAlert) {
        await prisma.alert.create({
          data: {
            type: "BUDGET_EXCEEDED",
            title: `Budget exceeded: ${budget.name}`,
            message: `You have spent ${spent.toFixed(2)} ${budget.currency} out of your ${budget.amount.toFixed(2)} ${budget.currency} budget for ${budget.name}. That's ${status.percentUsed.toFixed(0)}% of your limit.`,
            severity: "WARNING",
            budgetId: budget.id,
          },
        });
      }
    }
  }

  return statuses;
}

function getBudgetPeriod(period: string): { from: Date; to: Date } {
  const now = new Date();
  switch (period) {
    case "DAILY":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "WEEKLY":
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
    case "MONTHLY":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "QUARTERLY": {
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      const from = new Date(now.getFullYear(), quarterMonth, 1);
      const to = new Date(now.getFullYear(), quarterMonth + 3, 0, 23, 59, 59, 999);
      return { from, to };
    }
    case "YEARLY":
      return {
        from: new Date(now.getFullYear(), 0, 1),
        to: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
    default:
      return { from: startOfMonth(now), to: endOfMonth(now) };
  }
}

export async function checkUnusualSpending(): Promise<void> {
  const currentMonth = await prisma.transaction.findMany({
    where: {
      direction: "EXPENSE",
      transactionDate: {
        gte: startOfMonth(new Date()),
        lte: endOfMonth(new Date()),
      },
    },
    include: { category: true },
  });

  // Group current month by category
  const currentByCategory = new Map<string, number>();
  for (const tx of currentMonth) {
    const key = tx.category?.name || "Uncategorized";
    currentByCategory.set(key, (currentByCategory.get(key) || 0) + tx.amount);
  }

  // Compare with average of last 3 months
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const previousMonths = await prisma.transaction.findMany({
    where: {
      direction: "EXPENSE",
      transactionDate: {
        gte: threeMonthsAgo,
        lt: startOfMonth(new Date()),
      },
    },
    include: { category: true },
  });

  const avgByCategory = new Map<string, number>();
  for (const tx of previousMonths) {
    const key = tx.category?.name || "Uncategorized";
    avgByCategory.set(key, (avgByCategory.get(key) || 0) + tx.amount / 3);
  }

  // Check for unusual spending (>50% increase)
  for (const [category, currentSpend] of currentByCategory) {
    const avgSpend = avgByCategory.get(category) || 0;
    if (avgSpend > 0 && currentSpend > avgSpend * 1.5) {
      const increase = ((currentSpend - avgSpend) / avgSpend) * 100;

      await prisma.alert.create({
        data: {
          type: "UNUSUAL_SPENDING",
          title: `Unusual spending in ${category}`,
          message: `Your spending in ${category} is ${increase.toFixed(0)}% higher than your 3-month average. Current: ${currentSpend.toFixed(2)}, Average: ${avgSpend.toFixed(2)}.`,
          severity: increase > 100 ? "CRITICAL" : "WARNING",
        },
      });
    }
  }
}
