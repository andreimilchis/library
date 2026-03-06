-- Agency OS — Layer 1: Agency Data Model
-- Initial migration: all core entities

-- ──────────────────────────────────────────────
-- ENUMS
-- ──────────────────────────────────────────────

CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'DISCOVERY_SCHEDULED', 'DISCOVERY_COMPLETED', 'AUDIT_SENT', 'OFFER_SENT', 'NEGOTIATION', 'WON', 'LOST');
CREATE TYPE "LeadSource" AS ENUM ('INBOUND', 'OUTBOUND', 'REFERRAL', 'WEBSITE', 'SOCIAL_MEDIA', 'PAID_ADS', 'EVENT', 'OTHER');
CREATE TYPE "MeetingType" AS ENUM ('DISCOVERY', 'FOLLOW_UP', 'STRATEGY', 'REVIEW', 'ONBOARDING');
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "AuditStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED');
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED');
CREATE TYPE "ClientStatus" AS ENUM ('ONBOARDING', 'ACTIVE', 'PAUSED', 'CHURNED');
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'SENT', 'SIGNED', 'ACTIVE', 'EXPIRED', 'TERMINATED');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');
CREATE TYPE "AdPlatform" AS ENUM ('META', 'GOOGLE', 'TIKTOK', 'LINKEDIN', 'PINTEREST', 'SNAPCHAT', 'OTHER');
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "ThreadChannel" AS ENUM ('EMAIL', 'WHATSAPP', 'SLACK', 'INTERNAL', 'SMS', 'OTHER');
CREATE TYPE "ReportType" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY', 'AD_HOC', 'CAMPAIGN');
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'GENERATED', 'DELIVERED');

-- ──────────────────────────────────────────────
-- TABLES
-- ──────────────────────────────────────────────

