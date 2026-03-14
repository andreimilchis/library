# eye1.ai — Canonical Data Model

## Core Entities

### User
- **Scop**: Proprietarul sistemului (single-user MVP)
- **Câmpuri obligatorii**: `id`, `email`, `name`, `createdAt`, `updatedAt`
- **Câmpuri opționale**: `avatarUrl`, `timezone`, `preferences (JSONB)`
- **Cheie naturală**: `email`
- **Cheie sintetică**: `UUID v4`
- **Lifecycle**: Created once, updated on profile changes
- **Retention**: Permanent

### SourceConnection
- **Scop**: O conexiune activă/inactivă la o platformă externă
- **Câmpuri obligatorii**: `id`, `userId`, `sourceType` (enum), `status` (connected|disconnected|error), `createdAt`
- **Câmpuri opționale**: `config (JSONB encrypted)`, `credentials (JSONB encrypted)`, `lastSyncAt`, `lastError`, `scopes[]`, `metadata (JSONB)`
- **Cheie naturală**: `userId + sourceType`
- **Statusuri**: `pending_auth`, `connected`, `syncing`, `error`, `disconnected`, `deleted`
- **Lifecycle**: Created on connect, updated on sync, soft-deleted on disconnect
- **Retention**: Permanent (audit trail), credentials wiped on disconnect

### SyncJob
- **Scop**: O execuție de sincronizare cu o sursă
- **Câmpuri obligatorii**: `id`, `sourceConnectionId`, `type` (full|incremental|backfill|webhook|import), `status`, `startedAt`
- **Câmpuri opționale**: `completedAt`, `cursor (JSONB)`, `stats (JSONB)`, `error`, `rawEventsCount`, `normalizedCount`
- **Statusuri**: `pending`, `running`, `completed`, `failed`, `cancelled`
- **Indexuri**: `sourceConnectionId + startedAt`, `status`
- **Retention**: 90 zile (soft delete, stats kept)

### RawEvent
- **Scop**: Referință la un payload brut stocat în S3
- **Câmpuri obligatorii**: `id`, `sourceConnectionId`, `syncJobId`, `sourceType`, `eventType`, `receivedAt`, `storageKey` (S3 path)
- **Câmpuri opționale**: `checksum`, `sizeBytes`, `processedAt`, `processingError`
- **Cheie naturală**: `sourceType + externalEventId`
- **Dedup key**: `sourceType + eventType + externalId + receivedAt`
- **Retention**: 1 an (raw data), referințe permanent

### NormalizedRecord
- **Scop**: Un record normalizat derivat din raw events
- **Câmpuri obligatorii**: `id`, `rawEventId`, `sourceType`, `entityType`, `entityId`, `data (JSONB)`, `normalizedAt`
- **Câmpuri opționale**: `version`, `previousVersionId`, `confidence`
- **Indexuri**: `entityType + entityId`, `sourceType + normalizedAt`
- **Lifecycle**: Created from pipeline, versioned on updates

### Document
- **Scop**: Orice conținut text persistent (note, pages, PR descriptions, conversation exports)
- **Câmpuri obligatorii**: `id`, `sourceType`, `externalId`, `title`, `contentType` (markdown|html|plaintext), `content`, `createdAt`
- **Câmpuri opționale**: `updatedAt`, `authorId`, `parentId`, `tags[]`, `metadata (JSONB)`, `wordCount`, `language`
- **Indexuri**: `sourceType + externalId`, `createdAt`, full-text on `content`
- **Retention**: Permanent
- **Example**: `{ id: "uuid", sourceType: "notion", externalId: "page-123", title: "Project Alpha Plan", contentType: "markdown", content: "# Plan..." }`

### Message
- **Scop**: Un mesaj individual dintr-o conversație
- **Câmpuri obligatorii**: `id`, `conversationId`, `role` (user|assistant|system|participant), `content`, `sentAt`
- **Câmpuri opționale**: `authorName`, `authorExternalId`, `metadata (JSONB)`, `attachments (JSONB)`
- **Indexuri**: `conversationId + sentAt`
- **Retention**: Dependent de sursă

