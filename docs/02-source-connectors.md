# eye1.ai — Source Connectors Design

## Connector Interface (Abstract)

```typescript
interface ISourceConnector {
  id: string;
  name: string;
  type: SourceType;
  authModel: AuthModel;
  syncModes: SyncMode[];

  // Lifecycle
  connect(config: ConnectionConfig): Promise<ConnectionResult>;
  disconnect(): Promise<void>;
  testConnection(): Promise<HealthCheck>;

  // Data fetching
  fetchIncremental(cursor: SyncCursor): Promise<FetchResult>;
  fetchFull(): Promise<FetchResult>;
  handleWebhook(payload: WebhookPayload): Promise<RawEvent[]>;

  // Import
  importFile(file: ImportFile): Promise<RawEvent[]>;

  // Metadata
  getAvailableScopes(): Scope[];
  getRateLimits(): RateLimitConfig;
  getSchema(): ConnectorSchema;
}
```

---

## 1. GitHub

### A. Source Summary
GitHub este platforma de cod și colaborare. Oferă date despre repositories, commits, PRs, issues, code reviews, actions.

### B. Access Mode
- **Primary**: REST API v3 + GraphQL API v4
- **Secondary**: Webhooks pentru real-time events
- **Tertiary**: Git protocol pentru repository data

### C. Authentication Model
- **Type**: OAuth 2.0 App / Personal Access Token (fine-grained)
- **Token storage**: Encrypted în DB
- **Refresh**: GitHub OAuth tokens nu expiră (PAT), dar App tokens au refresh flow
- **Scopes**: `repo`, `read:user`, `read:org`, `notifications`

### D. Data Domains
- Repositories (metadata, languages, topics)
- Commits (messages, diffs stats, authors)
- Pull Requests (title, description, reviews, comments, merge status)
- Issues (title, body, labels, assignees, comments)
- Actions/Workflows (run status, duration)
- Notifications
- User profile & activity

### E. Realtime Feasibility
- **Webhooks**: ✅ Excelent — push, PR, issue, review, workflow events
- **Polling fallback**: 5-15 min pentru date fără webhook coverage
- **Clasificare**: **webhook-first** cu polling fallback

### F. Strategy
- Webhooks pentru: push, PR, issue, review, workflow_run
- Polling la 15min pentru: repository stats, user activity, notifications
- Backfill inițial: GraphQL bulk query cu pagination

### G. Raw Payload Example
```json
{
  "source": "github",
  "event_type": "pull_request.opened",
  "received_at": "2024-01-15T10:30:00Z",
  "payload": {
    "action": "opened",
    "pull_request": {
      "id": 123,
      "number": 42,
      "title": "Add user auth flow",
      "body": "...",
      "state": "open",
      "user": { "login": "andreimilchis" },
      "created_at": "2024-01-15T10:29:00Z"
    }
  }
}
```

### H. Normalization Strategy
- PR → `PullRequest` + `Document` (body as document)
- Issue → `Issue` + `Document`
- Commit → `Commit` + linked to `GitRepository`
- Comment → `Message` within `Conversation`

### I. Identity Mapping
- GitHub user.login → system identity
- Repository full_name → `GitRepository.externalId`

### J. Deduplication Keys
- `source:github + entity_type + entity_id` (e.g., `github:pull_request:123`)
- Events: `delivery_id` header from webhooks

### K. Backfill Strategy
- GraphQL queries cu cursor pagination
- Rate: 5000 points/hour (GraphQL)
- Estimate: ~1h pentru 100 repos cu full history

### L. Retry Strategy
- Webhook delivery: GitHub retries automat
- Polling failures: exponential backoff (2s, 4s, 8s, 16s), max 4 retries
- After max retries: dead-letter + alert

### M. Rate Limit Strategy
- REST: 5000 req/h authenticated
- GraphQL: 5000 points/h
- Strategy: request budgeting, conditional requests (ETags), pagination optimization
- Headers tracked: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### N. Token Refresh
- PAT: Nu expiră, dar trebuie monitorizat scope access
- OAuth App: Refresh token flow standard
- Alert pe 401 responses

### O. Failure Scenarios
- Token revoked → alert + disable sync + notify user
- Rate limited → backoff + queue remaining work
- API down → retry with exponential backoff
- Schema change → validation error → dead-letter + alert
- Webhook signature invalid → reject + log

### P. Security Concerns
- Webhook signature verification cu `X-Hub-Signature-256`
- Code content nu este stocat (doar metadata)
- Private repo access necesită consent explicit

### Q. MVP Support: ✅ Full

### R. Phase 2: Actions integration, Discussions, Packages

### S. Phase 3: Code analysis, dependency tracking