CREATE TABLE "agency_users" (
    "id"         TEXT NOT NULL DEFAULT gen_random_uuid(),
    "email"      TEXT NOT NULL,
    "name"       TEXT NOT NULL,
    "role"       TEXT NOT NULL DEFAULT 'member',
    "is_active"  BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "agency_users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "agency_users_email_key" ON "agency_users"("email");

CREATE TABLE "leads" (
    "id"               TEXT NOT NULL DEFAULT gen_random_uuid(),
    "company_name"     TEXT NOT NULL,
    "contact_name"     TEXT NOT NULL,
    "email"            TEXT NOT NULL,
    "phone"            TEXT,
    "website"          TEXT,
    "industry"         TEXT,
    "source"           "LeadSource" NOT NULL DEFAULT 'OTHER',
    "status"           "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes"            TEXT,
    "estimated_budget" DECIMAL(12,2),
    "assigned_to_id"   TEXT,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL,
    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "leads_status_idx" ON "leads"("status");
CREATE INDEX "leads_source_idx" ON "leads"("source");
CREATE INDEX "leads_assigned_to_id_idx" ON "leads"("assigned_to_id");
CREATE INDEX "leads_email_idx" ON "leads"("email");

CREATE TABLE "discovery_meetings" (
    "id"               TEXT NOT NULL DEFAULT gen_random_uuid(),
    "lead_id"          TEXT NOT NULL,
    "meeting_type"     "MeetingType" NOT NULL DEFAULT 'DISCOVERY',
    "status"           "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_at"     TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER,
    "recording_url"    TEXT,
    "transcript"       TEXT,
    "summary"          TEXT,
    "key_insights"     TEXT,
    "conducted_by_id"  TEXT,
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL,
    CONSTRAINT "discovery_meetings_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "discovery_meetings_lead_id_idx" ON "discovery_meetings"("lead_id");
CREATE INDEX "discovery_meetings_scheduled_at_idx" ON "discovery_meetings"("scheduled_at");
CREATE INDEX "discovery_meetings_status_idx" ON "discovery_meetings"("status");

CREATE TABLE "audits" (
    "id"              TEXT NOT NULL DEFAULT gen_random_uuid(),
    "lead_id"         TEXT NOT NULL,
    "meeting_id"      TEXT,
    "status"          "AuditStatus" NOT NULL DEFAULT 'PENDING',
    "platform"        "AdPlatform",
    "findings"        TEXT,
    "recommendations" TEXT,
    "score"           INTEGER,
    "delivered_at"    TIMESTAMP(3),
    "created_by_id"   TEXT,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "audits_meeting_id_key" ON "audits"("meeting_id");
CREATE INDEX "audits_lead_id_idx" ON "audits"("lead_id");
CREATE INDEX "audits_status_idx" ON "audits"("status");

CREATE TABLE "offers" (
    "id"            TEXT NOT NULL DEFAULT gen_random_uuid(),
    "lead_id"       TEXT NOT NULL,
    "meeting_id"    TEXT,
    "status"        "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "title"         TEXT NOT NULL,
    "description"   TEXT,
    "services"      TEXT,
    "monthly_fee"   DECIMAL(12,2),
    "setup_fee"     DECIMAL(12,2),
    "currency"      TEXT NOT NULL DEFAULT 'USD',
    "valid_until"   TIMESTAMP(3),
    "sent_at"       TIMESTAMP(3),
    "responded_at"  TIMESTAMP(3),
    "created_by_id" TEXT,
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "offers_meeting_id_key" ON "offers"("meeting_id");
CREATE INDEX "offers_lead_id_idx" ON "offers"("lead_id");
CREATE INDEX "offers_status_idx" ON "offers"("status");

CREATE TABLE "clients" (
    "id"                 TEXT NOT NULL DEFAULT gen_random_uuid(),
    "lead_id"            TEXT NOT NULL,
    "company_name"       TEXT NOT NULL,
    "contact_name"       TEXT NOT NULL,
    "email"              TEXT NOT NULL,
    "phone"              TEXT,
    "website"            TEXT,
    "industry"           TEXT,
    "status"             "ClientStatus" NOT NULL DEFAULT 'ONBOARDING',
    "monthly_budget"     DECIMAL(12,2),
    "currency"           TEXT NOT NULL DEFAULT 'USD',
    "onboarded_at"       TIMESTAMP(3),
    "account_manager_id" TEXT,
    "created_at"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"         TIMESTAMP(3) NOT NULL,
    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "clients_lead_id_key" ON "clients"("lead_id");
CREATE INDEX "clients_status_idx" ON "clients"("status");
CREATE INDEX "clients_account_manager_id_idx" ON "clients"("account_manager_id");
CREATE INDEX "clients_email_idx" ON "clients"("email");

CREATE TABLE "contracts" (
    "id"           TEXT NOT NULL DEFAULT gen_random_uuid(),
    "client_id"    TEXT NOT NULL,
    "status"       "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "title"        TEXT NOT NULL,
    "description"  TEXT,
    "start_date"   TIMESTAMP(3),
    "end_date"     TIMESTAMP(3),
    "monthly_fee"  DECIMAL(12,2),
    "currency"     TEXT NOT NULL DEFAULT 'USD',
    "document_url" TEXT,
    "signed_at"    TIMESTAMP(3),
    "external_id"  TEXT,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "contracts_client_id_idx" ON "contracts"("client_id");
CREATE INDEX "contracts_status_idx" ON "contracts"("status");

CREATE TABLE "invoices" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
    "client_id"      TEXT NOT NULL,
    "status"         "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "invoice_number" TEXT NOT NULL,
    "amount"         DECIMAL(12,2) NOT NULL,
    "currency"       TEXT NOT NULL DEFAULT 'USD',
    "description"    TEXT,
    "issued_at"      TIMESTAMP(3),
    "due_at"         TIMESTAMP(3),
    "paid_at"        TIMESTAMP(3),
    "external_id"    TEXT,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");
CREATE INDEX "invoices_client_id_idx" ON "invoices"("client_id");
CREATE INDEX "invoices_status_idx" ON "invoices"("status");
CREATE INDEX "invoices_due_at_idx" ON "invoices"("due_at");

CREATE TABLE "ad_accounts" (
    "id"                  TEXT NOT NULL DEFAULT gen_random_uuid(),
    "client_id"           TEXT NOT NULL,
    "platform"            "AdPlatform" NOT NULL,
    "account_name"        TEXT NOT NULL,
    "external_account_id" TEXT NOT NULL,
    "is_active"           BOOLEAN NOT NULL DEFAULT true,
    "currency"            TEXT NOT NULL DEFAULT 'USD',
    "timezone"            TEXT NOT NULL DEFAULT 'UTC',
    "created_at"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"          TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ad_accounts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ad_accounts_platform_external_account_id_key" ON "ad_accounts"("platform", "external_account_id");
CREATE INDEX "ad_accounts_client_id_idx" ON "ad_accounts"("client_id");
CREATE INDEX "ad_accounts_platform_idx" ON "ad_accounts"("platform");

CREATE TABLE "campaign_performance" (
    "id"            TEXT NOT NULL DEFAULT gen_random_uuid(),
    "ad_account_id" TEXT NOT NULL,
    "date"          DATE NOT NULL,
    "campaign_id"   TEXT NOT NULL,
    "campaign_name" TEXT NOT NULL,
    "spend"         DECIMAL(12,2) NOT NULL DEFAULT 0,
    "revenue"       DECIMAL(12,2) NOT NULL DEFAULT 0,
    "impressions"   INTEGER NOT NULL DEFAULT 0,
    "clicks"        INTEGER NOT NULL DEFAULT 0,
    "conversions"   INTEGER NOT NULL DEFAULT 0,
    "roas"          DECIMAL(8,4),
    "cpa"           DECIMAL(12,2),
    "ctr"           DECIMAL(8,4),
    "cpc"           DECIMAL(12,2),
    "cpm"           DECIMAL(12,2),
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "campaign_performance_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "campaign_performance_account_date_campaign_key" ON "campaign_performance"("ad_account_id", "date", "campaign_id");
CREATE INDEX "campaign_performance_ad_account_id_idx" ON "campaign_performance"("ad_account_id");
CREATE INDEX "campaign_performance_date_idx" ON "campaign_performance"("date");
CREATE INDEX "campaign_performance_campaign_id_idx" ON "campaign_performance"("campaign_id");

CREATE TABLE "tasks" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
    "client_id"      TEXT,
    "title"          TEXT NOT NULL,
    "description"    TEXT,
    "status"         "TaskStatus" NOT NULL DEFAULT 'TODO',
    "priority"       "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "due_date"       TIMESTAMP(3),
    "completed_at"   TIMESTAMP(3),
    "assigned_to_id" TEXT,
    "created_by_id"  TEXT,
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,
    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "tasks_client_id_idx" ON "tasks"("client_id");
CREATE INDEX "tasks_status_idx" ON "tasks"("status");
CREATE INDEX "tasks_assigned_to_id_idx" ON "tasks"("assigned_to_id");
CREATE INDEX "tasks_due_date_idx" ON "tasks"("due_date");

CREATE TABLE "communication_threads" (
    "id"         TEXT NOT NULL DEFAULT gen_random_uuid(),
    "lead_id"    TEXT,
    "client_id"  TEXT,
    "channel"    "ThreadChannel" NOT NULL DEFAULT 'INTERNAL',
    "subject"    TEXT,
    "is_open"    BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "communication_threads_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "communication_threads_lead_id_idx" ON "communication_threads"("lead_id");
CREATE INDEX "communication_threads_client_id_idx" ON "communication_threads"("client_id");
CREATE INDEX "communication_threads_channel_idx" ON "communication_threads"("channel");

CREATE TABLE "messages" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "thread_id"   TEXT NOT NULL,
    "sender_type" TEXT NOT NULL,
    "sender_id"   TEXT,
    "body"        TEXT NOT NULL,
    "metadata"    TEXT,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "messages_thread_id_idx" ON "messages"("thread_id");
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

CREATE TABLE "reports" (
    "id"              TEXT NOT NULL DEFAULT gen_random_uuid(),
    "client_id"       TEXT NOT NULL,
    "type"            "ReportType" NOT NULL DEFAULT 'MONTHLY',
    "status"          "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "title"           TEXT NOT NULL,
    "period_start"    TIMESTAMP(3) NOT NULL,
    "period_end"      TIMESTAMP(3) NOT NULL,
    "content"         TEXT,
    "summary"         TEXT,
    "delivered_at"    TIMESTAMP(3),
    "generated_by_id" TEXT,
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL,
    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "reports_client_id_idx" ON "reports"("client_id");
CREATE INDEX "reports_type_idx" ON "reports"("type");
CREATE INDEX "reports_period_idx" ON "reports"("period_start", "period_end");

-- ──────────────────────────────────────────────
-- FOREIGN KEYS
-- ──────────────────────────────────────────────

ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "agency_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "discovery_meetings" ADD CONSTRAINT "discovery_meetings_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "discovery_meetings" ADD CONSTRAINT "discovery_meetings_conducted_by_id_fkey" FOREIGN KEY ("conducted_by_id") REFERENCES "agency_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "audits" ADD CONSTRAINT "audits_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "audits" ADD CONSTRAINT "audits_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "discovery_meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audits" ADD CONSTRAINT "audits_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "agency_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "offers" ADD CONSTRAINT "offers_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "discovery_meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "agency_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "clients" ADD CONSTRAINT "clients_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "clients" ADD CONSTRAINT "clients_account_manager_id_fkey" FOREIGN KEY ("account_manager_id") REFERENCES "agency_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "contracts" ADD CONSTRAINT "contracts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ad_accounts" ADD CONSTRAINT "ad_accounts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "campaign_performance" ADD CONSTRAINT "campaign_performance_ad_account_id_fkey" FOREIGN KEY ("ad_account_id") REFERENCES "ad_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "agency_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "agency_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "communication_threads" ADD CONSTRAINT "communication_threads_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "communication_threads" ADD CONSTRAINT "communication_threads_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "communication_threads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reports" ADD CONSTRAINT "reports_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "agency_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
