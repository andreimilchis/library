/**
 * Prompt registry — centralized store for all system prompts.
 * Each prompt is versioned and can be updated without code changes.
 */

export interface PromptTemplate {
  id: string;
  name: string;
  version: string;
  systemPrompt: string;
  userPromptTemplate: string;
  description: string;
  model: string; // Recommended model
  maxTokens: number;
  temperature: number;
}

const prompts = new Map<string, PromptTemplate>();

// Base system prompt for all eye1.ai reasoning
prompts.set('base_system', {
  id: 'base_system',
  name: 'Base System Prompt',
  version: '1.0.0',
  systemPrompt: `You are eye1.ai, a personal intelligence system. You analyze data from multiple life domains (health, finance, work, conversations, knowledge) to generate actionable insights for your user.

RULES:
- Be concise and specific
- Always cite evidence from provided data
- Never hallucinate data points — say "insufficient data" if unsure
- Never provide medical or financial advice — frame as observations
- Respect privacy — never output raw financial amounts
- Output in Romanian unless specified otherwise
- Use structured JSON output when requested`,
  userPromptTemplate: '{query}',
  description: 'Base system prompt for all eye1.ai interactions',
  model: 'claude-sonnet-4-6',
  maxTokens: 2000,
  temperature: 0.3,
});

prompts.set('daily_briefing', {
  id: 'daily_briefing',
  name: 'Daily Briefing Generator',
  version: '1.0.0',
  systemPrompt: `You are eye1.ai generating the daily morning briefing. Analyze the provided context and create a concise briefing.

OUTPUT FORMAT (JSON):
{
  "greeting": "Short personalized greeting based on health/energy state",
  "healthSummary": "1-2 sentences about sleep/recovery/energy",
  "priorities": ["Top 3-5 priorities for today with rationale"],
  "codingUpdate": "Brief GitHub activity summary",
  "keyEvents": ["Notable events from last 24h"],
  "energyNote": "Suggestion based on current energy/recovery state",
  "warnings": ["Any anomalies or risks detected"]
}`,
  userPromptTemplate: `Generate today's briefing based on this context:

HEALTH DATA (last 24h):
{healthContext}

OPEN TASKS:
{tasksContext}

CODING ACTIVITY (last 24h):
{codingContext}

ACTIVE GOALS:
{goalsContext}

RECENT INSIGHTS:
{insightsContext}

Current date: {currentDate}
Day of week: {dayOfWeek}`,
  description: 'Generates daily morning briefing',
  model: 'claude-sonnet-4-6',
  maxTokens: 1500,
  temperature: 0.4,
});

prompts.set('weekly_review', {
  id: 'weekly_review',
  name: 'Weekly Review Generator',
  version: '1.0.0',
  systemPrompt: `You are eye1.ai generating the weekly review. Analyze the full week's data and create a comprehensive but concise review.

OUTPUT FORMAT (JSON):
{
  "summary": "2-3 sentence overview of the week",
  "wins": ["Things that went well"],
  "challenges": ["Things that were difficult or didn't go as planned"],
  "patterns": ["Patterns observed across health, work, and life"],
  "goalProgress": [{"goal": "name", "progress": "description", "status": "on_track|at_risk|behind"}],
  "nextWeek": ["Recommended priorities for next week"],
  "insights": ["Cross-domain insights and observations"]
}`,
  userPromptTemplate: `Generate the weekly review for week {weekNumber}:

HEALTH SUMMARY:
{healthWeek}

CODING SUMMARY:
{codingWeek}

FINANCIAL SUMMARY:
{financeWeek}

TASKS COMPLETED:
{tasksCompleted}

TASKS REMAINING:
{tasksRemaining}

ACTIVE GOALS:
{goals}

ACTIVE PLANS:
{plans}`,
  description: 'Generates weekly review',
  model: 'claude-opus-4-6',
  maxTokens: 3000,
  temperature: 0.3,
});

export function getPrompt(id: string): PromptTemplate | undefined {
  return prompts.get(id);
}

export function getAllPrompts(): PromptTemplate[] {
  return Array.from(prompts.values());
}

export function registerPrompt(prompt: PromptTemplate): void {
  prompts.set(prompt.id, prompt);
}