---

## 2. Notion

### A. Source Summary
Notion este knowledge base și workspace. Conține pages, databases, blocks, comments.

### B. Access Mode
- **Primary**: REST API v1
- **Limitation**: Nu are webhooks native (status: beta/unavailable)

### C. Authentication Model
- **Type**: OAuth 2.0 (Internal Integration sau Public Integration)
- **Token storage**: Encrypted
- **Refresh**: Bearer token, nu expiră dar poate fi revocat
- **Scopes**: Read content, Read comments, Read user info

### D. Data Domains
- Pages (title, content blocks, properties)
- Databases (schema, entries/rows)
- Blocks (paragraphs, headings, lists, code, etc.)
- Comments
- Users

### E. Realtime Feasibility
- **Webhooks**: ❌ Indisponibil nativ
- **Polling**: Necesitate — `search` endpoint cu `last_edited_time` filter
- **Clasificare**: **polling-first**

### F. Strategy
- Polling la 5-10 min cu `search` API filtrat pe `last_edited_time`
- Full page content fetch pentru pagini modificate
- Backfill: Iterate all pages via search, paginated

### G. Raw Payload Example
```json
{
  "source": "notion",
  "event_type": "page.updated",
  "received_at": "2024-01-15T10:30:00Z",
  "payload": {
    "id": "page-uuid",
    "created_time": "2024-01-01T00:00:00Z",
    "last_edited_time": "2024-01-15T10:25:00Z",
    "properties": { "Name": { "title": [{ "plain_text": "Project Alpha" }] } },
    "blocks": [...]
  }
}
```

### H. Normalization Strategy
- Page → `Document` + `Note` sau `Project` (bazat pe database type)
- Database entry → entity mapping configurabil
- Blocks → concatenate to document content
- Relations → `KnowledgeEdge`

### I. Identity Mapping
- Notion page UUID → `Document.externalId`
- Notion user → system identity (email match)

### J. Deduplication Keys
- `source:notion + page_id + last_edited_time`

### K. Backfill Strategy
- Search API cu sort by last_edited_time, paginated
- Rate: 3 requests/second
- Block children fetch per page (recursive)
- Estimate: ~30min pentru 1000 pages

### L. Retry Strategy
- 429 responses: respect `Retry-After` header
- 5xx: exponential backoff, max 4 retries

### M. Rate Limit Strategy
- 3 requests/second per integration
- Request queue cu rate limiter
- Prioritize recently modified pages

### N. Token Refresh
- Integration tokens nu expiră
- Monitor 401 → re-auth flow

### O. Failure Scenarios
- Integration removed from workspace → 401 → disable + notify
- Page permissions changed → 404 per page → skip + log
- Rate limited → backoff + queue

### P. Security Concerns
- Notion content may contain PII → PII scanning pe content
- Integration access la shared workspaces → consent per workspace
- Bearer token storage encrypted

### Q. MVP Support: ✅ Full

### R. Phase 2: Database-specific mappings, bi-directional sync drafts

### S. Phase 3: Notion as output surface (write-back)

---

## 3. WHOOP

### A. Source Summary
WHOOP este wearable de health & fitness. Date de somn, recovery, strain, workouts.

### B. Access Mode
- **Primary**: REST API v1
- **Webhooks**: Disponibile pentru events

### C. Authentication Model
- **Type**: OAuth 2.0
- **Token storage**: Encrypted
- **Refresh**: Refresh token flow, access token expiră la ~1h
- **Scopes**: `read:recovery`, `read:sleep`, `read:workout`, `read:body_measurement`, `read:profile`

### D. Data Domains
- Sleep sessions (stages, performance, respiratory rate)
- Recovery scores (HRV, resting HR, SpO2)
- Strain / Workouts (type, duration, calories)
- Body measurements
- Cycles (daily cycle aggregates)
- Profile

### E. Realtime Feasibility
- **Webhooks**: ✅ Disponibil (recovery.updated, sleep.updated, workout.updated)
- **Polling fallback**: La 15-30 min
- **Clasificare**: **hybrid** (webhook + polling)

### F. Strategy
- Webhooks pentru: recovery, sleep, workout events
- Polling la 30min pentru: cycles, body measurements
- Backfill: API pagination cu start/end time

### G. Raw Payload Example
```json
{
  "source": "whoop",
  "event_type": "recovery.updated",
  "payload": {
    "cycle_id": 123,
    "score": {
      "recovery_score": 78,
      "resting_heart_rate": 52,
      "hrv_rmssd_milli": 65.4,
      "spo2_percentage": 97.1
    },
    "created_at": "2024-01-15T06:30:00Z"
  }
}
```

