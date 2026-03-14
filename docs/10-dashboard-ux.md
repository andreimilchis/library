# eye1.ai — Dashboard / UX Design

## Design Philosophy
- Informație densă dar clară
- Design utilitar, premium, executiv
- Dark theme primary, light theme optional
- Accent pe: context, prioritizare, pattern recognition, explainability

---

## 1. Home / Command Center

- **Scop**: Vedere de ansamblu a stării curente
- **Componente**: Health score card, today's priorities, active insights feed, quick actions, source sync status
- **States**: Loading skeleton, empty (no data yet), normal, error (source disconnected)
- **Primary actions**: Ask eye1, view daily brief, mark insight as read
- **Data**: Latest health metrics, top 5 open tasks, last 5 insights, sync status
- **Query**: GET /api/dashboard/home

## 2. Realtime Feed

- **Scop**: Timeline cronologică a evenimentelor din toate sursele
- **Componente**: Event cards (typed by source), filters (source, type, date), infinite scroll
- **States**: Loading, empty, streaming new events
- **Primary actions**: Filter, search, click to detail
- **Data**: NormalizedRecords ordered by timestamp
- **Query**: GET /api/feed?sources=&types=&after=&limit=

## 3. Daily Brief

- **Scop**: Vizualizarea briefing-ului zilnic
- **Componente**: Health summary card, priorities list, coding activity sparkline, key events timeline, energy note
- **States**: Loading, generating (AI working), ready, no data
- **Primary actions**: Regenerate, customize sections
- **Data**: AgentRun output for Daily Briefing Agent
- **Query**: GET /api/insights/daily-brief?date=

## 4. Weekly Review

- **Scop**: Review-ul complet al săptămânii
- **Componente**: Week health chart, wins/challenges cards, goal progress bars, pattern alerts, next week plan
- **Primary actions**: Accept plan, modify, add notes
- **Data**: AgentRun output for Weekly Review Agent + aggregated metrics

## 5. Health Dashboard

- **Scop**: Vizualizare health data din WHOOP
- **Componente**: Sleep score trend (30d), recovery trend (30d), strain chart, HRV trend, sleep stages breakdown, workout log
- **Data**: HealthSample, SleepSession, RecoveryScore, ActivitySession
- **Charts**: Line charts (ECharts), sparklines, heat calendar
- **Query**: GET /api/health/overview?range=30d

## 6. Finance Dashboard

- **Scop**: Vizualizare financiară (Phase 2)
- **Componente**: Monthly burn rate, category breakdown (pie), income vs expense trend, recurring subscriptions list, overdue invoices
- **Data**: FinancialTransaction, Invoice
- **Security**: Amounts displayed only when authenticated + PIN/biometric confirm

## 7. Conversations Dashboard

- **Scop**: Vizualizare conversații cross-platform
- **Componente**: Conversation list, message count trend, topic clusters, action items extracted
- **Data**: Conversation, Message summaries
- **Phase**: Phase 2 (needs WhatsApp/Claude/ChatGPT connectors)

## 8. Knowledge Graph Explorer

- **Scop**: Vizualizare interactivă a knowledge graph-ului
- **Componente**: Force-directed graph visualization, node detail panel, edge list, search, filters by type
- **Phase**: Phase 2 MVP, Phase 3 full
- **Library**: D3.js or vis-network

## 9. Search / Ask eye1

- **Scop**: Semantic search + natural language questions
- **Componente**: Search bar (prominent), results list with source badges, AI answer card, related entities
- **States**: Empty, searching, results, no results, AI generating
- **Primary actions**: Search, click result, ask follow-up
- **Query**: POST /api/search { query, sources?, dateRange? }
- **Backend**: Hybrid search (semantic + full-text) + optional AI reasoning

## 10. Plans & Execution Maps

- **Scop**: Vizualizare și management planuri de execuție
- **Componente**: Plan list, plan detail with steps, progress tracker, drift indicator
- **Phase**: Phase 2 for full functionality, basic display in MVP

## 11. Sources / Integrations Page

- **Scop**: Management conexiuni la platforme
- **Componente**: Source cards (connected/disconnected/error), connect button, sync history, last sync time, data scope controls
- **States**: Per source: not_connected, pending_auth, connected, syncing, error
- **Primary actions**: Connect, disconnect, force sync, view sync history, manage scopes
- **Data**: SourceConnection, SyncJob
- **Query**: GET /api/sources

## 12. Agent Runs / Audit Page

- **Scop**: Transparență asupra acțiunilor sistemului
- **Componente**: Agent run list, run detail (input/output/tools), audit log table, cost tracker
- **Primary actions**: View detail, re-run agent, approve/reject
- **Data**: AgentRun, AgentToolCall, AuditLog

## 13. Settings / Permissions / Data Controls

- **Scop**: Configurare sistem
- **Componente**: Profile settings, notification preferences, AI model preferences, data retention controls, export data, delete data per source
- **Security actions**: Disconnect source + delete data, export all data, view audit trail

---

## Component Library

| Component | Usage |
|-----------|-------|
| InsightCard | Feed, Home, Brief |
| MetricSparkline | Home, Health, Finance |
| SourceStatusBadge | Sources, Home |
| TimelineEvent | Feed, Brief |
| SearchResultCard | Search |
| GraphNode | Graph Explorer |
| ApprovalCard | Agent Runs |
| SyncProgressBar | Sources |
| AnomalyBanner | Home, relevant dashboard |

## Layout

```
┌─────────────────────────────────────────────┐
│ [Logo] eye1.ai    [Search Bar]    [Profile] │
├────────┬────────────────────────────────────┤
│        │                                    │
│ Nav    │  Main Content Area                 │
│        │                                    │
│ Home   │  [Page-specific content]           │
│ Feed   │                                    │
│ Brief  │                                    │
│ Health │                                    │
│ Finance│                                    │
│ Search │                                    │
│ Sources│                                    │
│ Admin  │                                    │
│        │                                    │
└────────┴────────────────────────────────────┘
```
