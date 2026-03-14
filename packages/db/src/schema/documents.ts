import { pgTable, uuid, text, timestamp, jsonb, integer, index } from 'drizzle-orm/pg-core';

export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceType: text('source_type').notNull(),
    externalId: text('external_id').notNull(),
    title: text('title').notNull(),
    contentType: text('content_type').notNull().default('markdown'), // markdown, html, plaintext
    content: text('content').notNull(),
    authorId: text('author_id'),
    authorName: text('author_name'),
    parentId: uuid('parent_id'),
    tags: text('tags').array(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    wordCount: integer('word_count'),
    language: text('language'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    index('idx_documents_source_external').on(table.sourceType, table.externalId),
    index('idx_documents_created_at').on(table.createdAt),
  ],
);