### H. Normalization Strategy
- Sleep → `SleepSession`
- Recovery → `RecoveryScore`
- Workout → `ActivitySession`
- Daily cycle → `HealthSample` + `TimeSeriesMetric`

### I. Identity Mapping
- WHOOP user_id → system identity (single user, direct mapping)

### J. Deduplication Keys
- `source:whoop + entity_type + cycle_id`

### K. Backfill Strategy
- Paginated API cu date range
- Rate: moderate (exact limits vary)
- Estimate: ~15min pentru 1 an de date

### L-N. Standard retry/rate limit/token refresh ca mai sus.

### O. Failure Scenarios
- OAuth expired → refresh token → if fails, re-auth
- Device offline → no new data (nu e failure)
- Score recalculated → update existing record (idempotent by cycle_id)

### P. Security Concerns
- Health data = **highly sensitive PII**
- Column-level encryption pentru health metrics
- HIPAA considerations (self-use, nu regulated, dar best practice)
- No sharing, no export fără explicit consent

### Q. MVP Support: ✅ Full

---

## 4. Revolut

### A. Source Summary
Revolut este platforma bancară. Tranzacții, balances, exchange rates.

### B. Access Mode
- **Primary**: Revolut Business API (dacă business account)
- **Alternative**: Open Banking API (PSD2) sau CSV/statement export
- **Challenge**: Personal accounts au acces API limitat

### C. Authentication Model
- **Business API**: OAuth 2.0 + certificate-based auth
- **Open Banking**: OAuth 2.0 consent flow
- **CSV Import**: No auth needed

### D. Data Domains
- Transactions (amount, currency, merchant, category, date)
- Accounts/balances
- Beneficiaries
- Exchange operations

### E. Realtime Feasibility
- **Webhooks**: ✅ Disponibil pe Business API (transaction events)
- **Personal**: ❌ No real-time
- **Clasificare**: **hybrid** (Business) sau **export/import-first** (Personal)

### F. Strategy
- Business: Webhooks + polling la 1h
- Personal: CSV import manual sau Open Banking polling
- Backfill: Statement export / API pagination

### G-S. [Detalii similare, adaptatate pentru financial data]

### P. Security Concerns
- Financial data = **extremely sensitive**
- Application-level encryption pentru amounts
- No raw financial data în LLM prompts → redaction obligatorie
- Audit trail complet pentru orice acces

### Q. MVP Support: ❌ Phase 2
- **Why**: API access personal complicat, risc de securitate mare, CSV import ca bridge

---

## 5. SmartBill

### A. Source Summary
SmartBill este platformă de facturare pentru business. Facturi emise, facturi primite, clienți, produse.

### B. Access Mode
- **Primary**: REST API
- **Auth**: API key + token

### C. Authentication Model
- **Type**: API Key (username + token)
- **Storage**: Encrypted secrets
- **Refresh**: Manual rotation

### D. Data Domains
- Facturi emise (invoices issued)
- Facturi primite (invoices received)
- Clienți (clients)
- Produse/servicii
- Payment status

### E. Realtime Feasibility
- **Webhooks**: ❌ Nu oferă
- **Clasificare**: **polling-first**

### F. Strategy
- Polling la 1h pentru facturi noi/modificate
- Backfill: Full list with pagination

### P. Security Concerns
- Business financial data, PII (client names, CUI)
- API key rotation policy

### Q. MVP Support: ❌ Phase 2

---

## 6. WhatsApp Business

### A. Source Summary
WhatsApp Business Platform pentru messaging business. Conversații, mesaje, media.

### B. Access Mode
- **Primary**: Cloud API (Meta)
- **Webhooks**: ✅ Real-time message events

### C. Authentication Model
- **Type**: System User Token (long-lived) sau OAuth
- **Meta Business verification required**
- **Scopes**: `whatsapp_business_messaging`, `whatsapp_business_management`

### D. Data Domains
- Messages (text, media, templates)
- Conversations (thread metadata)
- Contacts
- Message status (sent, delivered, read)

### E. Realtime Feasibility
- **Webhooks**: ✅ Excelent — message received, status update
- **Clasificare**: **webhook-first**

### F. Strategy
- Webhooks pentru toate inbound messages și status updates
- No polling needed (event-driven by design)
- Backfill: Limited — doar mesaje din ultimele 30 zile via API

### P. Security Concerns
- Message content = PII
- End-to-end encryption considerations
- Meta compliance requirements
- Consent per conversation partner

### Q. MVP Support: ❌ Phase 2

---

## 7. Spotify

### A. Source Summary
Spotify oferă date despre listening history, playlists, saved tracks.

### B. Access Mode
- **Primary**: Web API
- **Limitations**: Recently played = max 50 tracks, no full history

