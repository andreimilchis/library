import { z } from 'zod';
import { SourceType } from './source';

export const RawIngestEvent = z.object({
  id: z.string().uuid(),
  sourceType: SourceType,
  eventType: z.string(),
  externalId: z.string().optional(),
  payload: z.unknown(),
  receivedAt: z.string().datetime(),
  headers: z.record(z.string()).optional(),
  deliveryId: z.string().optional(),
});
export type RawIngestEvent = z.infer<typeof RawIngestEvent>;

export const NormalizationJobData = z.object({
  rawEventId: z.string().uuid(),
  storageKey: z.string(),
  sourceType: SourceType,
  eventType: z.string(),
  sourceConnectionId: z.string().uuid(),
  priority: z.number().default(0),
});
export type NormalizationJobData = z.infer<typeof NormalizationJobData>;

export const EntityType = z.enum([
  'document',
  'message',
  'conversation',
  'task',
  'project',
  'goal',
  'insight',
  'financial_transaction',
  'invoice',
  'health_sample',
  'sleep_session',
  'recovery_score',
  'activity_session',
  'audio_track_event',
  'git_repository',
  'commit',
  'pull_request',
  'issue',
  'knowledge_node',
  'knowledge_edge',
  'notification',
]);
export type EntityType = z.infer<typeof EntityType>;

export const NormalizedRecordData = z.object({
  entityType: EntityType,
  entityId: z.string(),
  externalId: z.string(),
  sourceType: SourceType,
  data: z.record(z.unknown()),
  deduplicationKey: z.string(),
});
export type NormalizedRecordData = z.infer<typeof NormalizedRecordData>;

export const PipelineEvent = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('raw_event_persisted'),
    rawEventId: z.string().uuid(),
    storageKey: z.string(),
    sourceType: SourceType,
    eventType: z.string(),
    sourceConnectionId: z.string().uuid(),
  }),
  z.object({
    type: z.literal('normalization_complete'),
    rawEventId: z.string().uuid(),
    normalizedRecordIds: z.array(z.string().uuid()),
    entityTypes: z.array(EntityType),
  }),
  z.object({
    type: z.literal('embedding_complete'),
    entityType: EntityType,
    entityId: z.string().uuid(),
    chunkCount: z.number(),
  }),
  z.object({
    type: z.literal('graph_update_complete'),
    nodesCreated: z.number(),
    edgesCreated: z.number(),
  }),
  z.object({
    type: z.literal('sync_job_complete'),
    syncJobId: z.string().uuid(),
    sourceConnectionId: z.string().uuid(),
    eventsProcessed: z.number(),
    errors: z.number(),
  }),
]);
export type PipelineEvent = z.infer<typeof PipelineEvent>;
