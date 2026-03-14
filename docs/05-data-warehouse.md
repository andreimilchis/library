# eye1.ai — Data Warehouse & Analytics Layer

## Storage Strategy

| Data Type | Storage | Rationale |
|-----------|---------|-----------|
| Operational data (CRUD) | PostgreSQL main tables | Low latency, transactions |
| Raw payloads | S3-compatible | Immutable, cheap, replay |
| Analytics aggregates | PostgreSQL materialized views | Simple MVP, sufficient perf |
| Embeddings | pgvector (same Postgres) | Colocation reduces latency |
| Time series metrics | PostgreSQL + partitioned tables | Date-based partitioning |
| Files/exports | S3-compatible | Binary storage |

### Migration Path
- **Phase 2**: Evaluate ClickHouse for heavy analytics if materialized views become slow
- **Phase 3**: Evaluate BigQuery/Snowflake for cross-domain analytics at scale

## Fact Tables

### fact_daily_health
```sql
date DATE PRIMARY KEY,
sleep_score NUMERIC,
sleep_duration_minutes INTEGER,
recovery_score NUMERIC,
hrv_avg NUMERIC,
resting_hr_avg NUMERIC,
strain_score NUMERIC,
workout_count INTEGER,
workout_minutes INTEGER,
calories_total NUMERIC
```

### fact_daily_coding
```sql
date DATE,
repository_id UUID,
commits_count INTEGER,
prs_opened INTEGER,
prs_merged INTEGER,
prs_reviewed INTEGER,
issues_opened INTEGER,
issues_closed INTEGER,
additions INTEGER,
deletions INTEGER,
PRIMARY KEY (date, repository_id)
```

### fact_daily_finance
```sql
date DATE PRIMARY KEY,
total_income NUMERIC,
total_expense NUMERIC,
net_flow NUMERIC,
transaction_count INTEGER,
top_category TEXT,
invoices_issued INTEGER,
invoices_paid INTEGER,
invoices_overdue INTEGER
```

### fact_daily_conversations
```sql
date DATE PRIMARY KEY,
conversations_active INTEGER,
messages_sent INTEGER,
messages_received INTEGER,
avg_response_time_minutes NUMERIC,
sources_active TEXT[]
```

### fact_daily_knowledge
```sql
date DATE PRIMARY KEY,
documents_created INTEGER,
documents_updated INTEGER,
notes_created INTEGER,
tasks_created INTEGER,
tasks_completed INTEGER,
insights_generated INTEGER,
search_queries INTEGER
```

## Dimension Tables

### dim_repository
```sql
id UUID PRIMARY KEY,
full_name TEXT,
language TEXT,
is_private BOOLEAN,
topics TEXT[]
```

### dim_source
```sql
source_type TEXT PRIMARY KEY,
display_name TEXT,
category TEXT,
is_active BOOLEAN
```

### dim_date (generated)
```sql
date DATE PRIMARY KEY,
year INTEGER,
quarter INTEGER,
month INTEGER,
week INTEGER,
day_of_week INTEGER,
is_weekend BOOLEAN
```

## Materialized Views

### mv_weekly_health_summary
- Aggregation: AVG(sleep_score), AVG(recovery), trend direction
- Refresh: Daily at 06:00

### mv_weekly_coding_summary
- Aggregation: SUM(commits), SUM(prs_merged), active repos
- Refresh: Daily at 06:00

### mv_monthly_finance_summary
- Aggregation: SUM(income), SUM(expense), category breakdown
- Refresh: Daily at 06:00

### mv_correlation_health_productivity
- Cross: sleep_score × commits_count × tasks_completed
- Grain: Daily, rolling 30-day window
- Refresh: Daily

## Analytics Metrics

### Sleep Trend
- **Definiție**: Media mobilă pe 7 zile a sleep score-ului
- **Formula**: `AVG(sleep_score) OVER (ORDER BY date ROWS 6 PRECEDING)`
- **Grain**: Daily
- **Dependencies**: WHOOP sleep data
- **Caveats**: Necesită minim 3 zile de date

### Recovery Trend
- **Definiție**: Recovery score trend cu direcție
- **Formula**: `recovery_score - LAG(recovery_score, 7) OVER (ORDER BY date)`
- **Grain**: Daily
- **Dependencies**: WHOOP recovery data

### Burn Rate (Personal/Business)
- **Definiție**: Rata de cheltuieli pe zi/săptămână/lună
- **Formula**: `SUM(expense) / COUNT(DISTINCT date)` per period
- **Grain**: Weekly, Monthly
- **Dependencies**: Revolut/SmartBill transactions
- **Caveats**: Necesită categorization corectă

### Deep Work Score
- **Definiție**: Estimare a timpului de concentrare bazată pe coding activity + calendar + conversation gaps
- **Formula**: `(hours_coding * 1.0 + hours_no_messages * 0.5) / total_waking_hours`
- **Grain**: Daily
- **Dependencies**: GitHub commits (timestamps), conversations (gaps)
- **Caveats**: Aproximare — nu avem screen time real

### Decision Load Score
- **Definiție**: Câte decizii/action items sunt active și nerezolvate
- **Formula**: `COUNT(open_tasks) + COUNT(pending_approvals) + COUNT(open_prs) + COUNT(unread_insights)`
- **Grain**: Real-time (computed on demand)
- **Dependencies**: Tasks, approvals, PRs, insights

### Execution Drift Score
- **Definiție**: Diferența între planul săptămânal și execuția reală
- **Formula**: `1 - (completed_planned_tasks / total_planned_tasks)`
- **Grain**: Weekly
- **Dependencies**: ExecutionPlan + Task completion data
- **Caveats**: Necesită planning data (Phase 2 full fidelity)

### Consistency Score
- **Definiție**: Cât de consistent sunt obiceiurile (sleep time, workout frequency, coding frequency)
- **Formula**: `1 - STDDEV(metric) / AVG(metric)` per habit per 30 days
- **Grain**: Monthly
- **Dependencies**: Health + coding + finance patterns

### Anomaly Detection (Spending)
- **Definiție**: Tranzacții sau patternuri neobișnuite
- **Formula**: Z-score > 2 față de media categoriei din ultimele 90 zile
- **Grain**: Per transaction (triggered)
- **Dependencies**: Financial transactions
