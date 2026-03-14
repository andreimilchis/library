import { pgTable, uuid, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { sourceConnections, syncJobs } from './sources';

export const rawEvents = pgTable(
  'raw_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceConnectionId: uuid('source_connection_id')
      .notNull()
      .references(() => sourceConnections.id, { onDelete: 'cascade' }),
    syncJobId: uuid('sync_job_id').references(() => syncJobs.id),
    sourceType: text('source_type').notNull(),
    eventType: text('event_type').notNull(),
    externalId: text('external_id'),
    storageKey: text('storage_key').notNull(), // S3 path
    checksum: text('checksum').notNull(), // SHA-256
    sizeBytes: integer('size_bytes'),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp('processed_at', { withTimezone: true }),
    processingError: text('processing_error'),
  },
  (table) => [
    index('idx_raw_events_source_type').on(table.sourceType, table.eventType),
    index('idx_raw_events_external_id').on(table.sourceType, table.externalId),
    index('idx_raw_events_received_at').on(table.receivedAt),
    index('idx_raw_events_checksum').on(table.checksum),
  ],
);