### Conversation
- **Scop**: Un thread de mesaje (WhatsApp, Claude, ChatGPT, GitHub PR comments)
- **Câmpuri obligatorii**: `id`, `sourceType`, `externalId`, `title`, `startedAt`
- **Câmpuri opționale**: `endedAt`, `participantCount`, `messageCount`, `summary`, `tags[]`, `metadata (JSONB)`
- **Indexuri**: `sourceType + externalId`, `startedAt`
- **Retention**: Permanent

### Task
- **Scop**: Un task/action item extras sau creat
- **Câmpuri obligatorii**: `id`, `title`, `status` (open|in_progress|done|cancelled), `createdAt`
- **Câmpuri opționale**: `description`, `sourceType`, `externalId`, `projectId`, `dueDate`, `priority`, `tags[]`, `completedAt`
- **Lifecycle**: Created → in_progress → done/cancelled
- **Retention**: Permanent

### Project
- **Scop**: Un proiect sau inițiativă
- **Câmpuri obligatorii**: `id`, `name`, `status` (active|paused|completed|archived), `createdAt`
- **Câmpuri opționale**: `description`, `sourceType`, `externalId`, `startDate`, `endDate`, `tags[]`, `metadata (JSONB)`
- **Retention**: Permanent

### Goal
- **Scop**: Un obiectiv personal sau profesional
- **Câmpuri obligatorii**: `id`, `title`, `type` (personal|professional|health|financial), `status`, `createdAt`
- **Câmpuri opționale**: `description`, `targetDate`, `metrics (JSONB)`, `parentGoalId`
- **Retention**: Permanent

### Insight
- **Scop**: Un insight generat de AI reasoning layer
- **Câmpuri obligatorii**: `id`, `type` (alert|digest|recommendation|anomaly|pattern|contradiction), `title`, `content`, `confidence`, `generatedAt`
- **Câmpuri opționale**: `sourceInsightIds[]`, `relatedEntityIds (JSONB)`, `agentRunId`, `expiresAt`, `dismissedAt`, `actionedAt`, `metadata (JSONB)`
- **Statusuri**: `generated`, `delivered`, `read`, `actioned`, `dismissed`, `expired`
- **Retention**: 1 an active, archived after

### FinancialTransaction
- **Scop**: O tranzacție financiară
- **Câmpuri obligatorii**: `id`, `sourceType`, `externalId`, `amount`, `currency`, `type` (income|expense|transfer), `date`, `createdAt`
- **Câmpuri opționale**: `description`, `merchant`, `category`, `tags[]`, `invoiceId`, `metadata (JSONB)`, `isRecurring`
- **Security**: `amount` encrypted at application level
- **Indexuri**: `date`, `category`, `sourceType + externalId`
- **Retention**: 7 ani (financial compliance)

### Invoice
- **Scop**: O factură emisă sau primită
- **Câmpuri obligatorii**: `id`, `sourceType`, `externalId`, `number`, `type` (issued|received), `amount`, `currency`, `status`, `issuedAt`
- **Câmpuri opționale**: `dueDate`, `paidAt`, `clientName`, `clientId`, `items (JSONB)`, `metadata (JSONB)`
- **Security**: Encrypted amounts, PII-tagged client info
- **Retention**: 10 ani

### HealthSample
- **Scop**: O măsurătoare de sănătate la un moment dat
- **Câmpuri obligatorii**: `id`, `sourceType`, `metricType` (heart_rate|hrv|spo2|respiratory_rate|skin_temp), `value`, `unit`, `measuredAt`
- **Câmpuri opționale**: `metadata (JSONB)`
- **Security**: Column-level encryption
- **Retention**: Permanent

### SleepSession
- **Scop**: O sesiune de somn completă
- **Câmpuri obligatorii**: `id`, `sourceType`, `externalId`, `startTime`, `endTime`, `qualityScore`
- **Câmpuri opționale**: `stages (JSONB)`, `respiratoryRate`, `disturbances`, `metadata (JSONB)`
- **Security**: Encrypted
- **Retention**: Permanent

### RecoveryScore
- **Scop**: Scor de recovery zilnic
- **Câmpuri obligatorii**: `id`, `sourceType`, `externalId`, `score`, `date`, `restingHeartRate`, `hrv`
- **Câmpuri opționale**: `spo2`, `skinTemp`, `metadata (JSONB)`
- **Security**: Encrypted
- **Retention**: Permanent

