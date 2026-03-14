import { pgTable, uuid, text, timestamp, jsonb, integer, index, customType } from 'drizzle-orm/pg-core';

// Custom vector type for pgvector
// In production, use drizzle-orm/pg-core vector type or pgvector extension
const vector = customType<{ data: number[]; driverParam: string }>({
  dataType() {
    return 'vector(1536)';
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
});

export const embeddingRecords = pgTable(
  'embedding_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceEntityType: text('source_entity_type').notNull(),
    sourceEntityId: uuid('source_entity_id').notNull(),
    chunkIndex: integer('chunk_index').notNull().default(0),
    content: text('content').notNull(),
    contentHash: text('content_hash').notNull(),
    embedding: vector('embedding').notNull(),
    model: text('model').notNull(),
    tokenCount: integer('token_count'),
    metadata: jsonb('metadata').$type<{
      sourceType?: string;
      createdAt?: string;
      updatedAt?: string;
      author?: string;
      tags?: string[];
      language?: string;
      totalChunks?: number;
    }>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_embeddings_source_entity').on(table.sourceEntityType, table.sourceEntityId),
    index('idx_embeddings_content_hash').on(table.contentHash),
    // HNSW index for vector similarity search - created via raw SQL migration:
    // CREATE INDEX idx_embeddings_vector ON embedding_records USING hnsw (embedding vector_cosine_ops);
  ],
);
