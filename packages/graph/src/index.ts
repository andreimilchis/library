import { getDb, schema } from '@eye1/db';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { KnowledgeNodeType, KnowledgeEdgeType } from '@eye1/common';

export interface CreateNodeInput {
  type: KnowledgeNodeType;
  name: string;
  description?: string;
  properties?: Record<string, unknown>;
  confidence?: number;
  sourceType?: string;
  sourceEntityId?: string;
  sourceEntityType?: string;
}

export interface CreateEdgeInput {
  fromNodeId: string;
  toNodeId: string;
  edgeType: KnowledgeEdgeType;
  confidence?: number;
  weight?: number;
  properties?: Record<string, unknown>;
  sourceType?: string;
  evidence?: string[];
  createdBy?: 'rule' | 'ai' | 'user';
}

/**
 * Upsert a knowledge node. If a node with same type+name exists, update it.
 */
export async function upsertNode(input: CreateNodeInput): Promise<string> {
  const db = getDb();

  const existing = await db
    .select({ id: schema.knowledgeNodes.id })
    .from(schema.knowledgeNodes)
    .where(
      and(
        eq(schema.knowledgeNodes.type, input.type),
        eq(schema.knowledgeNodes.name, input.name),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(schema.knowledgeNodes)
      .set({
        description: input.description,
        properties: input.properties,
        confidence: input.confidence,
        updatedAt: new Date(),
      })
      .where(eq(schema.knowledgeNodes.id, existing[0]!.id));
    return existing[0]!.id;
  }

  const [node] = await db
    .insert(schema.knowledgeNodes)
    .values({
      type: input.type,
      name: input.name,
      description: input.description,
      properties: input.properties ?? {},
      confidence: input.confidence ?? 1.0,
      sourceType: input.sourceType,
      sourceEntityId: input.sourceEntityId,
      sourceEntityType: input.sourceEntityType,
    })
    .returning();

  return node!.id;
}

/**
 * Upsert a knowledge edge. If edge with same from+to+type exists, update confidence.
 */
export async function upsertEdge(input: CreateEdgeInput): Promise<string> {
  const db = getDb();

  const existing = await db
    .select({ id: schema.knowledgeEdges.id, confidence: schema.knowledgeEdges.confidence })
    .from(schema.knowledgeEdges)
    .where(
      and(
        eq(schema.knowledgeEdges.fromNodeId, input.fromNodeId),
        eq(schema.knowledgeEdges.toNodeId, input.toNodeId),
        eq(schema.knowledgeEdges.edgeType, input.edgeType),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    // Update confidence (take higher), add evidence
    const newConfidence = Math.max(existing[0]!.confidence ?? 0, input.confidence ?? 0.5);
    await db
      .update(schema.knowledgeEdges)
      .set({
        confidence: newConfidence,
        weight: input.weight,
        properties: input.properties,
        lastValidated: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.knowledgeEdges.id, existing[0]!.id));
    return existing[0]!.id;
  }

  const [edge] = await db
    .insert(schema.knowledgeEdges)
    .values({
      fromNodeId: input.fromNodeId,
      toNodeId: input.toNodeId,
      edgeType: input.edgeType,
      confidence: input.confidence ?? 0.5,
      weight: input.weight ?? 1.0,
      properties: input.properties ?? {},
      sourceType: input.sourceType,
      evidence: input.evidence,
      createdBy: input.createdBy ?? 'rule',
    })
    .returning();

  return edge!.id;
}

/**
 * Get a node with its edges.
 */
export async function getNodeWithEdges(nodeId: string) {
  const db = getDb();

  const [node] = await db
    .select()
    .from(schema.knowledgeNodes)
    .where(eq(schema.knowledgeNodes.id, nodeId))
    .limit(1);

  if (!node) return null;

  const outgoing = await db
    .select()
    .from(schema.knowledgeEdges)
    .where(eq(schema.knowledgeEdges.fromNodeId, nodeId));

  const incoming = await db
    .select()
    .from(schema.knowledgeEdges)
    .where(eq(schema.knowledgeEdges.toNodeId, nodeId));

  return { node, outgoingEdges: outgoing, incomingEdges: incoming };
}

/**
 * Query nodes by type with optional filters.
 */
export async function queryNodes(
  type?: KnowledgeNodeType,
  limit = 50,
) {
  const db = getDb();
  let query = db.select().from(schema.knowledgeNodes);

  if (type) {
    query = query.where(eq(schema.knowledgeNodes.type, type)) as typeof query;
  }

  return query.orderBy(desc(schema.knowledgeNodes.updatedAt)).limit(limit);
}
