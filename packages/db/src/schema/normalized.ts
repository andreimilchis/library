import { pgTable, uuid, text, timestamp, jsonb, real, index } from 'drizzle-orm/pg-core';
import { rawEvents } from './raw';

export const normalizedRecords = pgTable(
  'normalized_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    rawEventId: uuid('raw_event_id').references(() => rawEvents.id),
    sourceType: text('source_type').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(), // FK to the specific entity table
    externalId: text('external_id').notNull(),
    deduplicationKey: text('deduplication_key').notNull(),
    data: jsonb('data').$type<Record<string, unknown>>().notNull(),
    version: text('version').default('1'),
    confidence: real('confidence').default(1.0),
    normalizedAt: timestamp('normalized_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_normalized_entity').on(table.entityType, table.entityId),
    index('idx_normalized_source').on(table.sourceType, table.normalizedAt),
    index('idx_normalized_dedup').on(table.deduplicationKey),
  ],
);
