import { pgTable, uuid, text, timestamp, jsonb, real, index } from 'drizzle-orm/pg-core';

export const knowledgeNodes = pgTable(
  'knowledge_nodes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(), // person, project, concept, etc.
    name: text('name').notNull(),
    description: text('description'),
    properties: jsonb('properties').$type<Record<string, unknown>>().default({}),
    confidence: real('confidence').default(1.0),
    sourceType: text('source_type'),
    sourceEntityId: text('source_entity_id'),
    sourceEntityType: text('source_entity_type'),
    validFrom: timestamp('valid_from', { withTimezone: true }),
    validTo: timestamp('valid_to', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_knowledge_nodes_type').on(table.type),
    index('idx_knowledge_nodes_name').on(table.name),
    index('idx_knowledge_nodes_source_entity').on(table.sourceEntityType, table.sourceEntityId),
  ],
);

export const knowledgeEdges = pgTable(
  'knowledge_edges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fromNodeId: uuid('from_node_id')
      .notNull()
      .references(() => knowledgeNodes.id, { onDelete: 'cascade' }),
    toNodeId: uuid('to_node_id')
      .notNull()
      .references(() => knowledgeNodes.id, { onDelete: 'cascade' }),
    edgeType: text('edge_type').notNull(), // discussed_in, belongs_to, etc.
    confidence: real('confidence').default(1.0),
    weight: real('weight').default(1.0),
    properties: jsonb('properties').$type<Record<string, unknown>>().default({}),
    sourceType: text('source_type'),
    evidence: text('evidence').array(), // References to source records
    createdBy: text('created_by').notNull().default('rule'), // rule, ai, user
    validFrom: timestamp('valid_from', { withTimezone: true }),
    validTo: timestamp('valid_to', { withTimezone: true }),
    lastValidated: timestamp('last_validated', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_knowledge_edges_from').on(table.fromNodeId),
    index('idx_knowledge_edges_to').on(table.toNodeId),
    index('idx_knowledge_edges_type').on(table.edgeType),
    index('idx_knowledge_edges_from_type').on(table.fromNodeId, table.edgeType),
  ],
);
