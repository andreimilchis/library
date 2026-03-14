# eye1.ai — Observability, QA, Testing, Evals

## Logging Strategy

- **Format**: Structured JSON logs
- **Fields**: `timestamp`, `level`, `service`, `traceId`, `spanId`, `message`, `data`
- **Levels**: `debug`, `info`, `warn`, `error`, `fatal`
- **PII in logs**: NEVER — redact before logging
- **Storage**: stdout → log aggregator (Pino for Node.js)
- **Retention**: 30 days hot, 90 days cold

## Metrics Strategy

- **Types**: Counters, gauges, histograms
- **Key metrics**:
  - `ingestion.events.received` (counter, by source)
  - `ingestion.events.processed` (counter, by source)
  - `ingestion.events.failed` (counter, by source)
  - `ingestion.pipeline.duration` (histogram)
  - `sync.job.duration` (histogram, by source)
  - `api.request.duration` (histogram, by endpoint)
  - `api.request.errors` (counter, by endpoint)
  - `llm.tokens.used` (counter, by model+provider)
  - `llm.cost.usd` (gauge, by model)
  - `llm.latency` (histogram)
  - `agent.runs.total` (counter, by agent)
  - `agent.runs.failed` (counter, by agent)
  - `search.queries` (counter)
  - `search.latency` (histogram)
  - `queue.depth` (gauge, by queue)
  - `queue.dlq.depth` (gauge, by queue)

## Tracing Strategy

- **Approach**: OpenTelemetry SDK
- **Traces**: Request → API → Service → DB/Queue/LLM
- **Key spans**: API handler, DB query, S3 operation, LLM call, queue job
- **Sampling**: 100% for errors, 10% for success (configurable)
- **Context propagation**: traceId through queues via job metadata

## Alerting Strategy

- **P1** (immediate): Source auth failure, DB down, DLQ depth > 100
- **P2** (1h): Sync failure > 3x consecutive, LLM cost > daily cap
- **P3** (4h): DLQ depth > 10, slow queries > 5s
- **P4** (daily): Stale syncs (no sync in 24h), embedding gaps

## Test Pyramid

```
          /  E2E Tests  \        (5%)  - Critical flows
         / Integration   \      (25%) - Service + DB + Queue
        / Contract Tests   \    (20%) - Connector schemas
       /   Unit Tests       \   (50%) - Pure logic, mappers
```

### Unit Tests
- Normalizers (raw → canonical mapping)
- Validators (Zod schema tests)
- Deduplication logic
- Metric calculations
- Context builder logic
- Prompt composition

### Integration Tests
- Pipeline flow (receive → normalize → write)
- API endpoints with test DB
- Queue processing with test Redis
- Embedding pipeline with mock provider
- Auth flows with mock Clerk

### Contract Tests
- Per connector: validate real API response samples against expected schema
- Snapshot tests for raw payload → normalized record mapping
- Schema evolution detection (new fields, removed fields)

### E2E Tests
- Connect source → sync → view in dashboard
- Search → get results → view detail
- Agent trigger → run → view output

### Synthetic Payload Tests
- Generate fake but realistic payloads per source
- Test full pipeline with synthetic data
- Cover edge cases: empty fields, unicode, large payloads, nested objects

### Failure Injection Tests
- DB connection failure during write → verify retry + DLQ
- S3 unavailable → verify graceful degradation
- LLM timeout → verify fallback
- Queue full → verify backpressure

### Load Tests
- Ingestion: 1000 events/minute sustained
- Search: 100 queries/minute
- Dashboard: 50 concurrent users (Phase 3)

## RAG Quality Evals

- **Test set**: 50+ queries with expected relevant documents
- **Metrics**: Precision@5, Recall@10, MRR, NDCG
- **Frequency**: After embedding model change, monthly otherwise
- **Tooling**: Custom eval script + spreadsheet

## Insight Quality Evals

- **Test set**: 20+ scenarios with expected insight types
- **Evaluation**: Human review (is the insight accurate, useful, actionable?)
- **Rubric**: Accuracy (0-5), Relevance (0-5), Actionability (0-5)
- **Frequency**: After prompt change, monthly otherwise

## Agent Evals

- **Per agent**: Define 5-10 test scenarios
- **Evaluation**: Output schema validation + human quality review
- **Metrics**: Success rate, tool call count, cost, latency
- **Regression**: Compare current vs previous agent version outputs

## Replay-based Debugging

- Raw events stored in S3 can be replayed through pipeline
- Agent runs recorded with full input/output for replay
- LLM calls logged with prompt + response for debugging
- Pipeline errors include rawEventId for exact replay
