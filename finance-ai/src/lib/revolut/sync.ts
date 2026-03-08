/**
 * Revolut Data Sync Service
 *
 * Handles syncing accounts and transactions from Revolut to local database.
 */

import { prisma } from "@/lib/db";
import { RevolutClient, type RevolutTransaction } from "./client";

export async function getActiveRevolutClient(): Promise<RevolutClient | null> {
  const connection = await prisma.revolutConnection.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: "desc" },
  });

  if (!connection) return null;

  // Check if token is expired
  if (connection.expiresAt < new Date()) {
    try {
      const tokens = await RevolutClient.refreshAccessToken(connection.refreshToken);
      await prisma.revolutConnection.update({
        where: { id: connection.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
      });
      return new RevolutClient(tokens.access_token);
    } catch {
      await prisma.revolutConnection.update({
        where: { id: connection.id },
        data: { isActive: false },
      });
      return null;
    }
  }

  return new RevolutClient(connection.accessToken);
}

export async function syncAccounts(): Promise<number> {
  const client = await getActiveRevolutClient();
  if (!client) throw new Error("No active Revolut connection");

  const revolutAccounts = await client.getAccounts();
  let synced = 0;

  for (const ra of revolutAccounts) {
    await prisma.account.upsert({
      where: { revolutId: ra.id },
      update: {
        name: ra.name,
        balance: ra.balance,
        currency: ra.currency,
        state: ra.state,
      },
      create: {
        revolutId: ra.id,
        name: ra.name,
        balance: ra.balance,
        currency: ra.currency,
        state: ra.state,
      },
    });
    synced++;
  }

  return synced;
}

export async function syncTransactions(from?: string, to?: string): Promise<number> {
  const client = await getActiveRevolutClient();
  if (!client) throw new Error("No active Revolut connection");

  const revolutTransactions = await client.getTransactions({ from, to, count: 1000 });
  let synced = 0;

  for (const rt of revolutTransactions) {
    await processRevolutTransaction(rt);
    synced++;
  }

  return synced;
}

export async function processRevolutTransaction(rt: RevolutTransaction): Promise<void> {
  for (const leg of rt.legs) {
    const account = await prisma.account.findUnique({
      where: { revolutId: leg.account_id },
    });

    if (!account) continue;

    const direction = leg.amount >= 0 ? "INCOME" : "EXPENSE";
    const revolutId = `${rt.id}-${leg.leg_id}`;

    const existing = await prisma.transaction.findUnique({
      where: { revolutId },
    });

    if (existing) continue;

    await prisma.transaction.create({
      data: {
        revolutId,
        accountId: account.id,
        amount: Math.abs(leg.amount),
        currency: leg.currency,
        direction,
        merchantName: rt.merchant?.name || null,
        merchantCategory: rt.merchant?.category_code || null,
        description: leg.description || rt.reference || null,
        reference: rt.reference || null,
        transactionDate: new Date(rt.completed_at || rt.created_at),
        classificationStatus: "PENDING",
      },
    });
  }
}
