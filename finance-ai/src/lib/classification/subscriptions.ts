/**
 * Subscription Detection Engine
 *
 * Detects recurring payments by analyzing transaction patterns
 * and flags them as subscriptions.
 */

import { prisma } from "@/lib/db";

interface DetectedSubscription {
  merchantName: string;
  amount: number;
  currency: string;
  billingCycle: "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
  transactionIds: string[];
}

export async function detectSubscriptions(): Promise<DetectedSubscription[]> {
  // Find transactions grouped by merchant that appear at regular intervals
  const expenses = await prisma.transaction.findMany({
    where: {
      direction: "EXPENSE",
      merchantName: { not: null },
    },
    orderBy: { transactionDate: "asc" },
  });

  // Group by merchant name
  const merchantGroups = new Map<string, typeof expenses>();
  for (const tx of expenses) {
    if (!tx.merchantName) continue;
    const key = tx.merchantName.toLowerCase();
    if (!merchantGroups.has(key)) {
      merchantGroups.set(key, []);
    }
    merchantGroups.get(key)!.push(tx);
  }

  const detected: DetectedSubscription[] = [];

  for (const [, transactions] of merchantGroups) {
    if (transactions.length < 2) continue;

    // Check if amounts are similar (within 5% tolerance)
    const amounts = transactions.map((t) => t.amount);
    const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const allSimilar = amounts.every(
      (a) => Math.abs(a - avgAmount) / avgAmount < 0.05
    );

    if (!allSimilar) continue;

    // Check intervals between transactions
    const intervals: number[] = [];
    for (let i = 1; i < transactions.length; i++) {
      const diff =
        transactions[i].transactionDate.getTime() -
        transactions[i - 1].transactionDate.getTime();
      intervals.push(diff / (1000 * 60 * 60 * 24)); // Convert to days
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    let billingCycle: DetectedSubscription["billingCycle"] | null = null;

    if (avgInterval >= 5 && avgInterval <= 10) billingCycle = "WEEKLY";
    else if (avgInterval >= 25 && avgInterval <= 35) billingCycle = "MONTHLY";
    else if (avgInterval >= 80 && avgInterval <= 100) billingCycle = "QUARTERLY";
    else if (avgInterval >= 350 && avgInterval <= 380) billingCycle = "YEARLY";

    if (billingCycle) {
      detected.push({
        merchantName: transactions[0].merchantName!,
        amount: avgAmount,
        currency: transactions[0].currency,
        billingCycle,
        transactionIds: transactions.map((t) => t.id),
      });
    }
  }

  return detected;
}

export async function saveDetectedSubscriptions(): Promise<number> {
  const detected = await detectSubscriptions();
  let saved = 0;

  for (const sub of detected) {
    // Check if subscription already exists
    const existing = await prisma.subscription.findFirst({
      where: {
        merchantName: { equals: sub.merchantName, mode: "insensitive" },
        isActive: true,
      },
    });

    if (existing) continue;

    // Calculate next billing date
    const lastTransaction = await prisma.transaction.findFirst({
      where: { id: { in: sub.transactionIds } },
      orderBy: { transactionDate: "desc" },
    });

    let nextBillingDate: Date | undefined;
    if (lastTransaction) {
      const d = new Date(lastTransaction.transactionDate);
      switch (sub.billingCycle) {
        case "WEEKLY":
          d.setDate(d.getDate() + 7);
          break;
        case "MONTHLY":
          d.setMonth(d.getMonth() + 1);
          break;
        case "QUARTERLY":
          d.setMonth(d.getMonth() + 3);
          break;
        case "YEARLY":
          d.setFullYear(d.getFullYear() + 1);
          break;
      }
      nextBillingDate = d;
    }

    const subscription = await prisma.subscription.create({
      data: {
        merchantName: sub.merchantName,
        amount: sub.amount,
        currency: sub.currency,
        billingCycle: sub.billingCycle,
        nextBillingDate,
      },
    });

    // Link transactions to subscription
    await prisma.transaction.updateMany({
      where: { id: { in: sub.transactionIds } },
      data: {
        isSubscription: true,
        subscriptionId: subscription.id,
      },
    });

    // Create alert for newly detected subscription
    await prisma.alert.create({
      data: {
        type: "SUBSCRIPTION_DETECTED",
        title: `New subscription detected: ${sub.merchantName}`,
        message: `Detected a ${sub.billingCycle.toLowerCase()} subscription of ${sub.amount} ${sub.currency} to ${sub.merchantName}.`,
        severity: "INFO",
      },
    });

    saved++;
  }

  return saved;
}
