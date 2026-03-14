# eye1.ai — Arhitectură High-Level

## Architecture Principles

1. **Modularitate** — Fiecare componentă este înlocuibilă fără a afecta restul
2. **Event-driven** — Comunicarea internă se face prin evenimente tipizate
3. **Schema-first** — Contractele sunt definite înainte de implementare
4. **Privacy-by-design** — Datele sensibile sunt marcate, encrypted, redactate
5. **Fail-safe** — Orice eșec este logged, retryed sau dead-lettered
6. **Idempotent** — Orice operație poate fi reluată fără side-effects
7. **Observable** — Orice componentă emite logs, metrics, traces
8. **Cost-aware** — LLM calls sunt cached, batched, tiered

## Diagrama Arhitecturală

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DASHBOARD / UI LAYER                            │
│  Next.js + React + Tailwind + shadcn/ui + TanStack Query              │
│  [Home] [Feed] [Health] [Finance] [Search] [Graph] [Sources] [Admin]  │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │ REST + WebSocket
┌──────────────────────────────▼──────────────────────────────────────────┐
│                     API GATEWAY / SERVICE LAYER                         │
│  Next.js API Routes + Service Layer (NestJS-style modules)             │
│  [Auth] [Sources] [Ingestion] [Query] [Insights] [Agents] [Admin]     │
└──┬───────┬────────┬────────┬────────┬────────┬────────┬───────────────┘
   │       │        │        │        │        │        │
   ▼       ▼        ▼        ▼        ▼        ▼        ▼
┌──────┐ ┌────────────────┐ ┌──────────────┐ ┌─────────────────────────┐
│AUTH  │ │SOURCE CONNECTORS│ │AI REASONING  │ │AGENTS LAYER             │
│Clerk │ │[GitHub]        │ │[Context      │ │[Daily Briefing]         │
│      │ │[Notion]        │ │ Builder]     │ │[Weekly Review]          │
│      │ │[WHOOP]         │ │[Insight Gen] │ │[Execution Planner]      │
│      │ │[Revolut]*      │ │[Planner]     │ │[Focus Coach]            │
│      │ │[SmartBill]*    │ │[Evaluator]   │ │[Financial Watch]        │
│      │ │[WhatsApp]*     │ │[Prompt Reg]  │ │[Health Pattern]         │
│      │ │[Spotify]*      │ │[Cost Track]  │ │[Memory Librarian]       │
│      │ │[Claude]*       │ └──────┬───────┘ │[Graph Curator]          │
│      │ │[ChatGPT]*      │        │         │[Inbox Synthesizer]      │
│      │ │ * = Phase 2+   │        │         │[GitHub Progress]        │
└──────┘ └───────┬────────┘        │         └────────┬────────────────┘
                 │                  │                   │
                 ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    INGESTION & EVENT LAYER                              │
│  BullMQ + Redis | Event Bus | Job Scheduler | Dead Letter Queue        │
│  [receive] → [validate] → [persist raw] → [normalize] → [enrich]     │
│  → [deduplicate] → [write canonical] → [embed] → [graph update]      │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
┌──────────────┐  ┌───────────────────┐  ┌───────────────────────┐
│RAW DATA LAYER│  │CANONICAL DATA     │  │ANALYTICS / WAREHOUSE  │
│S3-compatible │  │PostgreSQL         │  │PostgreSQL + Mat Views │
│Raw payloads  │  │Normalized records │  │Fact tables            │
│Partitioned   │  │Source connections │  │Dimension tables       │
│by source/date│  │Sync jobs          │  │Daily/Weekly/Monthly   │
│Checksummed   │  │Audit logs         │  │aggregates             │
└──────────────┘  └────────┬──────────┘  └───────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
┌──────────────────────┐  ┌──────────────────────────┐
│VECTOR MEMORY LAYER   │  │KNOWLEDGE GRAPH LAYER     │
│pgvector              │  │Postgres graph tables     │
│Embeddings            │  │Nodes + Edges             │
│Chunks + metadata     │  │Confidence scores         │
│Semantic search       │  │Temporal validity         │
│Hybrid search         │  │Source provenance         │
└──────────────────────┘  └──────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│              CROSS-CUTTING: SECURITY / GOVERNANCE / OBSERVABILITY       │
│  [Encryption] [PII Tagging] [Audit Trail] [Consent] [Redaction]       │
│  [Structured Logs] [Tracing] [Metrics] [Alerting] [Cost Tracking]     │
│  [Backup/Restore] [Schema Versioning] [Rate Limiting]                  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Layer Details

### Layer 1: Source Connectors
- **Scop**: Abstractizarea comunicării cu platformele externe
- **Responsabilități**: Auth, fetch, webhook handling, token refresh, rate limiting
- **Input**: Configurație per sursă, credențiale, schedule
- **Output**: Raw payloads (JSON/files) → Ingestion Layer
- **Contracte**: `ISourceConnector` interface cu metode standard
- **Failure modes**: Auth expired, rate limited, API down, schema changed
- **Scaling**: Horizontal — fiecare connector rulează independent
- **Ce stochează**: Nimic persistent — doar pass-through
- **Ce NU stochează**: Date procesate

### Layer 2: Ingestion & Event Layer
- **Scop**: Orchestrarea pipeline-ului de la raw data la canonical records
- **Responsabilități**: Validare, persistare raw, normalizare, dedup, enrichment
- **Input**: Raw payloads din connectors
- **Output**: Canonical records în Postgres, embeddings în pgvector, edges în graph
- **Contracte**: Typed events pe BullMQ, job schemas cu Zod
- **Failure modes**: Validation failure, normalization error, DB write failure
- **Scaling**: Queue-based — workers adăugați la nevoie
- **Ce stochează**: Job state în Redis, raw payloads în S3
- **Ce NU stochează**: Date procesate (le trimite downstream)