### ActivitySession
- **Scop**: O sesiune de activitate/workout
- **Câmpuri obligatorii**: `id`, `sourceType`, `externalId`, `activityType`, `startTime`, `endTime`, `strain`
- **Câmpuri opționale**: `calories`, `avgHeartRate`, `maxHeartRate`, `metadata (JSONB)`
- **Retention**: Permanent

### AudioTrackEvent
- **Scop**: Un track ascultat pe Spotify
- **Câmpuri obligatorii**: `id`, `sourceType`, `trackName`, `artistName`, `playedAt`, `durationMs`
- **Câmpuri opționale**: `albumName`, `trackExternalId`, `audioFeatures (JSONB)`, `contextType` (playlist|album|artist)
- **Retention**: 1 an

### GitRepository
- **Scop**: Un repository GitHub
- **Câmpuri obligatorii**: `id`, `sourceType`, `externalId`, `fullName`, `name`, `isPrivate`
- **Câmpuri opționale**: `description`, `language`, `topics[]`, `stars`, `forks`, `lastPushAt`
- **Retention**: Permanent

### Commit
- **Scop**: Un commit git
- **Câmpuri obligatorii**: `id`, `repositoryId`, `sha`, `message`, `authorName`, `authorEmail`, `committedAt`
- **Câmpuri opționale**: `additions`, `deletions`, `filesChanged`, `parentShas[]`
- **Indexuri**: `repositoryId + committedAt`, `sha`
- **Retention**: Permanent

### PullRequest
- **Scop**: Un Pull Request
- **Câmpuri obligatorii**: `id`, `repositoryId`, `externalId`, `number`, `title`, `state` (open|closed|merged), `authorLogin`, `createdAt`
- **Câmpuri opționale**: `body`, `mergedAt`, `closedAt`, `reviewers[]`, `labels[]`, `additions`, `deletions`, `commitsCount`, `commentsCount`
- **Retention**: Permanent

### Issue
- **Scop**: Un Issue GitHub
- **Câmpuri obligatorii**: `id`, `repositoryId`, `externalId`, `number`, `title`, `state`, `authorLogin`, `createdAt`
- **Câmpuri opționale**: `body`, `labels[]`, `assignees[]`, `closedAt`, `commentsCount`
- **Retention**: Permanent

### KnowledgeNode
- **Scop**: Un nod în knowledge graph
- **Câmpuri obligatorii**: `id`, `type` (person|project|concept|action_item|habit|health_state|financial_obligation|repository|decision|risk|opportunity), `name`, `createdAt`
- **Câmpuri opționale**: `description`, `properties (JSONB)`, `confidence`, `sourceType`, `sourceEntityId`, `sourceEntityType`, `validFrom`, `validTo`
- **Indexuri**: `type`, `name`, `sourceEntityId`
- **Retention**: Permanent (soft delete)

### KnowledgeEdge
- **Scop**: O relație între două noduri
- **Câmpuri obligatorii**: `id`, `fromNodeId`, `toNodeId`, `edgeType`, `createdAt`
- **Câmpuri opționale**: `confidence`, `weight`, `properties (JSONB)`, `sourceType`, `validFrom`, `validTo`, `evidence[]`
- **Edge types**: `discussed_in`, `mentioned_in`, `belongs_to`, `influences`, `blocks`, `supports`, `related_to`, `depends_on`, `created_from`, `caused_by`, `paid_with`, `linked_to_goal`, `evidence_from`, `derived_from`
- **Indexuri**: `fromNodeId`, `toNodeId`, `edgeType`, `fromNodeId + edgeType`
- **Retention**: Permanent (soft delete)

### EmbeddingRecord
- **Scop**: Un vector embedding asociat unui chunk de text
- **Câmpuri obligatorii**: `id`, `sourceEntityType`, `sourceEntityId`, `chunkIndex`, `content`, `embedding (vector)`, `model`, `createdAt`
- **Câmpuri opționale**: `metadata (JSONB)`, `tokenCount`
- **Indexuri**: HNSW index pe `embedding`, `sourceEntityType + sourceEntityId`
- **Retention**: Re-generated la model change

