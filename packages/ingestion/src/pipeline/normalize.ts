import { createLogger } from '@eye1/common';
import type { NormalizationJobData, NormalizedRecordData } from '@eye1/common';
import { getDb, schema } from '@eye1/db';
import { eq, and } from 'drizzle-orm';
import { GitHubNormalizer } from '@eye1/connectors';

const logger = createLogger('normalization-pipeline');

// Normalizer registry
const normalizers: Record<string, { normalize: (eventType: string, payload: Record<string, unknown>) => NormalizedRecordData[] }> = {
  github: new GitHubNormalizer(),
  // Future: notion: new NotionNormalizer(),
  // Future: whoop: new WhoopNormalizer(),
};

/**
 * Process a normalization job.
 * Reads the raw event, normalizes it, deduplicates, and writes canonical records.
 */
export async function processNormalization(job: NormalizationJobData): Promise<{
  normalizedCount: number;
  skippedCount: number;
  errors: string[];
}> {
  const db = getDb();
  const errors: string[] = [];
  let normalizedCount = 0;
  let skippedCount = 0;

  // 1. Read raw event
  const [rawEvent] = await db
    .select()
    .from(schema.rawEvents)
    .where(eq(schema.rawEvents.id, job.rawEventId))
    .limit(1);

  if (!rawEvent) {
    throw new Error(`Raw event not found: ${job.rawEventId}`);
  }

  // Check if already processed
  if (rawEvent.processedAt) {
    logger.debug('Raw event already processed, skipping', { rawEventId: job.rawEventId });
    return { normalizedCount: 0, skippedCount: 1, errors: [] };
  }

  // 2. Get normalizer for source type
  const normalizer = normalizers[job.sourceType];
  if (!normalizer) {
    const err = `No normalizer registered for source type: ${job.sourceType}`;
    logger.error(err);
    await markRawEventError(db, job.rawEventId, err);
    return { normalizedCount: 0, skippedCount: 0, errors: [err] };
  }

  // 3. Normalize
  // In production, we'd read the payload from S3.
  // For MVP, we pass the raw event data as-is.
  // The normalizer must handle the event structure.
  let normalizedRecords: NormalizedRecordData[];
  try {
    // TODO: Read payload from S3 using storageKey
    // For now, we need to re-fetch or have the payload in the job
    normalizedRecords = normalizer.normalize(
      job.eventType,
      {} as Record<string, unknown>, // Placeholder — in production, read from S3
    );
  } catch (error) {
    const err = `Normalization failed: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(err, { rawEventId: job.rawEventId });
    await markRawEventError(db, job.rawEventId, err);
    return { normalizedCount: 0, skippedCount: 0, errors: [err] };
  }

  // 4. Write normalized records (with deduplication)
  for (const record of normalizedRecords) {
    try {
      // Check for existing record with same dedup key
      const existing = await db
        .select({ id: schema.normalizedRecords.id })
        .from(schema.normalizedRecords)
        .where(eq(schema.normalizedRecords.deduplicationKey, record.deduplicationKey))
        .limit(1);

      if (existing.length > 0) {
        // Update existing record
        await db
          .update(schema.normalizedRecords)
          .set({
            data: record.data,
            rawEventId: job.rawEventId,
            normalizedAt: new Date(),
          })
          .where(eq(schema.normalizedRecords.id, existing[0]!.id));
        normalizedCount++;
      } else {
        // Insert new record
        await db.insert(schema.normalizedRecords).values({
          rawEventId: job.rawEventId,
          sourceType: record.sourceType,
          entityType: record.entityType,
          entityId: record.entityId,
          externalId: record.externalId,
          deduplicationKey: record.deduplicationKey,
          data: record.data,
        });
        normalizedCount++;
      }

      // 5. Write to entity-specific table
      await writeToEntityTable(db, record);
    } catch (error) {
      const err = `Failed to write record: ${error instanceof Error ? error.message : String(error)}`;
      errors.push(err);
      logger.error(err, {
        entityType: record.entityType,
        entityId: record.entityId,
      });
    }
  }

  // 6. Mark raw event as processed
  await db
    .update(schema.rawEvents)
    .set({ processedAt: new Date() })
    .where(eq(schema.rawEvents.id, job.rawEventId));

  logger.info('Normalization complete', {
    rawEventId: job.rawEventId,
    normalizedCount,
    skippedCount,
    errorCount: errors.length,
  });

  return { normalizedCount, skippedCount, errors };
}

/**
 * Write normalized data to the appropriate entity-specific table.
 */
async function writeToEntityTable(
  db: ReturnType<typeof getDb>,
  record: NormalizedRecordData,
): Promise<void> {
  const data = record.data;

  switch (record.entityType) {
    case 'git_repository': {
      const existing = await db
        .select({ id: schema.gitRepositories.id })
        .from(schema.gitRepositories)
        .where(
          and(
            eq(schema.gitRepositories.sourceType, record.sourceType),
            eq(schema.gitRepositories.externalId, record.externalId),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(schema.gitRepositories)
          .set({
            fullName: data.fullName as string,
            name: data.name as string,
            description: data.description as string | undefined,
            language: data.language as string | undefined,
            topics: data.topics as string[] | undefined,
            isPrivate: data.isPrivate as boolean | undefined,
            stars: data.stars as number | undefined,
            forks: data.forks as number | undefined,
            lastPushAt: data.lastPushAt ? new Date(data.lastPushAt as string) : undefined,
            updatedAt: new Date(),
          })
          .where(eq(schema.gitRepositories.id, existing[0]!.id));
      } else {
        await db.insert(schema.gitRepositories).values({
          sourceType: record.sourceType,
          externalId: record.externalId,
          fullName: data.fullName as string,
          name: data.name as string,
          description: data.description as string | undefined,
          language: data.language as string | undefined,
          topics: data.topics as string[] | undefined,
          isPrivate: data.isPrivate as boolean | undefined,
          stars: data.stars as number | undefined,
          forks: data.forks as number | undefined,
          lastPushAt: data.lastPushAt ? new Date(data.lastPushAt as string) : undefined,
        });
      }
      break;
    }

    case 'pull_request': {
      const repoFullName = data._repository as string;
      // Find the repository
      const [repo] = await db
        .select({ id: schema.gitRepositories.id })
        .from(schema.gitRepositories)
        .where(eq(schema.gitRepositories.fullName, repoFullName))
        .limit(1);

      if (!repo) {
        logger.warn('Repository not found for PR, skipping entity write', {
          repository: repoFullName,
        });
        return;
      }

      const existingPR = await db
        .select({ id: schema.pullRequests.id })
        .from(schema.pullRequests)
        .where(
          and(
            eq(schema.pullRequests.repositoryId, repo.id),
            eq(schema.pullRequests.externalId, record.externalId),
          ),
        )
        .limit(1);

      const prData = {
        repositoryId: repo.id,
        externalId: record.externalId,
        number: data.number as number,
        title: data.title as string,
        body: data.body as string | undefined,
        state: data.state as string,
        authorLogin: data.authorLogin as string,
        labels: data.labels as string[] | undefined,
        reviewers: data.reviewers as string[] | undefined,
        additions: data.additions as number | undefined,
        deletions: data.deletions as number | undefined,
        commitsCount: data.commitsCount as number | undefined,
        commentsCount: data.commentsCount as number | undefined,
        mergedAt: data.mergedAt ? new Date(data.mergedAt as string) : undefined,
        closedAt: data.closedAt ? new Date(data.closedAt as string) : undefined,
        updatedAt: new Date(),
      };

      if (existingPR.length > 0) {
        await db
          .update(schema.pullRequests)
          .set(prData)
          .where(eq(schema.pullRequests.id, existingPR[0]!.id));
      } else {
        await db.insert(schema.pullRequests).values(prData);
      }
      break;
    }

    case 'issue': {
      const issueRepoFullName = data._repository as string;
      const [issueRepo] = await db
        .select({ id: schema.gitRepositories.id })
        .from(schema.gitRepositories)
        .where(eq(schema.gitRepositories.fullName, issueRepoFullName))
        .limit(1);

      if (!issueRepo) {
        logger.warn('Repository not found for issue, skipping entity write', {
          repository: issueRepoFullName,
        });
        return;
      }

      const existingIssue = await db
        .select({ id: schema.issues.id })
        .from(schema.issues)
        .where(
          and(
            eq(schema.issues.repositoryId, issueRepo.id),
            eq(schema.issues.externalId, record.externalId),
          ),
        )
        .limit(1);

      const issueData = {
        repositoryId: issueRepo.id,
        externalId: record.externalId,
        number: data.number as number,
        title: data.title as string,
        body: data.body as string | undefined,
        state: data.state as string,
        authorLogin: data.authorLogin as string,
        labels: data.labels as string[] | undefined,
        assignees: data.assignees as string[] | undefined,
        commentsCount: data.commentsCount as number | undefined,
        closedAt: data.closedAt ? new Date(data.closedAt as string) : undefined,
        updatedAt: new Date(),
      };

      if (existingIssue.length > 0) {
        await db
          .update(schema.issues)
          .set(issueData)
          .where(eq(schema.issues.id, existingIssue[0]!.id));
      } else {
        await db.insert(schema.issues).values(issueData);
      }
      break;
    }

    case 'commit': {
      const commitRepoFullName = data._repository as string;
      const [commitRepo] = await db
        .select({ id: schema.gitRepositories.id })
        .from(schema.gitRepositories)
        .where(eq(schema.gitRepositories.fullName, commitRepoFullName))
        .limit(1);

      if (!commitRepo) return;

      const existingCommit = await db
        .select({ id: schema.commits.id })
        .from(schema.commits)
        .where(eq(schema.commits.sha, data.sha as string))
        .limit(1);

      if (existingCommit.length === 0) {
        await db.insert(schema.commits).values({
          repositoryId: commitRepo.id,
          sha: data.sha as string,
          message: data.message as string,
          authorName: data.authorName as string,
          authorEmail: data.authorEmail as string | undefined,
          additions: data.additions as number | undefined,
          deletions: data.deletions as number | undefined,
          filesChanged: data.filesChanged as number | undefined,
          committedAt: new Date(data.committedAt as string),
        });
      }
      break;
    }

    default:
      logger.debug('No entity table write for entity type', {
        entityType: record.entityType,
      });
  }
}

async function markRawEventError(
  db: ReturnType<typeof getDb>,
  rawEventId: string,
  error: string,
): Promise<void> {
  await db
    .update(schema.rawEvents)
    .set({ processingError: error })
    .where(eq(schema.rawEvents.id, rawEventId));
}
