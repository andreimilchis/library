/**
 * Abstract AI provider interface.
 * Supports multi-provider architecture (OpenAI, Anthropic, etc.)
 */
export interface AIProvider {
  readonly name: string;

  /**
   * Generate a chat completion.
   */
  chat(params: ChatParams): Promise<ChatResult>;

  /**
   * Generate embeddings for text chunks.
   */
  embed(texts: string[]): Promise<number[][]>;
}

export interface ChatParams {
  model: string;
  systemPrompt: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
  tools?: ToolDefinition[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResult {
  content: string;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  finishReason: string;
  cost: number;
  latencyMs: number;
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// Cost per 1M tokens (approximate, needs updating with actual prices)
export const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 2.5, output: 10.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'claude-sonnet-4-6': { input: 3.0, output: 15.0 },
  'claude-haiku-4-5-20251001': { input: 0.8, output: 4.0 },
  'claude-opus-4-6': { input: 15.0, output: 75.0 },
  'text-embedding-3-small': { input: 0.02, output: 0 },
};

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const costs = MODEL_COSTS[model];
  if (!costs) return 0;
  return (inputTokens * costs.input + outputTokens * costs.output) / 1_000_000;
}
