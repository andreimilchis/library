import { createLogger } from '@eye1/common';
import type { AgentType, AgentRunStatus } from '@eye1/common';
import { getDb, schema } from '@eye1/db';
import { eq } from 'drizzle-orm';

const logger = createLogger('agent-runner');

export interface AgentDefinition {
  type: AgentType;
  name: string;
  description: string;
  maxToolCalls: number;
  maxOutputTokens: number;
  timeoutSeconds: number;
  maxCostUsd: number;
  requiresApproval: string[];
  run(context: AgentContext): Promise<AgentOutput>;
}

export interface AgentContext {
  runId: string;
  trigger: string;
  input: Record<string, unknown>;
  tools: AgentToolkit;
}

export interface AgentToolkit {
  searchCanonical(entityType: string, filters: Record<string, unknown>): Promise<unknown[]>;
  semanticSearch(query: string, options?: Record<string, unknown>): Promise<unknown[]>;
  graphQuery(pattern: Record<string, unknown>): Promise<unknown>;
  getMetrics(name: string, dateRange: { from: string; to: string }): Promise<unknown[]>;
  getActivePlans(): Promise<unknown[]>;
  createInsight(data: Record<string, unknown>): Promise<string>;
  createNotification(data: Record<string, unknown>): Promise<string>;
}

export interface AgentOutput {
  success: boolean;
  data: Record<string, unknown>;
  tokensUsed: number;
  cost: number;
}

const agentRegistry = new Map<AgentType, AgentDefinition>();

export function registerAgent(definition: AgentDefinition): void {
  agentRegistry.set(definition.type, definition);
}

export async function executeAgent(
  agentType: AgentType,
  trigger: string,
  input: Record<string, unknown> = {},
): Promise<string> {
  const db = getDb();
  const definition = agentRegistry.get(agentType);

  if (!definition) {
    throw new Error(`No agent registered for type: ${agentType}`);
  }

  // Create agent run record
  const [run] = await db
    .insert(schema.agentRuns)
    .values({
      agentType,
      status: 'running',
      trigger,
      input,
    })
    .returning();

  const runId = run!.id;
  logger.info('Agent run started', { runId, agentType, trigger });

  try {
    // Create timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Agent timeout after ${definition.timeoutSeconds}s`)),
        definition.timeoutSeconds * 1000,
      );
    });

    // Create toolkit (placeholder — real implementation connects to services)
    const tools: AgentToolkit = {
      async searchCanonical() { return []; },
      async semanticSearch() { return []; },
      async graphQuery() { return {}; },
      async getMetrics() { return []; },
      async getActivePlans() { return []; },
      async createInsight(data) {
        const [insight] = await db.insert(schema.insights).values({
          type: data.type as string,
          title: data.title as string,
          content: data.content as string,
          confidence: data.confidence as number,
          agentRunId: runId,
        }).returning();
        return insight!.id;
      },
      async createNotification(data) {
        const [notification] = await db.insert(schema.notifications).values({
          type: data.type as string,
          title: data.title as string,
          message: data.message as string,
          agentRunId: runId,
        }).returning();
        return notification!.id;
      },
    };

    const context: AgentContext = { runId, trigger, input, tools };

    // Execute with timeout
    const result = await Promise.race([definition.run(context), timeoutPromise]);

    // Update run record
    await db
      .update(schema.agentRuns)
      .set({
        status: 'completed',
        output: result.data,
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        completedAt: new Date(),
      })
      .where(eq(schema.agentRuns.id, runId));

    logger.info('Agent run completed', { runId, agentType, tokensUsed: result.tokensUsed });
    return runId;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await db
      .update(schema.agentRuns)
      .set({
        status: 'failed',
        error: errorMsg,
        completedAt: new Date(),
      })
      .where(eq(schema.agentRuns.id, runId));

    logger.error('Agent run failed', { runId, agentType, error: errorMsg });
    throw error;
  }
}
