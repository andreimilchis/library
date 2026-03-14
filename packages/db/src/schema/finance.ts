import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  real,
  boolean,
  index,
} from 'drizzle-orm/pg-core';

export const financialTransactions = pgTable(
  'financial_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceType: text('source_type').notNull(),
    externalId: text('external_id').notNull(),
    // Amount stored encrypted (application-level encryption)
    amountEncrypted: text('amount_encrypted').notNull(),
    currency: text('currency').notNull(),
    type: text('type').notNull(), // income, expense, transfer
    description: text('description'),
    merchant: text('merchant'),
    category: text('category'),
    tags: text('tags').array(),
    invoiceId: uuid('invoice_id'),
    isRecurring: boolean('is_recurring').default(false),
    date: timestamp('date', { withTimezone: true }).notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_financial_tx_date').on(table.date),
    index('idx_financial_tx_category').on(table.category),
    index('idx_financial_tx_source_external').on(table.sourceType, table.externalId),
  ],
);

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceType: text('source_type').notNull(),
    externalId: text('external_id').notNull(),
    number: text('number').notNull(),
    type: text('type').notNull(), // issued, received
    amountEncrypted: text('amount_encrypted').notNull(),
    currency: text('currency').notNull(),
    status: text('status').notNull(), // draft, sent, paid, overdue, cancelled
    clientName: text('client_name'), // PII-tagged
    clientId: text('client_id'),
    items: jsonb('items').$type<
      Array<{ description: string; quantity: number; unitPrice: number; total: number }>
    >(),
    issuedAt: timestamp('issued_at', { withTimezone: true }).notNull(),
    dueDate: timestamp('due_date', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_invoices_source_external').on(table.sourceType, table.externalId),
    index('idx_invoices_status').on(table.status),
    index('idx_invoices_issued_at').on(table.issuedAt),
  ],
);
