# eye1.ai — Knowledge Graph

## Node Taxonomy

| Node Type | Descriere | Surse |
|-----------|-----------|-------|
| `person` | Persoană din contact sau menționată | WhatsApp, GitHub, Notion, conversations |
| `project` | Proiect activ sau arhivat | Notion, GitHub, manual |
| `company` | Companie / organizație | SmartBill, Revolut, manual |
| `conversation` | Thread de conversație semnificativ | WhatsApp, Claude, ChatGPT |
| `concept` | Idee, temă, topic recurent | AI-extracted din conversations/docs |
| `action_item` | Task/acțiune de făcut | Notion, conversations, AI-extracted |
| `habit` | Obicei recurent (bun sau rău) | AI-inferred din patterns |
| `health_state` | Stare de sănătate la un moment | WHOOP |
| `financial_obligation` | Obligație financiară recurentă | Revolut, SmartBill |
| `invoice` | Factură specifică | SmartBill |
| `repository` | Repo GitHub | GitHub |
| `decision` | Decizie luată | AI-extracted din conversations |
| `risk` | Risc identificat | AI-inferred |
| `opportunity` | Oportunitate identificată | AI-inferred |
| `goal` | Obiectiv definit | Manual, Notion |
| `document` | Document important | Notion, imports |

## Edge Taxonomy

| Edge Type | From → To | Descriere |
|-----------|-----------|-----------|
| `discussed_in` | concept → conversation | Concept menționat într-o conversație |
| `mentioned_in` | person → conversation/document | Persoană menționată |
| `belongs_to` | task/repo → project | Apartenență |
| `influences` | habit → health_state/project | Influență cauzală |
| `blocks` | risk/task → project/goal | Blocare |
| `supports` | action_item → goal | Contribuie la goal |
| `related_to` | any → any | Relație generică |
| `depends_on` | task → task, project → project | Dependență |
| `created_from` | insight/task → conversation | Origine |
| `caused_by` | health_state → habit | Cauzalitate |
| `paid_with` | invoice → financial_obligation | Plată |
| `linked_to_goal` | project/task → goal | Asociere cu obiectiv |
| `evidence_from` | insight → document/metric | Sursă de evidență |
| `derived_from` | concept → document | Extras din |
| `works_on` | person → project | Implicare |
| `decided_in` | decision → conversation | Locul deciziei |
| `followed_by` | decision → action_item | Follow-up |
| `correlates_with` | health_state → health_state | Corelație statistică |

## Edge Properties

```typescript
interface KnowledgeEdgeProperties {
  confidence: number;       // 0.0 - 1.0
  weight: number;          // Importance/strength
  validFrom?: Date;        // Temporal start
  validTo?: Date;          // Temporal end (null = current)
  sourceType: string;      // What source created this edge
  evidence: string[];      // References to source records
  createdBy: 'rule' | 'ai' | 'user';  // How was it created
  lastValidated?: Date;    // When was it last confirmed
}
```

## Edge Creation Rules

### Rule-based (deterministic)
1. GitHub PR authored by user → `person --works_on--> repository`
2. GitHub issue assigned → `person --works_on--> project` (if repo mapped to project)
3. Notion page in project database → `document --belongs_to--> project`
4. Financial transaction to known company → `financial_obligation --paid_with--> company`
5. Task created from conversation → `action_item --created_from--> conversation`

### AI-extracted (probabilistic)
1. NER on conversation content → `person --mentioned_in--> conversation`
2. Topic extraction → `concept --discussed_in--> conversation`
3. Decision detection → `decision --decided_in--> conversation`
4. Pattern recognition → `habit --influences--> health_state`
5. Correlation analysis → `health_state --correlates_with--> daily_productivity`

### Confidence Scores
- Rule-based: 1.0 (deterministic)
- AI-extracted with high evidence: 0.7-0.9
- AI-inferred (correlation): 0.4-0.7
- User-confirmed: Boosted to 1.0

## Graph Update Pipeline

