import { pgTable, uuid, text, timestamp, jsonb, integer, real, index } from 'drizzle-orm/pg-core';

export const healthSamples = pgTable(
  'health_samples',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceType: text('source_type').notNull(),
    metricType: text('metric_type').notNull(), // heart_rate, hrv, spo2, respiratory_rate, skin_temp
    value: real('value').notNull(),
    unit: text('unit').notNull(),
    measuredAt: timestamp('measured_at', { withTimezone: true }).notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_health_samples_type_measured').on(table.metricType, table.measuredAt),
  ],
);

export const sleepSessions = pgTable(
  'sleep_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceType: text('source_type').notNull(),
    externalId: text('external_id').notNull(),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    qualityScore: real('quality_score'),
    durationMinutes: integer('duration_minutes'),
    stages: jsonb('stages').$type<{
      awake: number;
      light: number;
      deep: number;
      rem: number;
    }>(),
    respiratoryRate: real('respiratory_rate'),
    disturbances: integer('disturbances'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_sleep_sessions_source_external').on(table.sourceType, table.externalId),
    index('idx_sleep_sessions_start').on(table.startTime),
  ],
);

export const recoveryScores = pgTable(
  'recovery_scores',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceType: text('source_type').notNull(),
    externalId: text('external_id').notNull(),
    score: real('score').notNull(),
    date: timestamp('date', { withTimezone: true }).notNull(),
    restingHeartRate: real('resting_heart_rate'),
    hrv: real('hrv'),
    spo2: real('spo2'),
    skinTemp: real('skin_temp'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_recovery_scores_source_external').on(table.sourceType, table.externalId),
    index('idx_recovery_scores_date').on(table.date),
  ],
);

export const activitySessions = pgTable(
  'activity_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceType: text('source_type').notNull(),
    externalId: text('external_id').notNull(),
    activityType: text('activity_type').notNull(),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    strain: real('strain'),
    calories: real('calories'),
    avgHeartRate: real('avg_heart_rate'),
    maxHeartRate: real('max_heart_rate'),
    durationMinutes: integer('duration_minutes'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_activity_sessions_source_external').on(table.sourceType, table.externalId),
    index('idx_activity_sessions_start').on(table.startTime),
  ],
);
