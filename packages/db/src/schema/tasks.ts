import { pgTable, uuid, text, timestamp, jsonb, integer, real, index } from 'drizzle-orm/pg-core';

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status').notNull().default('active'), // active, paused, completed, archived
    sourceType: text('source_type'),
    externalId: text('external_id'),
    startDate: timestamp('start_date', { withTimezone: true }),
    endDate: timestamp('end_date', { withTimezone: true }),
    tags: text('tags').array(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_projects_status').on(table.status)],
);

export const goals = pgTable('goals', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(), // personal, professional, health, financial
  status: text('status').notNull().default('active'),
  targetDate: timestamp('target_date', { withTimezone: true }),
  metrics: jsonb('metrics').$type<Record<string, unknown>>(),
  parentGoalId: uuid('parent_goal_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').notNull().default('open'), // open, in_progress, done, cancelled
    priority: text('priority').default('medium'), // low, medium, high, critical
    sourceType: text('source_type'),
    externalId: text('external_id'),
    projectId: uuid('project_id').references(() => projects.id),
    goalId: uuid('goal_id').references(() => goals.id),
    dueDate: timestamp('due_date', { withTimezone: true }),
    tags: text('tags').array(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_tasks_status').on(table.status),
    index('idx_tasks_project').on(table.projectId),
  ],
);

export const executionPlans = pgTable('execution_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('draft'), // draft, active, completed, abandoned
  goalId: uuid('goal_id').references(() => goals.id),
  steps: jsonb('steps').$type<
    Array<{
      order: number;
      title: string;
      description?: string;
      status: string;
      estimatedMinutes?: number;
    }>
  >(),
  progress: real('progress').default(0),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  agentRunId: uuid('agent_run_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
