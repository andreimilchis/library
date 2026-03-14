import { pgTable, uuid, text, timestamp, jsonb, integer, index } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const sourceConnections = pgTable(
  'source_connections',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sourceType: text('source_type').notNull(), // github, notion, whoop, etc.
    status: text('status').notNull().default('pending_auth'),
    // Encrypted JSON: { accessToken, refreshToken, expiresAt, etc. }
    credentials: text('credentials'),
    // Non-secret config: { orgName, repoFilter, webhookId, etc. }
    config: jsonb('config').$type<Record<string, unknown>>().default({}),
    scopes: text('scopes').array(),
    externalAccountId: text('external_account_id'),
    externalAccountName: text('external_account_name'),
    lastSyncAt: timestamp('last_sync_at', { withTimezone: true }),
    lastError: text('last_error'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    consentedAt: timestamp('consented_at', { withTimezone: true }),
    consentScopes: jsonb('consent_scopes').$type<string[]>().default([]),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_source_connections_user_source').on(table.userId, table.sourceType),
    index('idx_source_connections_status').on(table.status),
  ],
);

export const syncJobs = pgTable(
  'sync_jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceConnectionId: uuid('source_connection_id')
      .notNull()
      .references(() => sourceConnections.id, { onDelete: 'cascade' }),
    type: text('type').notNull(), // full, incremental, backfill, webhook, import
    status: text('status').notNull().default('pending'),
    cursor: jsonb('cursor').$type<Record<string, unknown>>(),
    stats: jsonb('stats').$type<{
      eventsReceived: number;
      eventsProcessed: number;
      eventsFailed: number;
      normalizedRecords: number;
    }>(),
    error: text('error'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    durationMs: integer('duration_ms'),
  },
  (table) => [
    index('idx_sync_jobs_connection_started').on(table.sourceConnectionId, table.startedAt),
    index('idx_sync_jobs_status').on(table.status),
  ],
);
