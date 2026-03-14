# eye1.ai — Pipeline Design

## Pipeline Stages

```
[Source] → receive → validate → authenticate → persist_raw → enqueue
         → normalize → resolve_identity → deduplicate → enrich
         → write_canonical → generate_embeddings → update_graph
         → trigger_insights → log_audit
```

### Stage 1: Receive
- **Input**: HTTP webhook payload / API response / uploaded file
- **Output**: `RawIngestEvent { source, eventType, payload, receivedAt, headers }`
- **Validation**: Basic HTTP validation, content-type check, size limit (10MB)
- **Idempotency key**: `X-Delivery-Id` header (webhooks) sau `source + externalId + timestamp`
- **Error handling**: 400 for invalid, 200 immediately for webhooks (async processing)

### Stage 2: Validate
- **Input**: `RawIngestEvent`
- **Output**: `ValidatedEvent` sau `ValidationError`
- **Validation**: Zod schema per source + event type, required fields check
- **Error handling**: Dead-letter queue cu motivul eșecului

### Stage 3: Authenticate Source
- **Input**: `ValidatedEvent`
- **Output**: `AuthenticatedEvent`
- **Validation**: Webhook signature (HMAC-SHA256), source connection exists and is active
- **Error handling**: Reject + security log

### Stage 4: Persist Raw
- **Input**: `AuthenticatedEvent`
- **Output**: `PersistedRawEvent { storageKey, checksum }`
- **Storage**: S3 key = `raw/{source}/{YYYY}/{MM}/{DD}/{eventType}/{uuid}.json.gz`
- **Idempotency**: Check checksum, skip if identical payload exists
- **Error handling**: Retry 3x, then dead-letter

### Stage 5: Enqueue Normalization
- **Input**: `PersistedRawEvent`
- **Output**: BullMQ job in `normalization` queue
- **Job data**: `{ rawEventId, storageKey, sourceType, eventType, priority }`
- **Priority**: Webhooks > polls > backfill > imports

### Stage 6: Normalize
- **Input**: Raw payload from S3
- **Output**: `NormalizedRecord[]`
- **Process**: Source-specific normalizer transforms raw → canonical entities
- **Validation**: Canonical schema validation with Zod
- **Error handling**: Partial success possible (some entities normalize, others fail)
- **Retry**: 3x with backoff, then dead-letter

### Stage 7: Resolve Identity
- **Input**: `NormalizedRecord` with external identifiers
- **Output**: `NormalizedRecord` with resolved system IDs
- **Process**: Map external user IDs, repo IDs, etc. to system entities
- **Error handling**: Create new entity if not found (first-time sync)

### Stage 8: Deduplicate
- **Input**: `NormalizedRecord` with system IDs
- **Output**: `DeduplicatedRecord` (new, updated, or duplicate)
- **Strategy**: Natural key lookup (sourceType + externalId)
- **Outcome**: INSERT for new, UPDATE for changed, SKIP for identical
- **Idempotency**: Record version comparison

### Stage 9: Enrich
- **Input**: `DeduplicatedRecord`
- **Output**: `EnrichedRecord`
- **Enrichments**: Category inference, tag extraction, language detection
- **Error handling**: Enrichment failure is non-blocking (proceed without)

### Stage 10: Write Canonical
- **Input**: `EnrichedRecord`
- **Output**: Written to PostgreSQL canonical tables
- **Transaction**: Per-record transactions
- **Error handling**: Retry on deadlock, fail on constraint violation

### Stage 11: Generate Embeddings (conditional)
- **Input**: Canonical records of embeddable types (Document, Message, Conversation summary)
- **Output**: `EmbeddingRecord` written to pgvector
- **Condition**: Only for text-heavy entities, only if content changed
- **Batching**: Collect up to 100 chunks, embed in batch
- **Cost**: Track tokens + API cost per batch
- **Error handling**: Retry, skip on persistent failure (re-embed later)

