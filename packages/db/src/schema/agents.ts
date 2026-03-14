import { pgTable, uuid, text, timestamp, jsonb, integer, real, index } from 'drizzle-orm/pg-core';

export const agentRuns = pgTable(
  'agent_runs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentType: text('agent_type').notNull(),
    status: text('status').notNull().default('pending'), // pending, running, completed, failed, cancelled
    trigger: text('trigger'), // cron, event, manual
    input: jsonb('input').$type<Record<string, unknown>>(),
    output: jsonb('output').$type<Record<string, unknown>>(),
    tokensUsed: integer('tokens_used'),
    cost: real('cost'),
    error: text('error'),
    parentRunId: uuid('parent_run_id'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_agent_runs_type_started').on(table.agentType, table.startedAt),
    index('idx_agent_runs_status').on(table.status),
  ],
);

export const agentToolCalls = pgTable(
  'agent_tool_calls',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentRunId: uuid('agent_run_id')
      .notNull()
      .references(() => agentRuns.id, { onDelete: 'cascade' }),
    toolName: text('tool_name').notNull(),
    input: jsonb('input').$type<Record<string, unknown>>(),
    output: jsonb('output').$type<Record<string, unknown>>(),
    status: text('status').notNull().default('success'),
    durationMs: integer('duration_ms'),
    error: text('error'),
    calledAt: timestamp('called_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_tool_calls_run').on(table.agentRunId)],
);

export const approvalRequests = pgTable(
  'approval_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    agentRunId: uuid('agent_run_id').references(() => agentRuns.id),
    action: text('action').notNull(),
    description: text('description').notNull(),
    payload: jsonb('payload').$type<Record<string, unknown>>(),
    status: text('status').notNull().default('pending'), // pending, approved, rejected, expired
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    resolvedBy: text('resolved_by'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_approvals_status').on(table.status)],
);