### Layer 3: Raw Data Layer
- **Scop**: Imutable store pentru toate datele brute primite
- **Responsabilități**: Persistare fidelă, partitionare, checksumming, replay
- **Input**: Raw JSON/files din connectors
- **Output**: Referințe către raw objects (S3 keys)
- **Contracte**: `{source}/{date}/{type}/{id}.json`
- **Failure modes**: Storage unavailable, corruption
- **Scaling**: S3 scales infinit
- **Ce stochează**: Exact ce a venit de la sursă, nemodificat
- **Ce NU stochează**: Date procesate, metadate de business

### Layer 4: Normalization Layer
- **Scop**: Transformarea raw payloads în canonical data model
- **Responsabilități**: Schema mapping, type coercion, field extraction, identity resolution
- **Input**: Raw payloads + raw storage references
- **Output**: NormalizedRecord objects
- **Failure modes**: Unknown schema, missing required fields, type mismatch

### Layer 5: Canonical Data Model / Operational DB
- **Scop**: Single source of truth pentru toate datele normalizate
- **Responsabilități**: CRUD, relații, indexuri, constraints
- **Input**: NormalizedRecords din pipeline
- **Output**: Queries from API layer
- **Ce stochează**: Toate entitățile canonice (users, conversations, tasks, health, finance, etc.)

### Layer 6: Analytics / Data Warehouse
- **Scop**: Agregări precomputate și analytics performante
- **Responsabilități**: Materialized views, daily/weekly/monthly rollups
- **Input**: Canonical records (triggered by write events)
- **Output**: Metrics, trends, aggregates pentru Dashboard și AI Layer
- **Ce stochează**: Fact tables, dimension tables, aggregates
- **Ce NU stochează**: Raw data, PII în clar

### Layer 7: Vector Memory (pgvector)
- **Scop**: Semantic search și memory retrieval
- **Responsabilități**: Embedding storage, similarity search, hybrid search
- **Input**: Chunks din documente, conversații, notes, insights
- **Output**: Ranked results cu similarity scores
- **Scaling**: pgvector performant până la ~5M vectors, apoi migrare

### Layer 8: Knowledge Graph
- **Scop**: Relații semantice între entități cross-domain
- **Responsabilități**: Node/edge management, traversal, pattern queries
- **Input**: Canonical records + AI-extracted relations
- **Output**: Subgraph-uri pentru context building, graph queries
- **Ce stochează**: Nodes, edges, confidence, temporal validity, provenance

### Layer 9: AI Reasoning Layer
- **Scop**: Generare insight-uri, planning, anomaly detection
- **Responsabilități**: Context composition, prompt management, LLM calls, evaluation
- **Input**: Canonical data, vector search results, graph subgraphs, user goals
- **Output**: Insights, recommendations, plans, alerts
- **Cost concerns**: Caching, model tiering (haiku for simple, opus for complex)

### Layer 10: Agents Layer
- **Scop**: Automated workflows cu human-in-the-loop
- **Responsabilități**: Agent execution, tool calling, approval management
- **Input**: Triggers (cron, events, user requests)
- **Output**: Drafts, insights, approval requests
- **Guardrails**: No external writes fără approval, cost caps, timeout

### Layer 11: API Gateway
- **Scop**: Unified API pentru frontend și potențial external consumers
- **Responsabilități**: Auth, rate limiting, routing, validation, serialization
- **Input**: HTTP requests
- **Output**: JSON responses + WebSocket events

### Layer 12: Dashboard / UI
- **Scop**: Interfața utilizatorului cu sistemul
- **Responsabilități**: Vizualizare, interacțiune, search, control
- **Input**: API responses
- **Output**: User actions → API calls

### Cross-cutting: Security / Governance / Observability
- **Scop**: Trust, compliance, debugging, monitoring
- **Responsabilități**: Encryption, audit, logging, tracing, alerting, PII management

## Architectural Decisions

### Decision: Next.js Full-Stack (nu NestJS separat)
- **Why**: Single deployment, shared types, simpler infra pentru single-user system
- **Trade-offs**: Mai puțină separare concerns, dar mai rapid de dezvoltat
- **Mitigation**: Service layer pattern intern — fiecare domain are propriul service module

### Decision: Clerk pentru Auth
- **Why**: Zero-config auth, session management, webhook support, hosted UI
- **Trade-offs**: Dependency externă, cost la scale
- **Mitigation**: Auth abstractizat într-un `auth` package, poate fi înlocuit cu Auth.js

### Decision: Drizzle ORM (nu Prisma)
- **Why**: Type-safe SQL, mai performant, mai puțin magic, SQL-first approach
- **Trade-offs**: Ecosistem mai mic, mai puțin beginner-friendly
- **Mitigation**: Schema definită clar, migrations versionate

### Decision: BullMQ + Redis pentru queues
- **Why**: Matur, reliable, delayed jobs, retries, dead letter, dashboard
- **Trade-offs**: Redis dependency
- **Mitigation**: Redis este deja necesar pentru caching

### Decision: Monorepo cu Turborepo
- **Why**: Shared types, atomic changes, unified CI, code sharing
- **Trade-offs**: Build complexity, tooling setup
- **Mitigation**: Clear package boundaries
