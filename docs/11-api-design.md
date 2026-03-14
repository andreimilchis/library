# eye1.ai — API Design

## Base URL: `/api/v1`

## Auth
All endpoints require Clerk session token via `Authorization: Bearer <token>`.

---

## Source Connections

### GET /sources
List all source connections.
- **Response**: `{ sources: SourceConnection[] }`

### POST /sources/connect
Initiate connection to a source.
- **Request**: `{ sourceType: string, config?: object }`
- **Response**: `{ connection: SourceConnection, authUrl?: string }`

### POST /sources/:id/disconnect
Disconnect a source.
- **Request**: `{ deleteData?: boolean }`
- **Response**: `{ success: boolean }`

### POST /sources/:id/sync
Trigger manual sync.
- **Request**: `{ type: "full" | "incremental" }`
- **Response**: `{ syncJob: SyncJob }`

### GET /sources/:id/sync-history
Get sync job history.
- **Query**: `?limit=20&offset=0`
- **Response**: `{ jobs: SyncJob[], total: number }`

### POST /sources/:id/callback
OAuth callback handler.

---

## Feed / Events

### GET /feed
Get event feed.
- **Query**: `?sources=github,notion&types=commit,page&after=ISO&before=ISO&limit=50&cursor=`
- **Response**: `{ events: NormalizedRecord[], nextCursor?: string }`

---

## Insights

### GET /insights
List insights.
- **Query**: `?type=alert,digest&status=generated,delivered&limit=20`
- **Response**: `{ insights: Insight[], total: number }`

### GET /insights/daily-brief
Get today's daily brief.
- **Query**: `?date=YYYY-MM-DD`
- **Response**: `{ brief: DailyBriefing | null, generating: boolean }`

### GET /insights/weekly-review
Get weekly review.
- **Query**: `?week=YYYY-Wnn`
- **Response**: `{ review: WeeklyReview | null }`

### POST /insights/:id/dismiss
Dismiss an insight.

### POST /insights/:id/action
Mark insight as actioned.

---

## Metrics

### GET /metrics/:name
Get a specific metric.
- **Query**: `?grain=daily|weekly|monthly&from=ISO&to=ISO`
- **Response**: `{ metric: string, data: { date: string, value: number }[] }`

### GET /metrics/dashboard
Get dashboard metrics bundle.
- **Response**: `{ health: {...}, coding: {...}, finance: {...} }`

---

## Search

### POST /search
Semantic + full-text search.
- **Request**: `{ query: string, sources?: string[], dateRange?: { from, to }, limit?: number }`
- **Response**: `{ results: SearchResult[], aiAnswer?: string }`

---

## Health

### GET /health/overview
- **Query**: `?range=7d|30d|90d`
- **Response**: `{ sleep: SleepTrend, recovery: RecoveryTrend, activity: ActivitySummary }`

### GET /health/sleep
- **Query**: `?from=ISO&to=ISO`
- **Response**: `{ sessions: SleepSession[] }`

### GET /health/recovery
- **Query**: `?from=ISO&to=ISO`
- **Response**: `{ scores: RecoveryScore[] }`

---

## Git

### GET /git/overview
- **Response**: `{ repos: RepoSummary[], recentActivity: CommitSummary[] }`

### GET /git/repos/:id
- **Response**: `{ repo: GitRepository, stats: RepoStats }`

### GET /git/repos/:id/commits
- **Query**: `?from=ISO&to=ISO&limit=50`
- **Response**: `{ commits: Commit[] }`

### GET /git/repos/:id/pulls
- **Query**: `?state=open|closed|merged&limit=20`
- **Response**: `{ pulls: PullRequest[] }`

---

## Knowledge Graph

### POST /graph/query
Query the knowledge graph.
- **Request**: `{ nodeTypes?: string[], edgeTypes?: string[], depth?: number, rootNodeId?: string }`
- **Response**: `{ nodes: KnowledgeNode[], edges: KnowledgeEdge[] }`

### GET /graph/node/:id
Get node detail with edges.
- **Response**: `{ node: KnowledgeNode, edges: KnowledgeEdge[], relatedNodes: KnowledgeNode[] }`

---

## Plans

### GET /plans
- **Query**: `?status=active|draft`
- **Response**: `{ plans: ExecutionPlan[] }`

### POST /plans
Create execution plan.
- **Request**: `{ title, description, goalId?, steps[] }`

### PATCH /plans/:id
Update plan.

---

## Agents

### GET /agents/runs
- **Query**: `?agentType=&status=&limit=20`
- **Response**: `{ runs: AgentRun[] }`

### GET /agents/runs/:id
- **Response**: `{ run: AgentRun, toolCalls: AgentToolCall[] }`

### POST /agents/:type/trigger
Manually trigger an agent.
- **Request**: `{ input?: object }`
- **Response**: `{ run: AgentRun }`

---

## Approvals

### GET /approvals
- **Query**: `?status=pending`
- **Response**: `{ approvals: ApprovalRequest[] }`

### POST /approvals/:id/approve
### POST /approvals/:id/reject

---

## Audit

### GET /audit
- **Query**: `?action=&entityType=&from=ISO&to=ISO&limit=50`
- **Response**: `{ logs: AuditLog[], total: number }`

---

## Admin

### GET /admin/system-health
- **Response**: `{ db: "ok", redis: "ok", s3: "ok", queues: QueueStats }`

### POST /admin/reprocess
Reprocess dead-letter items.
- **Request**: `{ queue: string, count?: number }`

---

## Internal Service Contracts

| Service | Responsibility | Consumes | Produces |
|---------|---------------|----------|----------|
| ConnectorService | Source auth, fetch, webhook | External APIs | RawEvents |
| IngestionService | Pipeline orchestration | RawEvents | NormalizedRecords |
| NormalizationService | Transform raw → canonical | RawPayloads | CanonicalEntities |
| MemoryService | Embedding, search | Documents, Messages | EmbeddingRecords, SearchResults |
| GraphService | Node/edge CRUD, queries | CanonicalEntities | GraphUpdates |
| ReasoningService | AI context + LLM calls | AllData | Insights |
| AgentService | Agent execution | Triggers | AgentRuns, Insights |
| NotificationService | Notification dispatch | Insights, Alerts | Notifications |
