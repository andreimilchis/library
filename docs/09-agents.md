# eye1.ai — Agents Layer

## Principii

- MVP: **read-heavy, write-light**
- Orice write extern necesită **approval**
- Fiecare agent are **guardrails**, **cost cap**, **timeout**
- Agenții nu pot apela alți agenți direct (doar prin orchestrator)

---

## 1. Daily Briefing Agent

- **Scop**: Generează briefing-ul zilnic dimineața
- **Inpute**: Last 24h events, health state, open tasks, calendar (future), active plans
- **Tool-uri**: search_canonical, get_metrics, get_active_plans, semantic_search
- **Surse de adevăr**: fact_daily_health, fact_daily_coding, tasks, insights
- **Output**: `DailyBriefing { healthSummary, priorities[], codingUpdate, keyEvents[], energyNote }`
- **Frecvență**: Daily, 07:00 (configurable)
- **Declanșatori**: Cron
- **Guardrails**: Max 2000 output tokens, max 5 tool calls
- **Approval**: None (read-only)
- **Failure handling**: Retry 2x, fallback to data-only summary (no AI narrative)
- **Evaluation**: User engagement (read rate, time spent)

## 2. Weekly Review Agent

- **Scop**: Generează review-ul săptămânal
- **Inpute**: Full week data across all domains
- **Tool-uri**: search_canonical, get_metrics, graph_query, semantic_search
- **Output**: `WeeklyReview { wins[], challenges[], patterns[], goalProgress[], nextWeek[] }`
- **Frecvență**: Weekly, Sunday 18:00
- **Guardrails**: Max 4000 tokens, max 10 tool calls
- **Approval**: None (read-only)

## 3. Execution Planner Agent

- **Scop**: Creează planuri de execuție bazate pe goals
- **Inpute**: Active goals, current capacity, patterns, open tasks
- **Tool-uri**: search_canonical, get_metrics, graph_query, create_plan_draft
- **Output**: `ExecutionPlan { title, steps[], dependencies[], estimated_effort }`
- **Frecvență**: On-demand + weekly pre-planning
- **Guardrails**: Max 3000 tokens, plans saved as draft
- **Approval**: Plan activation requires user approval

## 4. Focus Coach Agent

- **Scop**: Sugerează ce să fac acum bazat pe energie și context
- **Inpute**: Current health state, time of day, open tasks, recent activity
- **Tool-uri**: get_metrics, search_canonical
- **Output**: `FocusSuggestion { recommendation, rationale, estimatedDuration, energyMatch }`
- **Frecvență**: On-demand
- **Guardrails**: Max 500 tokens, max 3 tool calls
- **Approval**: None (suggestion only)

## 5. Financial Watch Agent

- **Scop**: Monitorizează cheltuieli, detectează anomalii, urmărește facturi
- **Inpute**: Recent transactions, recurring patterns, invoices
- **Tool-uri**: search_canonical, get_metrics
- **Output**: `FinancialAlert { type, amount_redacted, category, explanation, severity }`
- **Frecvență**: Daily scan + per-transaction anomaly check
- **Guardrails**: Financial amounts REDACTED in output, max 1000 tokens
- **Approval**: None (alerts only)

## 6. Health Pattern Agent

- **Scop**: Identifică patternuri de sănătate și corelații
- **Inpute**: 30-day health data, activity data, coding patterns
- **Tool-uri**: get_metrics, graph_query
- **Output**: `HealthPattern { pattern, correlation, confidence, recommendation }`
- **Frecvență**: Weekly
- **Guardrails**: No medical advice, framing as "observation"
- **Approval**: None

## 7. Memory Librarian Agent

- **Scop**: Organizează și sintetizează memoria semantică
- **Inpute**: Recent embeddings, fragmented knowledge, duplicates
- **Tool-uri**: semantic_search, search_canonical, create_summary
- **Output**: Consolidated summaries, updated embeddings
- **Frecvență**: Weekly (background)
- **Guardrails**: Max 20 summaries per run
- **Approval**: None (internal optimization)

## 8. Knowledge Graph Curator Agent

- **Scop**: Îmbunătățește calitatea knowledge graph-ului
- **Inpute**: Recent canonical records, existing graph, unlinked entities
- **Tool-uri**: graph_query, semantic_search, update_graph
- **Output**: New edges, merged nodes, confidence updates
- **Frecvență**: Daily (background)
- **Guardrails**: Max 50 graph updates per run, confidence thresholds
- **Approval**: None (internal)

## 9. Inbox / Conversation Synthesizer Agent

- **Scop**: Sintetizează conversații noi, extrage action items
- **Inpute**: New conversations/messages
- **Tool-uri**: search_canonical, semantic_search, create_task_draft
- **Output**: `ConversationSummary { summary, actionItems[], decisions[], people[] }`
- **Frecvență**: Per new conversation batch (near-realtime)
- **Guardrails**: Max 1000 tokens per conversation
- **Approval**: Task creation requires approval

## 10. GitHub Progress Agent

- **Scop**: Analizează activitatea GitHub și raportează progres
- **Inpute**: Recent commits, PRs, issues, reviews
- **Tool-uri**: search_canonical, get_metrics
- **Output**: `GitProgress { summary, activeRepos[], prStatus[], velocity, blockers[] }`
- **Frecvență**: Daily
- **Guardrails**: Max 1500 tokens
- **Approval**: None

---

## Tool Categories

| Category | Tools | Write? | Approval? |
|----------|-------|--------|-----------|
| Query | search_canonical, semantic_search, graph_query, get_metrics | No | No |
| Read | get_active_plans, get_user_profile | No | No |
| Draft | create_plan_draft, create_task_draft, create_insight | Internal write | No |
| Notify | dispatch_notification | External notify | No |
| Action | send_message, update_document, create_task | External write | **YES** |
| System | trigger_sync, create_approval_request | System action | Depends |

## Agent Permission Model

```typescript
interface AgentPermissions {
  canRead: string[];         // Entity types agent can query
  canSearch: boolean;        // Semantic search access
  canGraphQuery: boolean;    // Knowledge graph access
  canDraft: string[];        // Entity types agent can draft
  canWrite: string[];        // Entity types agent can write (with approval)
  maxToolCalls: number;      // Per run
  maxTokens: number;         // Output budget
  maxCost: number;           // USD per run
  timeout: number;           // Seconds
  requiresApproval: string[]; // Actions requiring approval
}
```
