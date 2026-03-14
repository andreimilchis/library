import { pgTable, uuid, text, timestamp, jsonb, integer, index } from 'drizzle-orm/pg-core';

export const conversations = pgTable(
  'conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceType: text('source_type').notNull(),
    externalId: text('external_id').notNull(),
    title: text('title'),
    summary: text('summary'),
    participantCount: integer('participant_count'),
    messageCount: integer('message_count').default(0),
    tags: text('tags').array(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_conversations_source_external').on(table.sourceType, table.externalId),
    index('idx_conversations_started_at').on(table.startedAt),
  ],
);

export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    role: text('role').notNull(), // user, assistant, system, participant
    content: text('content').notNull(),
    authorName: text('author_name'),
    authorExternalId: text('author_external_id'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    attachments: jsonb('attachments').$type<Array<{ type: string; url?: string; name?: string }>>(),
    sentAt: timestamp('sent_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_messages_conversation_sent').on(table.conversationId, table.sentAt),
  ],
);
