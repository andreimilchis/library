# eye1.ai — AI Reasoning Layer

## Ce întrebări rezolvă

1. "Cum arată ziua/săptămâna/luna mea?" (descriptive)
2. "De ce a scăzut recovery-ul?" (diagnostic)
3. "Cum se compară săptămâna asta cu precedenta?" (comparative)
4. "Ce ar trebui să prioritizez?" (prioritization)
5. "Ce anomalii există?" (anomaly)
6. "Ce patternuri repet?" (habit/pattern)
7. "Ce plan ar trebui să urmez?" (planning)
8. "Am fost consistent cu ce am promis?" (execution review)
9. "Ce contradicții există în comportamentul meu?" (reflection)
10. "Ce idei merită acționat?" (synthesis)

## Ce NU rezolvă

- Diagnostic medical ("ai sleep apnea?") — oferă doar date
- Sfaturi financiare regulate ("investește în X") — oferă doar vizibilitate
- Acțiuni autonome fără approval
- Răspunsuri la întrebări fără date suficiente — declară explicit lipsa datelor

## Context Builder

### Context Composition
```typescript
interface ReasoningContext {
  // Time context
  currentDate: Date;
  dayOfWeek: string;
  weekNumber: number;

  // Recent events (last 24-48h)
  recentEvents: CanonicalEvent[];

  // Relevant historical patterns (semantic + graph retrieval)
  relevantHistory: RetrievedContext[];

  // Active state
  activeGoals: Goal[];
  activePlans: ExecutionPlan[];
  openTasks: Task[];
  pendingApprovals: ApprovalRequest[];

  // Health state
  latestHealth: {
    sleepScore?: number;
    recoveryScore?: number;
    strain?: number;
  };

  // Financial state (redacted)
  financialSummary: {
    weeklySpend?: number;
    monthlyBurnRate?: number;
    overdueInvoices?: number;
  };

  // Coding state
  codingActivity: {
    recentCommits: number;
    openPRs: number;
    activeRepos: string[];
  };

  // User profile & preferences
  userProfile: UserProfile;

  // Source trust scores
  sourceTrust: Record<string, number>;
}
```

### Context Assembly Pipeline
1. **Gather time context** — current date, day, week
2. **Fetch recent events** — last 24-48h from canonical tables
3. **Semantic retrieval** — query pgvector with reasoning query
4. **Graph retrieval** — relevant subgraph based on active entities
5. **Fetch active state** — goals, plans, tasks
6. **Fetch domain summaries** — health, finance, coding (pre-aggregated)
7. **Apply redaction** — remove PII, financial details from LLM input
8. **Compose prompt** — system prompt + context + specific question
9. **Select model** — haiku for simple, sonnet for moderate, opus for complex

## Reasoning Types

### 1. Descriptive Reasoning
- **Scop**: Descrie starea curentă
- **Trigger**: Daily (morning), on-demand
- **Input**: Recent events, health, finance, coding
- **Output**: Narrative summary
- **Model**: Sonnet

### 2. Diagnostic Reasoning
- **Scop**: Explică de ce ceva s-a schimbat
- **Trigger**: Anomaly detected, user question
- **Input**: Current state, historical baseline, recent changes
- **Output**: Causal analysis with evidence
- **Model**: Opus (complex causal reasoning)

### 3. Comparative Reasoning
- **Scop**: Compară perioade sau entități
- **Trigger**: Weekly review, user question
- **Input**: Two time periods or entity sets
- **Output**: Comparison with delta analysis
- **Model**: Sonnet

### 4. Planning Reasoning
- **Scop**: Generează planuri de execuție
- **Trigger**: User request, weekly planning
- **Input**: Goals, current state, capacity, patterns
- **Output**: ExecutionPlan with steps
- **Model**: Opus

### 5. Prioritization Reasoning
- **Scop**: Orderează taskuri/proiecte după importanță
- **Trigger**: Daily, on-demand
- **Input**: Open tasks, goals, energy state, deadlines
- **Output**: Prioritized list with rationale
- **Model**: Sonnet

### 6. Anomaly Reasoning
- **Scop**: Detectează și explică anomalii
- **Trigger**: Metric exceeds threshold
- **Input**: Current metric, historical baseline, context
- **Output**: Anomaly alert with explanation
- **Model**: Haiku (detection), Sonnet (explanation)

### 7. Habit Reasoning
- **Scop**: Identifică și evaluează obiceiuri
- **Trigger**: Weekly, monthly
- **Input**: 30-90 day patterns from all sources
- **Output**: Habit analysis with trends
- **Model**: Sonnet

### 8. Execution Reasoning
- **Scop**: Evaluează progresul vs plan
- **Trigger**: Daily, weekly
- **Input**: ExecutionPlan, completed tasks, time elapsed
- **Output**: Progress report, drift analysis
- **Model**: Sonnet

