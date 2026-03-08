/**
 * AI Financial Agent
 *
 * Uses Claude API to analyze financial data and provide intelligent
 * insights, recommendations, and answer natural language questions.
 */

import { prisma } from "@/lib/db";
import {
  getFinancialOverview,
  getSpendByCategory,
  getDailySpend,
  getSubscriptionSpend,
  getTopMerchants,
  getMonthlyTrend,
} from "@/lib/analytics/engine";
import { checkBudgets } from "@/lib/analytics/budgets";
import { subDays, subWeeks, startOfMonth } from "date-fns";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

interface FinancialContext {
  overview: Awaited<ReturnType<typeof getFinancialOverview>>;
  categorySpend: Awaited<ReturnType<typeof getSpendByCategory>>;
  dailySpend: Awaited<ReturnType<typeof getDailySpend>>;
  subscriptions: Awaited<ReturnType<typeof getSubscriptionSpend>>;
  topMerchants: Awaited<ReturnType<typeof getTopMerchants>>;
  monthlyTrend: Awaited<ReturnType<typeof getMonthlyTrend>>;
  budgetStatuses: Awaited<ReturnType<typeof checkBudgets>>;
  recentTransactions: Array<{
    merchantName: string | null;
    amount: number;
    currency: string;
    direction: string;
    transactionDate: Date;
    category: { name: string } | null;
  }>;
}

async function gatherFinancialContext(): Promise<FinancialContext> {
  const [
    overview,
    categorySpend,
    dailySpend,
    subscriptions,
    topMerchants,
    monthlyTrend,
    budgetStatuses,
    recentTransactions,
  ] = await Promise.all([
    getFinancialOverview(),
    getSpendByCategory(),
    getDailySpend(30),
    getSubscriptionSpend(),
    getTopMerchants(10),
    getMonthlyTrend(6),
    checkBudgets(),
    prisma.transaction.findMany({
      where: { transactionDate: { gte: subDays(new Date(), 30) } },
      include: { category: true },
      orderBy: { transactionDate: "desc" },
      take: 50,
    }),
  ]);

  return {
    overview,
    categorySpend,
    dailySpend,
    subscriptions,
    topMerchants,
    monthlyTrend,
    budgetStatuses,
    recentTransactions: recentTransactions.map((t) => ({
      merchantName: t.merchantName,
      amount: t.amount,
      currency: t.currency,
      direction: t.direction,
      transactionDate: t.transactionDate,
      category: t.category ? { name: t.category.name } : null,
    })),
  };
}

function buildSystemPrompt(context: FinancialContext): string {
  return `You are an AI Financial Agent (CFO Assistant). You analyze the user's financial data from their Revolut account and provide intelligent insights, recommendations, and answers to financial questions.

You have access to the following real-time financial data:

## Current Month Overview
- Total Income: ${context.overview.totalIncome.toFixed(2)} RON
- Total Expenses: ${context.overview.totalExpenses.toFixed(2)} RON
- Net Cashflow: ${context.overview.netCashflow.toFixed(2)} RON
- Transaction Count: ${context.overview.transactionCount}

## Spending by Category
${context.categorySpend.map((c) => `- ${c.categoryName}: ${c.total.toFixed(2)} RON (${c.percentage.toFixed(1)}%)`).join("\n")}

## Top Merchants (Current Month)
${context.topMerchants.map((m) => `- ${m.merchant}: ${m.total.toFixed(2)} RON (${m.count} transactions)`).join("\n")}

## Active Subscriptions
Total Monthly: ${context.subscriptions.totalMonthly.toFixed(2)} RON
Total Yearly: ${context.subscriptions.totalYearly.toFixed(2)} RON
${context.subscriptions.subscriptions.map((s) => `- ${s.merchantName}: ${s.amount.toFixed(2)} ${s.currency} (${s.billingCycle})`).join("\n")}

## Monthly Trend (Last 6 Months)
${context.monthlyTrend.map((m) => `- ${m.month}: Income ${m.income.toFixed(2)}, Expenses ${m.expenses.toFixed(2)}, Net ${m.net.toFixed(2)}`).join("\n")}

## Budget Status
${context.budgetStatuses.length > 0
    ? context.budgetStatuses.map((b) => `- ${b.name}: ${b.spent.toFixed(2)}/${b.limit.toFixed(2)} RON (${b.percentUsed.toFixed(0)}%) ${b.isExceeded ? "⚠️ EXCEEDED" : "✅"}`).join("\n")
    : "No budgets set."}

## Recent Transactions (Last 30 Days)
${context.recentTransactions.slice(0, 20).map((t) => `- ${t.transactionDate.toISOString().split("T")[0]} | ${t.direction} | ${t.merchantName || "N/A"} | ${t.amount.toFixed(2)} ${t.currency} | ${t.category?.name || "Uncategorized"}`).join("\n")}

## Instructions
- Answer in the same language as the user's question
- Provide specific numbers and data from the context above
- Give actionable recommendations when appropriate
- Flag any concerning patterns (budget overages, unusual spending)
- Be concise but thorough
- Format monetary values with currency
- Use bullet points for lists`;
}

