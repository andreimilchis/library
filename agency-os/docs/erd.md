# Agency OS — Entity Relationship Diagram

## Visual Overview (Text-Based ERD)

```
┌──────────────┐
│ AgencyUser   │
│──────────────│
│ id (PK)      │
│ email (UQ)   │
│ name         │
│ role         │
│ is_active    │
└──────┬───────┘
       │ assigned_to / conducted_by / created_by / account_manager / generated_by
       │
       ▼
┌──────────────┐      1:N       ┌─────────────────────┐
│    Lead      │───────────────▶│  DiscoveryMeeting   │
│──────────────│                │─────────────────────│
│ id (PK)      │                │ id (PK)             │
│ company_name │                │ lead_id (FK)        │
│ contact_name │                │ meeting_type        │
│ email        │                │ status              │
│ phone        │                │ scheduled_at        │
│ website      │                │ duration_minutes    │
│ industry     │                │ recording_url       │
│ source       │                │ transcript          │
│ status       │                │ summary             │
│ notes        │                │ key_insights        │
│ est_budget   │                │ conducted_by_id(FK) │
│ assigned_to  │                └───────┬─────────────┘
│  _id (FK)    │                        │ 1:1 (optional)
└──────┬───────┘                        │
       │                         ┌──────┴──────┐
       │ 1:N                     ▼             ▼
       │                 ┌────────────┐  ┌────────────┐
       ├────────────────▶│   Audit    │  │   Offer    │
       │                 │────────────│  │────────────│
       │                 │ id (PK)    │  │ id (PK)    │
       │                 │ lead_id(FK)│  │ lead_id(FK)│
       │                 │ meeting_id │  │ meeting_id │
       │                 │  (FK, UQ)  │  │  (FK, UQ)  │
       │                 │ status     │  │ status     │
       │                 │ platform   │  │ title      │
       │                 │ findings   │  │ monthly_fee│
       │                 │ recomm.    │  │ setup_fee  │
       │                 │ score      │  │ valid_until│
       │                 └────────────┘  └────────────┘
       │
       │ 1:1 (Lead → Client conversion)
       ▼
┌──────────────────┐
│     Client       │
│──────────────────│
│ id (PK)          │
│ lead_id (FK, UQ) │◀── maintains Lead relationship
│ company_name     │
│ contact_name     │
│ email            │
│ status           │
│ monthly_budget   │
│ account_manager  │
│  _id (FK)        │
└──────┬───────────┘
       │
       │ 1:N relationships
       │
       ├──────────────────────────────────────────────┐
       │                    │                          │
       ▼                    ▼                          ▼
┌──────────────┐  ┌──────────────────┐  ┌────────────────────────┐
│  Contract    │  │    Invoice       │  │      AdAccount         │
│──────────────│  │──────────────────│  │────────────────────────│
│ id (PK)      │  │ id (PK)          │  │ id (PK)                │
│ client_id(FK)│  │ client_id (FK)   │  │ client_id (FK)         │
│ status       │  │ invoice_number   │  │ platform               │
│ title        │  │  (UQ)            │  │ account_name           │
│ start_date   │  │ status           │  │ external_account_id    │
│ end_date     │  │ amount           │  │ is_active              │
│ monthly_fee  │  │ issued_at        │  │ currency               │
│ document_url │  │ due_at           │  └───────────┬────────────┘
│ signed_at    │  │ paid_at          │              │
│ external_id  │  │ external_id      │              │ 1:N
└──────────────┘  └──────────────────┘              ▼
                                        ┌────────────────────────┐
       ├─────────────┐                  │ CampaignPerformance    │
       │             │                  │────────────────────────│
       ▼             ▼                  │ id (PK)                │
┌──────────┐  ┌────────────┐            │ ad_account_id (FK)     │
│  Task    │  │  Report    │            │ date                   │
│──────────│  │────────────│            │ campaign_id            │
│ id (PK)  │  │ id (PK)    │            │ campaign_name          │
│ client_id│  │ client_id  │            │ spend                  │
│  (FK)    │  │  (FK)      │            │ revenue                │
│ title    │  │ type       │            │ impressions            │
│ status   │  │ status     │            │ clicks                 │
│ priority │  │ title      │            │ conversions            │
│ due_date │  │ period_*   │            │ roas                   │
│ assigned │  │ content    │            │ cpa, ctr, cpc, cpm     │
│ _to_id   │  │ generated  │            │ (UQ: account+date+     │
│ created  │  │ _by_id(FK) │            │       campaign)        │
│ _by_id   │  └────────────┘            └────────────────────────┘
└──────────┘

       │
       ├──────────────────────────────────────────┐
       ▼                                          │
┌─────────────────────────┐                       │
│  CommunicationThread    │◀──────────────────────┘
│─────────────────────────│   (also linked from Lead)
│ id (PK)                 │
│ lead_id (FK, nullable)  │
│ client_id (FK, nullable)│
│ channel                 │
│ subject                 │
│ is_open                 │
└───────────┬─────────────┘
            │ 1:N
            ▼
     ┌────────────┐
     │  Message   │
     │────────────│
     │ id (PK)    │
     │ thread_id  │
     │  (FK)      │
     │ sender_type│
     │ sender_id  │
     │ body       │
     │ metadata   │
     └────────────┘
```

## Relationship Summary

| Relationship | Type | Description |
|---|---|---|
| AgencyUser → Lead | 1:N | User assigned to lead |
| Lead → DiscoveryMeeting | 1:N | Lead has many meetings |
| DiscoveryMeeting → Audit | 1:1 | Meeting may produce audit |
| DiscoveryMeeting → Offer | 1:1 | Meeting may produce offer |
| Lead → Audit | 1:N | Lead has many audits |
| Lead → Offer | 1:N | Lead has many offers |
| Lead → Client | 1:1 | Lead converts to client |
| Client → Contract | 1:N | Client has many contracts |
| Client → Invoice | 1:N | Client has many invoices |
| Client → AdAccount | 1:N | Client has accounts on multiple platforms |
| AdAccount → CampaignPerformance | 1:N | Daily metrics per campaign |
| Client → Task | 1:N | Tasks linked to client |
| Client → Report | 1:N | Reports for client |
| Lead/Client → CommunicationThread | 1:N | Threads for lead or client |
| CommunicationThread → Message | 1:N | Thread contains messages |
| AgencyUser → Task | 1:N | Assigned / created tasks |
| AgencyUser → Report | 1:N | Generated reports |

## Key Design Decisions

1. **Lead → Client Conversion**: The `Client` table has a unique `lead_id` foreign key, preserving the full sales history. When a lead is "won", a Client record is created referencing the original lead.

2. **CampaignPerformance Unique Constraint**: `(ad_account_id, date, campaign_id)` ensures one row per campaign per day per account — the integration layer upserts into this.

3. **CommunicationThread Polymorphism**: Threads can be linked to either a Lead or a Client (or both during conversion), supporting the full lifecycle.

4. **External IDs**: `external_id` / `external_account_id` fields allow Layer 2 integrations to map external platform records to internal entities without coupling the schema to external systems.

5. **Derived Metrics**: Campaign performance stores computed metrics (ROAS, CPA, CTR, CPC, CPM) alongside raw data for fast dashboard reads while the raw data remains available for recalculation.