### C. Authentication Model
- **Type**: OAuth 2.0 (PKCE)
- **Refresh**: Refresh token flow
- **Scopes**: `user-read-recently-played`, `user-read-currently-playing`, `user-library-read`, `playlist-read-private`

### D. Data Domains
- Recently played tracks
- Currently playing
- Saved tracks/albums
- Playlists
- Top artists/tracks (per time range)
- Audio features (BPM, energy, valence)

### E. Realtime Feasibility
- **Webhooks**: ❌ Nu oferă
- **Polling**: `currently-playing` endpoint
- **Clasificare**: **polling-first**

### F. Strategy
- Polling la 5min pentru `currently-playing` (detect listening sessions)
- Polling la 30min pentru `recently-played` (max 50)
- Daily: top artists/tracks aggregates

### P. Security Concerns
- Low sensitivity data
- Listening habits = behavioral PII (low risk)

### Q. MVP Support: ❌ Phase 2 (nice-to-have)

---

## 8. Claude (Anthropic)

### A. Source Summary
Claude este AI assistant. Conversații, artefacte generate, reasoning chains.

### B. Access Mode
- **API-driven capture**: ❌ Nu există API pentru conversation history din claude.ai
- **Workspace/Compliance**: Posibil cu Claude for Enterprise
- **Export**: Manual export din UI (JSON, markdown)
- **Share links**: Parseable dar instabil

### C. Authentication Model
- **Import-based**: No auth needed — user uploads files
- **API key**: Doar pentru generare (outbound), nu pentru history retrieval

### D. Data Domains
- Conversations (prompts + responses)
- Artifacts (code, documents generated)
- Projects (organized conversations)

### E. Realtime Feasibility
- **Clasificare**: **export/import-first**

### F. Strategy
- **Primary**: JSON/markdown file import
- **Secondary**: Clipboard paste for individual conversations
- **Future**: API capture dacă Anthropic lansează conversation history API
- **Workspace logs**: Integration dacă Enterprise compliance data disponibilă

### G. Connector Design: Conversation Artifacts Ingestion
```typescript
interface ConversationImporter {
  importJSON(file: File): Promise<Conversation[]>;
  importMarkdown(file: File): Promise<Conversation[]>;
  importShareLink(url: string): Promise<Conversation | null>;
  importPastedTranscript(text: string): Promise<Conversation>;
  importWorkspaceLogs(config: WorkspaceConfig): Promise<Conversation[]>;
  importAPICapture(apiKey: string, sessionId: string): Promise<Conversation>;
}
```

### H. Normalization Strategy
- Each conversation → `Conversation` + multiple `Message` records
- Artifacts → `Document` records linked to conversation
- Extract topics, entities, decisions → `KnowledgeNode` + `KnowledgeEdge`

### P. Security Concerns
- Conversation content may contain any type of data
- PII scanning obligatorie pe import
- User controls what to import

### Q. MVP Support: ❌ Phase 2

---

## 9. ChatGPT (OpenAI)

### A. Source Summary
ChatGPT este AI assistant. Similar cu Claude — conversații, artifacts.

### B. Access Mode
- **Export**: Settings → Data & Privacy → Export (ZIP cu JSON)
- **API**: No conversation history API
- **Share links**: Parseable

### C-F. Identic cu Claude — **export/import-first**

### G. Connector Design
- Partajează `ConversationImporter` cu Claude connector
- ChatGPT export format: `conversations.json` în ZIP
- Parser specific pentru ChatGPT format

### Q. MVP Support: ❌ Phase 2

---

## Realtime Classification Summary

| Source | Primary Mode | Realtime | Near-RT | Batch | Import |
|--------|-------------|----------|---------|-------|--------|
| GitHub | webhook-first | ✅ webhooks | ✅ 5-15min poll | ✅ backfill | ❌ |
| Notion | polling-first | ❌ | ✅ 5-10min poll | ✅ backfill | ❌ |
| WHOOP | hybrid | ✅ webhooks | ✅ 30min poll | ✅ backfill | ❌ |
| Revolut | hybrid/import | ✅ biz webhooks | ✅ 1h poll | ✅ statements | ✅ CSV |
| SmartBill | polling-first | ❌ | ✅ 1h poll | ✅ backfill | ❌ |
| WhatsApp | webhook-first | ✅ webhooks | ❌ | ❌ limited | ❌ |
| Spotify | polling-first | ❌ | ✅ 5min poll | ✅ daily agg | ❌ |
| Claude | import-first | ❌ | ❌ | ❌ | ✅ JSON/MD |
| ChatGPT | import-first | ❌ | ❌ | ❌ | ✅ JSON/ZIP |