### AgentRun
- **Scop**: O execuție a unui agent software
- **Câmpuri obligatorii**: `id`, `agentType`, `status` (pending|running|completed|failed|cancelled), `startedAt`
- **Câmpuri opționale**: `completedAt`, `trigger`, `input (JSONB)`, `output (JSONB)`, `tokensUsed`, `cost`, `error`, `parentRunId`
- **Retention**: 1 an

### AgentToolCall
- **Scop**: Un tool call făcut de un agent
- **Câmpuri obligatorii**: `id`, `agentRunId`, `toolName`, `input (JSONB)`, `output (JSONB)`, `calledAt`
- **Câmpuri opționale**: `durationMs`, `status`, `error`
- **Retention**: 1 an

### AuditLog
- **Scop**: Trail complet al tuturor acțiunilor din sistem
- **Câmpuri obligatorii**: `id`, `action` (source.connect|source.sync|record.read|agent.action|data.export|data.delete), `actorType` (user|system|agent), `actorId`, `timestamp`
- **Câmpuri opționale**: `entityType`, `entityId`, `metadata (JSONB)`, `ipAddress`
- **Indexuri**: `action + timestamp`, `entityType + entityId`
- **Retention**: 3 ani, immutable (append-only)

### Notification
- **Scop**: O notificare pentru utilizator
- **Câmpuri obligatorii**: `id`, `type`, `title`, `message`, `createdAt`
- **Câmpuri opționale**: `readAt`, `actionUrl`, `insightId`, `agentRunId`, `priority`
- **Statusuri**: `unread`, `read`, `actioned`, `dismissed`
- **Retention**: 90 zile

### ApprovalRequest
- **Scop**: O cerere de aprobare pentru o acțiune externă
- **Câmpuri obligatorii**: `id`, `agentRunId`, `action`, `description`, `status` (pending|approved|rejected|expired), `createdAt`
- **Câmpuri opționale**: `payload (JSONB)`, `resolvedAt`, `resolvedBy`, `expiresAt`
- **Retention**: 1 an

### ExecutionPlan
- **Scop**: Un plan de execuție generat sau definit manual
- **Câmpuri obligatorii**: `id`, `title`, `status` (draft|active|completed|abandoned), `createdAt`
- **Câmpuri opționale**: `description`, `goalId`, `steps (JSONB)`, `startDate`, `endDate`, `agentRunId`, `progress`
- **Retention**: Permanent

### Metric / TimeSeriesMetric
- **Scop**: Metrici agregate și time series
- **Câmpuri obligatorii**: `id`, `name`, `value`, `unit`, `date`, `grain` (daily|weekly|monthly)
- **Câmpuri opționale**: `sourceType`, `category`, `metadata (JSONB)`
- **Indexuri**: `name + date + grain`
- **Retention**: Permanent

### Recommendation
- **Scop**: O recomandare specifică acționabilă
- **Câmpuri obligatorii**: `id`, `insightId`, `title`, `description`, `priority`, `createdAt`
- **Câmpuri opționale**: `actionType`, `status`, `dismissedAt`, `actionedAt`
- **Retention**: 6 luni active

---

## Schema Summary (Drizzle Format)

Schema-ul complet va fi implementat în `packages/db/src/schema/`. Fiecare entity group va avea propriul fișier:
- `auth.ts` — User
- `sources.ts` — SourceConnection, SyncJob
- `raw.ts` — RawEvent
- `normalized.ts` — NormalizedRecord
- `documents.ts` — Document, Note
- `conversations.ts` — Conversation, Message
- `tasks.ts` — Task, Project, Goal, ExecutionPlan
- `insights.ts` — Insight, Recommendation, Notification
- `finance.ts` — FinancialTransaction, Invoice
- `health.ts` — HealthSample, SleepSession, RecoveryScore, ActivitySession
- `music.ts` — AudioTrackEvent
- `git.ts` — GitRepository, Commit, PullRequest, Issue
- `graph.ts` — KnowledgeNode, KnowledgeEdge
- `embeddings.ts` — EmbeddingRecord
- `agents.ts` — AgentRun, AgentToolCall, ApprovalRequest
- `audit.ts` — AuditLog
- `metrics.ts` — TimeSeriesMetric
