import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature, parseWebhookEvent, WEBHOOK_EVENTS } from "@/lib/revolut/webhook";
import { getActiveRevolutClient, processRevolutTransaction } from "@/lib/revolut/sync";
import { classifyTransaction } from "@/lib/classification/engine";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const secret = process.env.REVOLUT_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const body = await request.text();
  const signature = request.headers.get("x-revolut-signature") || "";

  // Verify webhook signature
  if (!verifyWebhookSignature(body, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = parseWebhookEvent(JSON.parse(body));

    switch (event.event) {
      case WEBHOOK_EVENTS.TRANSACTION_CREATED:
      case WEBHOOK_EVENTS.TRANSACTION_STATE_CHANGED: {
        const client = await getActiveRevolutClient();
        if (client) {
          const transaction = await client.getTransaction(event.data.id);
          await processRevolutTransaction(transaction);

          // Auto-classify newly created transactions
          const dbTransaction = await prisma.transaction.findFirst({
            where: { revolutId: { startsWith: event.data.id } },
          });
          if (dbTransaction) {
            const result = await classifyTransaction(dbTransaction.id);
            await prisma.transaction.update({
              where: { id: dbTransaction.id },
              data: {
                categoryId: result.categoryId,
                classificationStatus: result.status,
              },
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