### 9. Reflection/Review Reasoning
- **Scop**: Meta-analysis a comportamentului
- **Trigger**: Weekly, monthly
- **Input**: All domain summaries, goals, decisions, actions
- **Output**: Review narrative with insights
- **Model**: Opus

### 10. Memory Synthesis
- **Scop**: Sintetizează și consolidează memoria
- **Trigger**: Weekly, or when memory gets fragmented
- **Input**: Related embeddings, graph clusters
- **Output**: Consolidated summaries, updated graph
- **Model**: Sonnet

## Insight Types

### Realtime Alert
- **Trigger**: Anomaly detected (spending spike, health drop)
- **Context**: Current metric + baseline
- **Output**: `{ type: "alert", severity, title, body, evidence[], suggestion? }`
- **UI**: Push notification + feed card
- **Confidence**: > 0.8 required
- **Suppression**: Max 3 alerts/day, no repeat for same anomaly in 24h

### Daily Digest
- **Trigger**: Cron at configurable hour (default 07:00)
- **Context**: Last 24h events, health, coding, finance, tasks
- **Output**: `{ type: "digest", period: "daily", sections[], priorities[], energy_note }`
- **UI**: Home page card, email (optional)
- **Suppression**: One per day

### Weekly Review
- **Trigger**: Cron Sunday evening (configurable)
- **Context**: Full week data, goals, plans
- **Output**: `{ type: "review", period: "weekly", wins[], challenges[], patterns[], next_week[] }`
- **UI**: Dedicated page
- **Suppression**: One per week

### Recommendation
- **Trigger**: Pattern detected that has actionable response
- **Context**: Specific pattern + historical outcomes
- **Output**: `{ type: "recommendation", priority, action, rationale, evidence[] }`
- **UI**: Feed card with action button
- **Confidence**: > 0.7 required
- **Suppression**: Max 5 recommendations/week

### Risk Alert
- **Trigger**: Financial risk, deadline risk, health risk pattern
- **Context**: Risk indicators + thresholds
- **Output**: `{ type: "risk", severity, area, description, mitigation[] }`
- **UI**: Priority notification
- **Suppression**: Once per risk per week

### Contradiction Alert
- **Trigger**: AI detects mismatch between stated goals and behavior
- **Context**: Goals + actual behavior patterns
- **Output**: `{ type: "contradiction", goal, behavior, evidence[] }`
- **UI**: Feed card (sensitive — gentle framing)
- **Confidence**: > 0.85 required
- **Suppression**: Max 1 per week

## Prompt Architecture

### System Prompt (Base)
```
You are eye1.ai, a personal intelligence system. You analyze data from
multiple life domains (health, finance, work, conversations, knowledge)
to generate actionable insights.

RULES:
- Be concise and specific
- Always cite evidence from provided data
- Never hallucinate data points — say "insufficient data" if unsure
- Never provide medical or financial advice
- Frame observations, not diagnoses
- Respect privacy — never output raw financial amounts in insights
- Output in Romanian unless specified otherwise
```

### Tool Prompts
```
Available tools:
- search_canonical(entityType, filters) → records
- semantic_search(query, options) → chunks with similarity
- graph_query(pattern) → nodes and edges
- get_metrics(name, dateRange, grain) → time series
- get_active_plans() → execution plans
- create_insight(type, content) → saved insight
- create_approval_request(action, description) → approval
```

### Summarization Prompt
```
Summarize the following data for {period} in Romanian.
Focus on: key changes, patterns, anomalies, and priorities.
Data: {context}
Output JSON matching InsightSchema.
```

## Cost Tracking

```typescript
interface LLMUsage {
  requestId: string;
  model: string;
  provider: 'openai' | 'anthropic';
  inputTokens: number;
  outputTokens: number;
  cost: number;  // Calculated from token pricing
  reasoningType: string;
  agentType?: string;
  cachedTokens?: number;
  latencyMs: number;
  timestamp: Date;
}
```

- **Budget caps**: Daily ($5 default), weekly ($25), monthly ($80)
- **Alerts**: At 80% and 100% of cap
- **Model tiering**: Use cheapest model that satisfies quality threshold
- **Caching**: Cache identical context+query responses for 1h
- **Batching**: Batch multiple insight requests when possible

## Hallucination Prevention

1. **Grounded responses**: All insights must reference specific data points
2. **Structured output**: JSON schema validation on all LLM outputs
3. **Confidence scoring**: Self-reported + schema completeness
4. **Data citation**: Every claim must have `evidence[]` field
5. **Contradiction check**: Cross-reference output with input data
6. **No extrapolation**: If data insufficient, say so explicitly
