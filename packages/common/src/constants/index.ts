// Queue names
export const QUEUES = {
  INGESTION: 'eye1:ingestion',
  NORMALIZATION: 'eye1:normalization',
  EMBEDDING: 'eye1:embedding',
  GRAPH_UPDATE: 'eye1:graph-update',
  INSIGHT_TRIGGER: 'eye1:insight-trigger',
  AGENT_RUN: 'eye1:agent-run',
  SYNC_POLL: 'eye1:sync-poll',
  DEAD_LETTER: 'eye1:dead-letter',
} as const;

// Pipeline priorities (lower = higher priority)
export const PIPELINE_PRIORITY = {
  WEBHOOK: 1,
  MANUAL: 2,
  POLLING: 3,
  IMPORT: 4,
  BACKFILL: 5,
} as const;

// Rate limits per source (requests per minute)
export const SOURCE_RATE_LIMITS: Record<string, number> = {
  github: 80, // 5000/h ≈ 83/min, leave margin
  notion: 3,  // 3 req/s but we're conservative
  whoop: 20,
  revolut: 10,
  smartbill: 10,
  spotify: 30,
};

// Embedding config
export const EMBEDDING = {
  CHUNK_SIZE: 512,
  CHUNK_OVERLAP: 64,
  MIN_CHUNK_SIZE: 50,
  MAX_BATCH_SIZE: 100,
  SIMILARITY_THRESHOLD: 0.7,
  RECENCY_DECAY_WEIGHT: 0.3,
} as const;

// Agent config
export const AGENT_DEFAULTS = {
  MAX_TOOL_CALLS: 10,
  MAX_OUTPUT_TOKENS: 4000,
  TIMEOUT_SECONDS: 120,
  MAX_COST_USD: 0.50,
} as const;

// Retention policies (days)
export const RETENTION = {
  RAW_EVENTS: 365,
  AUDIT_LOGS: 1095, // 3 years
  AGENT_RUNS: 365,
  NOTIFICATIONS: 90,
  SYNC_JOBS: 90,
  FINANCIAL_DATA: 2555, // 7 years
} as const;
