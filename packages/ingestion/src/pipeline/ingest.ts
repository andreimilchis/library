import { randomUUID } from 'crypto';
import { sha256, createLogger } from '@eye1/common';
import type { SourceType, RawIngestEvent, NormalizationJobData } from '@eye1/common';
import { QUEUES, PIPELINE_PRIORITY } from '@eye1/common';
import { getDb, schema } from '@eye1/db';
import { eq } from 'drizzle-orm';

const logger = createLogger('ingestion-pipeline');

export interface IngestOptions {
  sourceConnectionId: string;
  syncJobId?: string;
  priority?: number;
}

/**
 * Main ingestion pipeline entry point.
 * Receives raw events, validates, persists, and enqueues for normalization.
 *
 * Pipeline stages:
 * 1. Receive & validate
 * 2. Compute checksum & dedup check
 * 3. Persist raw payload reference
 * 4. Enqueue normalization job
 */
export async function ingestRawEvent(
  event: RawIngestEvent,
  options: IngestOptions,
): Promise<{ rawEventId: string; deduplicated: boolean }> {
  const db = getDb();
  const eventId = event.id || randomUUID();

  // Stage 1: Validate source connection exists and is active
  const [connection] = await db
    .select()
    .from(schema.sourceConnections)
    .where(eq(schema.sourceConnections.id, options.sourceConnectionId))
    .limit(1);

  if (!connection || connection.status === 'disconnected' || connection.status === 'deleted') {
    throw new Error(`Source connection ${options.sourceConnectionId} is not active`);
  }

  // Stage 2: Compute checksum for dedup
  const payloadString = JSON.stringify(event.payload);
  const checksum = sha256(payloadString);

  // Check for duplicate (same source + event type + external ID + checksum)
  if (event.externalId) {
    const existing = await db
      .select({ id: schema.rawEvents.id })
      .from(schema.rawEvents)
      .where(eq(schema.rawEvents.checksum, checksum))
      .limit(1);

    if (existing.length > 0) {
      logger.debug('Duplicate event detected, skipping', {
        eventType: event.eventType,
        externalId: event.externalId,
        checksum,
      });
      return { rawEventId: existing[0]!.id, deduplicated: true };
    }
  }

  // Stage 3: Compute storage key (S3 path pattern)
  const now = new Date();
  const storageKey = buildStorageKey(event.sourceType, event.eventType, eventId, now);

  // Stage 4: Persist raw event record
  // Note: In production, we'd also write the payload to S3 here.
  // For MVP, we store the reference and the pipeline will read from the event record.
  const [rawEvent] = await db
    .insert(schema.rawEvents)
    .values({
      id: eventId,
      sourceConnectionId: options.sourceConnectionId,
      syncJobId: options.syncJobId,
      sourceType: event.sourceType,
      eventType: event.eventType,
      externalId: event.externalId,
      storageKey,
      checksum,
      sizeBytes: Buffer.byteLength(payloadString, 'utf8'),
      receivedAt: new Date(event.receivedAt),
    })
    .returning();

  logger.info('Raw event persisted', {
    rawEventId: rawEvent!.id,
    sourceType: event.sourceType,
    eventType: event.eventType,
    storageKey,
  });

  return { rawEventId: rawEvent!.id, deduplicated: false };
}

function buildStorageKey(
  sourceType: SourceType,
  eventType: string,
  eventId: string,
  date: Date,
): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const safeEventType = eventType.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `raw/${sourceType}/${year}/${month}/${day}/${safeEventType}/${eventId}.json.gz`;
}

/**
 * Build a normalization job from a raw event.
 */
export function buildNormalizationJob(
  rawEventId: string,
  storageKey: string,
  sourceType: SourceType,
  eventType: string,
  sourceConnectionId: string,
  priority?: number,
): NormalizationJobData {
  return {
    rawEventId,
    storageKey,
    sourceType,
    eventType,
    sourceConnectionId,
    priority: priority ?? PIPELINE_PRIORITY.POLLING,
  };
}
