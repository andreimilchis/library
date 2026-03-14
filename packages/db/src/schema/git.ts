import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  index,
} from 'drizzle-orm/pg-core';

export const gitRepositories = pgTable(
  'git_repositories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceType: text('source_type').notNull().default('github'),
    externalId: text('external_id').notNull(),
    fullName: text('full_name').notNull(), // e.g., "owner/repo"
    name: text('name').notNull(),
    description: text('description'),
    language: text('language'),
    topics: text('topics').array(),
    isPrivate: boolean('is_private').default(false),
    stars: integer('stars').default(0),
    forks: integer('forks').default(0),
    lastPushAt: timestamp('last_push_at', { withTimezone: true }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_git_repos_source_external').on(table.sourceType, table.externalId),
    index('idx_git_repos_full_name').on(table.fullName),
  ],
);

export const commits = pgTable(
  'commits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    repositoryId: uuid('repository_id')
      .notNull()
      .references(() => gitRepositories.id, { onDelete: 'cascade' }),
    sha: text('sha').notNull(),
    message: text('message').notNull(),
    authorName: text('author_name').notNull(),
    authorEmail: text('author_email'),
    additions: integer('additions'),
    deletions: integer('deletions'),
    filesChanged: integer('files_changed'),
    parentShas: text('parent_shas').array(),
    committedAt: timestamp('committed_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_commits_repo_committed').on(table.repositoryId, table.committedAt),
    index('idx_commits_sha').on(table.sha),
  ],
);

export const pullRequests = pgTable(
  'pull_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    repositoryId: uuid('repository_id')
      .notNull()
      .references(() => gitRepositories.id, { onDelete: 'cascade' }),
    externalId: text('external_id').notNull(),
    number: integer('number').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    state: text('state').notNull(), // open, closed, merged
    authorLogin: text('author_login').notNull(),
    labels: text('labels').array(),
    reviewers: text('reviewers').array(),
    additions: integer('additions'),
    deletions: integer('deletions'),
    commitsCount: integer('commits_count'),
    commentsCount: integer('comments_count'),
    mergedAt: timestamp('merged_at', { withTimezone: true }),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_prs_repo_external').on(table.repositoryId, table.externalId),
    index('idx_prs_state').on(table.state),
    index('idx_prs_created_at').on(table.createdAt),
  ],
);

export const issues = pgTable(
  'issues',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    repositoryId: uuid('repository_id')
      .notNull()
      .references(() => gitRepositories.id, { onDelete: 'cascade' }),
    externalId: text('external_id').notNull(),
    number: integer('number').notNull(),
    title: text('title').notNull(),
    body: text('body'),
    state: text('state').notNull(), // open, closed
    authorLogin: text('author_login').notNull(),
    labels: text('labels').array(),
    assignees: text('assignees').array(),
    commentsCount: integer('comments_count'),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_issues_repo_external').on(table.repositoryId, table.externalId),
    index('idx_issues_state').on(table.state),
  ],
);
