# eye1.ai — Security, Privacy & Governance

## Data Classification Matrix

| Classification | Examples | Storage | Encryption | Access | LLM Exposure |
|---------------|----------|---------|------------|--------|--------------|
| **PUBLIC** | Repo names, public PR titles | Postgres | At rest | All services | Allowed |
| **INTERNAL** | Task titles, insight content | Postgres | At rest | Authenticated | Allowed |
| **CONFIDENTIAL** | Conversation content, notes | Postgres | At rest + app-level | Authenticated + audit | Redacted PII |
| **RESTRICTED** | Financial amounts, health data | Postgres | At rest + column-level | Authenticated + audit + encrypt | Aggregated only |
| **SECRET** | API tokens, OAuth secrets | Postgres encrypted column | AES-256 | Service-only | Never |

## PII Classes

| PII Class | Examples | Handling |
|-----------|----------|----------|
| **Direct PII** | Names, emails, phone numbers | Tagged, encrypted at rest |
| **Financial PII** | Account numbers, amounts, IBAN | Column-level encryption, redaction |
| **Health PII** | Heart rate, sleep data, recovery | Column-level encryption |
| **Behavioral PII** | Listening habits, browsing | Aggregated for LLM, raw stored encrypted |
| **Communication PII** | Message content, conversations | Encrypted at rest, PII-scanned before LLM |

## Secrets Management

- **Storage**: Environment variables (dev), secrets manager (prod)
- **Encryption**: AES-256-GCM for secrets in DB
- **Key rotation**: Quarterly minimum, immediate on compromise
- **Access**: Only backend services, never exposed to frontend
- **Audit**: All secret access logged

## Consent Model

```typescript
interface SourceConsent {
  sourceType: string;
  consentedAt: Date;
  scopes: string[];           // What data types we can access
  dataRetention: string;      // How long we keep data
  canSendToLLM: boolean;      // Whether data can be used in AI prompts
  canExport: boolean;         // Whether data can be exported
  revokedAt?: Date;
}
```

- Per-source consent recorded on connect
- User can modify scopes at any time
- Revocation triggers data handling per retention policy

## Right to Delete

- **Soft delete**: Mark as deleted, exclude from queries, retain for audit (30 days)
- **Hard delete**: Remove from all stores (Postgres, S3, pgvector, graph) after 30 days
- **Per-source delete**: Disconnect + delete all data from that source
- **Full delete**: Remove all user data from system
- **Cascade**: Deleting source data removes normalized records, embeddings, graph edges

## Retention Policy

| Data Type | Active | Archive | Delete |
|-----------|--------|---------|--------|
| Raw payloads | 1 year | 2 years cold storage | After archive |
| Canonical records | Permanent | N/A | On user request |
| Financial data | 7 years | 3 years cold | After archive (legal) |
| Health data | Permanent | N/A | On user request |
| Embeddings | Until re-embed | N/A | With source entity |
| Audit logs | 3 years | 2 years cold | After archive |
| Agent runs | 1 year | 1 year cold | After archive |
| Insights | 1 year active | Archive | Permanent summary |

## Redaction Pipeline (Before LLM)

```
[Raw Context]
  → Strip direct PII (names → [PERSON_1], emails → [EMAIL])
  → Redact financial amounts → [AMOUNT_RANGE: low/medium/high]
  → Aggregate health data → scores only, no raw vitals
  → Remove API keys/tokens if leaked in content
  → Sanitize potential prompt injections
  → Tag remaining content with classification level
  → Pass to LLM with classification-aware system prompt
```

## Webhook Security

- **Signature verification**: HMAC-SHA256 with source-specific secret
- **Replay protection**: Check timestamp header (reject > 5min old)
- **IP allowlisting**: Optional, per source
- **Rate limiting**: 100 webhooks/minute per source
- **Payload size limit**: 10MB

## Agent Permission Model

```
DEFAULT: Read any canonical data, search, graph query
RESTRICTED: No financial amounts, no raw health, no message content
APPROVAL REQUIRED: Send message, modify document, create task, commit, merge
FORBIDDEN: Delete data, modify source connections, access secrets
```

## Threat Model

| Threat | Impact | Likelihood | Mitigation |
|--------|--------|------------|------------|
| Token leakage | Full source access compromise | Medium | Encrypted storage, key rotation, scoped tokens |
| Prompt injection via imported content | AI generates malicious output | Medium | Content sandboxing, structured output validation, input sanitization |
| Malicious webhook payload | Code execution, data corruption | Low | Signature verification, schema validation, input sanitization |
| Replay attack on webhooks | Duplicate data, resource waste | Low | Timestamp validation, idempotency keys |
| Supply chain (npm packages) | Arbitrary code execution | Low | Lockfiles, Snyk/audit, minimal dependencies |
| SQL injection | Data breach | Low | Drizzle ORM (parameterized queries), input validation |
| XSS via stored content | Session hijack | Low | Content sanitization, CSP headers, React auto-escaping |
| Unauthorized agent actions | Unwanted external actions | Medium | Approval workflows, permission model, audit trail |
| Data exfiltration via LLM | Sensitive data in LLM logs | Medium | Redaction pipeline, provider DPA, self-hosted option |
| Redis compromise | Queue manipulation, cache poison | Low | Auth, network isolation, encrypted connections |

## Backup / Restore

- **Database**: Daily automated backups, WAL archiving for point-in-time recovery
- **S3**: Cross-region replication (if AWS), versioning enabled
- **Redis**: RDB snapshots every 15min, AOF for durability
- **Testing**: Monthly backup restore test
- **RTO**: 4 hours, **RPO**: 1 hour

## Incident Response

1. **Detection**: Automated alerts on anomalous patterns (auth failures, rate limit spikes, DLQ depth)
2. **Triage**: Severity classification (P1-P4)
3. **Containment**: Disable affected source connection, pause agents
4. **Investigation**: Audit logs, structured logs, request tracing
5. **Resolution**: Fix, deploy, verify
6. **Post-mortem**: Document, improve
