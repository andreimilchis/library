import { pgTable, uuid, text, timestamp, jsonb, index } from 'drizzle-orm/pg-core';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    action: text('action').notNull(), // source.connect, source.sync, record.read, agent.action, data.export, data.delete
    actorType: text('actor_type').notNull(), // user, system, agent
    actorId: text('actor_id').notNull(),
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    ipAddress: text('ip_address'),
    timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_audit_action_timestamp').on(table.action, table.timestamp),
    index('idx_audit_entity').on(table.entityType, table.entityId),
    index('idx_audit_timestamp').on(table.timestamp),
  ],
);