```
[Canonical Record Written]
  → Check if entity type produces graph updates
  → Rule-based edge extraction (synchronous)
  → Queue AI-based extraction (async, batched)
  → Upsert nodes (create if not exists)
  → Upsert edges (update confidence if exists)
  → Update temporal validity
  → Log provenance
```

## Graph Query Patterns

### 1. "Proiecte menționate în ultimele 30 zile cu risc ridicat"
```sql
SELECT n.name, n.properties, COUNT(e.id) as mention_count,
       risk_edges.confidence as risk_level
FROM knowledge_nodes n
JOIN knowledge_edges e ON e.to_node_id = n.id
  AND e.edge_type = 'discussed_in'
  AND e.created_at > NOW() - INTERVAL '30 days'
LEFT JOIN knowledge_edges risk_edges ON risk_edges.from_node_id = n.id
  AND risk_edges.edge_type = 'blocks'
WHERE n.type = 'project'
GROUP BY n.id, risk_edges.confidence
HAVING risk_edges.confidence > 0.5
ORDER BY risk_level DESC, mention_count DESC;
```

### 2. "Idei recurente din conversații care nu au devenit taskuri"
```sql
SELECT c.name, COUNT(DISTINCT e.to_node_id) as conversation_count,
       MIN(e.created_at) as first_mentioned
FROM knowledge_nodes c
JOIN knowledge_edges e ON e.from_node_id = c.id
  AND e.edge_type = 'discussed_in'
WHERE c.type = 'concept'
  AND NOT EXISTS (
    SELECT 1 FROM knowledge_edges follow
    WHERE follow.from_node_id = c.id
      AND follow.edge_type IN ('followed_by', 'created_from')
      AND follow.to_node_id IN (
        SELECT id FROM knowledge_nodes WHERE type = 'action_item'
      )
  )
GROUP BY c.id
HAVING COUNT(DISTINCT e.to_node_id) >= 2
ORDER BY conversation_count DESC;
```

### 3. "Pattern-uri de somn care preced zile productive"
```sql
-- Implemented as an AI reasoning query that:
-- 1. Fetches sleep scores for last 90 days
-- 2. Fetches productivity metrics (commits, tasks completed) for next day
-- 3. Computes correlation
-- 4. Returns patterns as insight
```

### 4. "Cheltuieli recurente fără ROI clar"
```sql
SELECT fo.name, fo.properties->>'amount' as amount,
       fo.properties->>'frequency' as frequency
FROM knowledge_nodes fo
WHERE fo.type = 'financial_obligation'
  AND fo.properties->>'isRecurring' = 'true'
  AND NOT EXISTS (
    SELECT 1 FROM knowledge_edges e
    WHERE e.from_node_id = fo.id
      AND e.edge_type = 'supports'
      AND e.to_node_id IN (
        SELECT id FROM knowledge_nodes WHERE type = 'goal'
      )
  );
```

### 5. "Decizii fără follow-up"
```sql
SELECT d.name, d.properties, conv.name as conversation_name,
       d.created_at
FROM knowledge_nodes d
LEFT JOIN knowledge_edges de ON de.from_node_id = d.id
  AND de.edge_type = 'decided_in'
LEFT JOIN knowledge_nodes conv ON conv.id = de.to_node_id
WHERE d.type = 'decision'
  AND NOT EXISTS (
    SELECT 1 FROM knowledge_edges follow
    WHERE follow.from_node_id = d.id
      AND follow.edge_type = 'followed_by'
  )
  AND d.created_at < NOW() - INTERVAL '7 days'
ORDER BY d.created_at DESC;
```

## Conflict Resolution

- **Duplicate nodes**: Merge by name similarity + source cross-reference
- **Conflicting edges**: Keep highest confidence, log conflict
- **Temporal overlap**: Most recent wins, old edge gets `validTo` set
- **User override**: Always wins, confidence = 1.0

## Migration Path to Neo4j

- **Trigger**: Graph exceeds 1M nodes or complex traversal queries become slow (>1s)
- **Strategy**: Dual-write period, then cutover
- **Node/Edge schema**: Already designed to map 1:1 to Neo4j property graph
- **Queries**: SQL graph queries → Cypher (translatable patterns)
