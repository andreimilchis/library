import { pgTable, uuid, text, timestamp, jsonb, real, index } from 'drizzle-orm/pg-core';

export const insights = pgTable(
  'insights',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(), // alert, digest, recommendation, anomaly, pattern, contradiction
    severity: text('severity').default('medium'), // low, medium, high, critical
    title: text('title').notNull(),
    content: text('content').notNull(),
    confidence: real('confidence').default(0.8),
    status: text('status').notNull().default('generated'), // generated, delivered, read, actioned, dismissed, expired
    relatedEntityIds: jsonb('related_entity_ids').$type<
      Array<{ entityType: string; entityId: string }>
    >(),
    evidence: jsonb('evidence').$type<Array<{ source: string; description: string }>>(),
    agentRunId: uuid('agent_run_id'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    dismissedAt: timestamp('dismissed_at', { withTimezone: true }),
    actionedAt: timestamp('actioned_at', { withTimezone: true }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_insights_type_status').on(table.type, table.status),
    index('idx_insights_generated_at').on(table.generatedAt),
  ],
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    priority: text('priority').default('normal'), // low, normal, high, urgent
    insightId: uuid('insight_id').references(() => insights.id),
    agentRunId: uuid('agent_run_id'),
    actionUrl: text('action_url'),
    readAt: timestamp('read_at', { withTimezone: true }),
    actionedAt: timestamp('actioned_at', { withTimezone: true }),
    dismissedAt: timestamp('dismissed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_notifications_created_at').on(table.createdAt)],
);