export async function chat(
  messages: AIMessage[],
  userMessage: string
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Try to gather financial context (may fail if DB is unavailable)
  let context: FinancialContext | null = null;
  try {
    context = await gatherFinancialContext();
  } catch (dbError) {
    console.error("Failed to gather financial context:", dbError);
  }

  if (!apiKey) {
    if (!context) {
      return "I'm having trouble connecting to the database. Please check your database configuration and try again.";
    }
    return generateFallbackResponse(userMessage, context);
  }

  if (!context) {
    // Still try Claude without financial data
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: "You are an AI Financial Agent. The database is temporarily unavailable, so you cannot access the user's financial data right now. Let the user know and offer to help once the connection is restored.",
        messages: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${error}`);
    }

    const data = (await response.json()) as {
      content: Array<{ type: string; text: string }>;
    };
    return data.content[0]?.text || "I couldn't generate a response.";
  }

  const systemPrompt = buildSystemPrompt(context);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
  };
  return data.content[0]?.text || "I couldn't generate a response.";
}

async function generateFallbackResponse(question: string, context: FinancialContext): Promise<string> {
  const lower = question.toLowerCase();

  if (lower.includes("cheltuieli") || lower.includes("expenses") || lower.includes("spent")) {
    if (lower.includes("săptămân") || lower.includes("week")) {
      const weekAgo = subDays(new Date(), 14);
      const twoWeeksTransactions = context.recentTransactions.filter(
        (t) => t.direction === "EXPENSE" && t.transactionDate >= weekAgo
      );
      const total = twoWeeksTransactions.reduce((s, t) => s + t.amount, 0);
      return `In the last two weeks, you had ${twoWeeksTransactions.length} expenses totaling ${total.toFixed(2)} RON.\n\nTop expenses:\n${twoWeeksTransactions.slice(0, 5).map((t) => `- ${t.merchantName || "Unknown"}: ${t.amount.toFixed(2)} ${t.currency}`).join("\n")}`;
    }

    return `This month's expenses: ${context.overview.totalExpenses.toFixed(2)} RON across ${context.categorySpend.length} categories.\n\nTop categories:\n${context.categorySpend.slice(0, 5).map((c) => `- ${c.categoryName}: ${c.total.toFixed(2)} RON (${c.percentage.toFixed(1)}%)`).join("\n")}`;
  }

  if (lower.includes("abonament") || lower.includes("subscription")) {
    if (context.subscriptions.subscriptions.length === 0) {
      return "No active subscriptions detected yet.";
    }
    return `Active subscriptions (${context.subscriptions.totalMonthly.toFixed(2)} RON/month):\n${context.subscriptions.subscriptions.map((s) => `- ${s.merchantName}: ${s.amount.toFixed(2)} ${s.currency} (${s.billingCycle})`).join("\n")}`;
  }

  if (lower.includes("buget") || lower.includes("budget")) {
    if (context.budgetStatuses.length === 0) {
      return "No budgets configured. Set up budgets in the Budgets section.";
    }
    return `Budget status:\n${context.budgetStatuses.map((b) => `- ${b.name}: ${b.spent.toFixed(2)}/${b.limit.toFixed(2)} RON (${b.percentUsed.toFixed(0)}%) ${b.isExceeded ? "⚠️ EXCEEDED" : "✅ OK"}`).join("\n")}`;
  }

  if (lower.includes("reduc") || lower.includes("reduce") || lower.includes("save") || lower.includes("cost")) {
    const topCategories = context.categorySpend.slice(0, 3);
    return `Your top spending categories:\n${topCategories.map((c) => `- ${c.categoryName}: ${c.total.toFixed(2)} RON`).join("\n")}\n\nSubscription spend: ${context.subscriptions.totalMonthly.toFixed(2)} RON/month\n\nRecommendations:\n- Review your top spending categories for potential savings\n- Check if any subscriptions are redundant\n- Set budget limits to stay accountable`;
  }

  return `Financial Overview (Current Month):\n- Income: ${context.overview.totalIncome.toFixed(2)} RON\n- Expenses: ${context.overview.totalExpenses.toFixed(2)} RON\n- Net: ${context.overview.netCashflow.toFixed(2)} RON\n\nAsk me specific questions like:\n- "What are my biggest expenses?"\n- "What subscriptions do I have?"\n- "How can I reduce costs?"`;
}

export async function generateInsights(): Promise<string[]> {
  const context = await gatherFinancialContext();
  const insights: string[] = [];

  // Check budget overages
  for (const budget of context.budgetStatuses) {
    if (budget.isExceeded) {
      insights.push(`⚠️ You exceeded your ${budget.name} budget by ${(budget.spent - budget.limit).toFixed(2)} RON this month.`);
    } else if (budget.percentUsed > 80) {
      insights.push(`📊 You've used ${budget.percentUsed.toFixed(0)}% of your ${budget.name} budget.`);
    }
  }

  // Check spending trends
  if (context.monthlyTrend.length >= 2) {
    const current = context.monthlyTrend[context.monthlyTrend.length - 1];
    const previous = context.monthlyTrend[context.monthlyTrend.length - 2];
    if (current && previous && current.expenses > previous.expenses * 1.2) {
      const increase = ((current.expenses - previous.expenses) / previous.expenses) * 100;
      insights.push(`📈 Your expenses increased ${increase.toFixed(0)}% compared to last month.`);
    }
  }

  // Subscription insights
  if (context.subscriptions.totalMonthly > 0) {
    insights.push(`💳 You're paying ${context.subscriptions.totalMonthly.toFixed(2)} RON/month in subscriptions (${context.subscriptions.totalYearly.toFixed(2)} RON/year).`);
  }

  // Top merchant insight
  if (context.topMerchants.length > 0) {
    const top = context.topMerchants[0];
    insights.push(`🏪 Your biggest merchant this month: ${top.merchant} (${top.total.toFixed(2)} RON).`);
  }

  if (insights.length === 0) {
    insights.push("✅ Your finances look good this month. Keep it up!");
  }

  return insights;
}
