import { pgTable, uuid, text, timestamp, real, jsonb, index } from 'drizzle-orm/pg-core';

export const timeSeriesMetrics = pgTable(
  'time_series_metrics',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    value: real('value').notNull(),
    unit: text('unit'),
    date: timestamp('date', { withTimezone: true }).notNull(),
    grain: text('grain').notNull(), // daily, weekly, monthly
    sourceType: text('source_type'),
    category: text('category'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_metrics_name_date_grain').on(table.name, table.date, table.grain),
    index('idx_metrics_category').on(table.category),
  ],
);