### Stage 12: Update Graph (conditional)
- **Input**: Canonical records with extractable relationships
- **Output**: `KnowledgeNode` + `KnowledgeEdge` upserts
- **Condition**: Entity types that produce graph updates (conversations, PRs, tasks, etc.)
- **Process**: Rule-based extraction + optional LLM extraction for complex relations
- **Error handling**: Non-blocking, queue for retry

### Stage 13: Trigger Insights (conditional)
- **Input**: Canonical records matching insight trigger rules
- **Output**: Jobs enqueued in `insights` queue
- **Triggers**: Anomaly thresholds, pattern matches, time-based (new day)
- **Error handling**: Non-blocking

### Stage 14: Log Audit
- **Input**: Pipeline completion event
- **Output**: `AuditLog` record
- **Content**: source, action (sync), entity count, duration, errors
- **Error handling**: Fire-and-forget (audit logging should never block pipeline)

---

## Pipeline Types

### Webhook Ingestion Pipeline
- **Trigger**: HTTP POST from external platform
- **Flow**: receive → validate → authenticate → persist_raw → enqueue → [async] normalize → ... → audit
- **Response**: 200 OK immediately
- **Concurrency**: Up to 10 concurrent normalizations per source
- **Priority**: HIGH

### Polling Ingestion Pipeline
- **Trigger**: Cron schedule (per source)
- **Flow**: fetch → receive → validate → persist_raw → enqueue → [async] normalize → ... → audit
- **Cursor management**: Store last cursor in SyncJob, resume on next poll
- **Concurrency**: 1 concurrent poll per source
- **Priority**: MEDIUM

### Import Pipeline
- **Trigger**: User file upload
- **Flow**: upload → validate format → persist_raw → parse → enqueue per-record → normalize → ... → audit
- **Supported formats**: JSON, CSV, ZIP, Markdown
- **Progress**: WebSocket updates to UI
- **Priority**: LOW

### Batch Backfill Pipeline
- **Trigger**: User request or new source connection
- **Flow**: paginated fetch → per-page persist_raw → enqueue batch → normalize → ... → audit
- **Rate limiting**: Respect source API limits
- **Progress tracking**: SyncJob with stats
- **Priority**: LOW

### Manual Upload Pipeline
- **Trigger**: Drag-and-drop or paste
- **Flow**: receive → validate → persist_raw → parse → normalize → ... → audit
- **Priority**: MEDIUM

---

## Raw Storage Strategy

### S3 Key Structure
```
raw/
  {sourceType}/
    {YYYY}/
      {MM}/
        {DD}/
          {eventType}/
            {uuid}.json.gz
```

### Properties
- **Partitioning**: By source, year, month, day
- **Compression**: gzip
- **Checksums**: SHA-256, stored in RawEvent record
- **Replay**: Full replay possible by re-processing S3 objects
- **Retention**: 1 year hot, archive to Glacier after
- **Immutability**: Raw objects are never modified or deleted (except by retention policy)

---

## Dead Letter Queue Strategy

- Separate DLQ per pipeline type: `dlq:webhook`, `dlq:polling`, `dlq:import`, `dlq:backfill`
- Max retries before DLQ: 3 (with exponential backoff)
- DLQ retention: 7 days
- DLQ dashboard: visible in admin UI
- Re-processing: Manual or automatic after fix deployed
- Alerting: Alert on DLQ depth > threshold

---

## Idempotency Strategy

| Stage | Idempotency Key | Strategy |
|-------|-----------------|----------|
| Receive | delivery_id / source+id+ts | Check before persist |
| Persist Raw | checksum | Skip identical |
| Normalize | rawEventId | Skip if already processed |
| Write Canonical | sourceType+externalId | Upsert |
| Embeddings | entityId+chunkIndex+contentHash | Skip if unchanged |
| Graph | nodeType+name / edgeType+from+to | Upsert |
| Audit | Append-only | Always write |
