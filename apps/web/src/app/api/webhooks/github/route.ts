import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { GitHubConnector } from '@eye1/connectors';
import { ingestRawEvent, buildNormalizationJob } from '@eye1/ingestion';
import { getDb, schema } from '@eye1/db';
import { eq, and } from 'drizzle-orm';
import { PIPELINE_PRIORITY } from '@eye1/common';

const connector = new GitHubConnector();

export async function POST(request: Request) {
  try {
    // Read raw body for signature verification
    const rawBody = Buffer.from(await request.arrayBuffer());
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Validate webhook signature
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('GITHUB_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    const validation = connector.validateWebhook(
      { headers, body: JSON.parse(rawBody.toString()), rawBody },
      webhookSecret,
    );

    if (!validation.valid) {
      console.error('Invalid webhook signature:', validation.error);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Find active GitHub connection
    const db = getDb();
    const [connection] = await db
      .select()
      .from(schema.sourceConnections)
      .where(
        and(
          eq(schema.sourceConnections.sourceType, 'github'),
          eq(schema.sourceConnections.status, 'connected'),
        ),
      )
      .limit(1);

    if (!connection) {
      return NextResponse.json({ error: 'No active GitHub connection' }, { status: 404 });
    }

    // Parse webhook events
    const events = connector.handleWebhook({
      headers,
      body: JSON.parse(rawBody.toString()),
      rawBody,
    });

    // Ingest each event
    for (const event of events) {
      const ingestEvent = {
        id: randomUUID(),
        sourceType: event.sourceType,
        eventType: event.eventType,
        externalId: event.externalId,
        payload: event.payload,
        receivedAt: new Date().toISOString(),
        deliveryId: validation.deliveryId,
      };

      await ingestRawEvent(ingestEvent, {
        sourceConnectionId: connection.id,
        priority: PIPELINE_PRIORITY.WEBHOOK,
      });
    }

    return NextResponse.json({
      received: true,
      eventsProcessed: events.length,
      deliveryId: validation.deliveryId,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
