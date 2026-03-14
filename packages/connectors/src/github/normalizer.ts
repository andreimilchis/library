import type { NormalizedRecordData } from '@eye1/common';

/**
 * Normalizes raw GitHub API payloads into canonical data model records.
 */
export class GitHubNormalizer {
  normalize(eventType: string, payload: Record<string, unknown>): NormalizedRecordData[] {
    switch (eventType) {
      case 'repository.synced':
        return this.normalizeRepository(payload);
      case 'pull_request.synced':
      case 'pull_request.opened':
      case 'pull_request.closed':
      case 'pull_request.merged':
      case 'pull_request.reopened':
        return this.normalizePullRequest(payload);
      case 'issue.synced':
      case 'issues.opened':
      case 'issues.closed':
      case 'issues.reopened':
        return this.normalizeIssue(payload);
      case 'push':
        return this.normalizePush(payload);
      default:
        return [];
    }
  }

  private normalizeRepository(payload: Record<string, unknown>): NormalizedRecordData[] {
    return [
      {
        entityType: 'git_repository',
        entityId: String(payload.id),
        externalId: String(payload.id),
        sourceType: 'github',
        deduplicationKey: `github:git_repository:${payload.id}`,
        data: {
          fullName: payload.full_name,
          name: payload.name,
          description: payload.description,
          language: payload.language,
          topics: payload.topics,
          isPrivate: payload.private,
          stars: (payload as Record<string, unknown>).stargazers_count,
          forks: (payload as Record<string, unknown>).forks_count,
          lastPushAt: payload.pushed_at,
        },
      },
    ];
  }

  private normalizePullRequest(payload: Record<string, unknown>): NormalizedRecordData[] {
    // Handle both webhook format (payload.pull_request) and direct format
    const pr = (payload.pull_request as Record<string, unknown>) || payload;
    const repo =
      (payload._repository as string) ||
      ((pr.base as Record<string, unknown>)?.repo as Record<string, unknown>)?.full_name;
    const number = pr.number as number;
    const externalId = `${repo}#${number}`;

    const user = pr.user as Record<string, unknown>;
    const state = pr.merged_at ? 'merged' : (pr.state as string);

    return [
      {
        entityType: 'pull_request',
        entityId: externalId,
        externalId,
        sourceType: 'github',
        deduplicationKey: `github:pull_request:${externalId}`,
        data: {
          number,
          title: pr.title,
          body: pr.body,
          state,
          authorLogin: user?.login,
          labels: ((pr.labels as Array<Record<string, unknown>>) || []).map((l) => l.name),
          reviewers: ((pr.requested_reviewers as Array<Record<string, unknown>>) || []).map(
            (r) => r.login,
          ),
          additions: pr.additions,
          deletions: pr.deletions,
          commitsCount: pr.commits,
          commentsCount: pr.comments,
          mergedAt: pr.merged_at,
          closedAt: pr.closed_at,
          createdAt: pr.created_at,
          updatedAt: pr.updated_at,
          _repository: repo,
        },
      },
    ];
  }

  private normalizeIssue(payload: Record<string, unknown>): NormalizedRecordData[] {
    const issue = (payload.issue as Record<string, unknown>) || payload;
    const repo =
      (payload._repository as string) ||
      ((payload.repository as Record<string, unknown>)?.full_name as string);
    const number = issue.number as number;
    const externalId = `${repo}#${number}`;

    const user = issue.user as Record<string, unknown>;

    return [
      {
        entityType: 'issue',
        entityId: externalId,
        externalId,
        sourceType: 'github',
        deduplicationKey: `github:issue:${externalId}`,
        data: {
          number,
          title: issue.title,
          body: issue.body,
          state: issue.state,
          authorLogin: user?.login,
          labels: ((issue.labels as Array<Record<string, unknown>>) || []).map((l) => l.name),
          assignees: ((issue.assignees as Array<Record<string, unknown>>) || []).map(
            (a) => a.login,
          ),
          commentsCount: issue.comments,
          closedAt: issue.closed_at,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          _repository: repo,
        },
      },
    ];
  }

  private normalizePush(payload: Record<string, unknown>): NormalizedRecordData[] {
    const records: NormalizedRecordData[] = [];
    const repo = (payload.repository as Record<string, unknown>)?.full_name as string;
    const commits = (payload.commits as Array<Record<string, unknown>>) || [];

    for (const commit of commits) {
      const sha = commit.id as string;
      const author = commit.author as Record<string, unknown>;

      records.push({
        entityType: 'commit',
        entityId: sha,
        externalId: sha,
        sourceType: 'github',
        deduplicationKey: `github:commit:${sha}`,
        data: {
          sha,
          message: commit.message,
          authorName: author?.name,
          authorEmail: author?.email,
          additions: commit.added
            ? (commit.added as string[]).length
            : undefined,
          deletions: commit.removed
            ? (commit.removed as string[]).length
            : undefined,
          filesChanged: commit.modified
            ? (commit.modified as string[]).length
            : undefined,
          committedAt: commit.timestamp,
          _repository: repo,
        },
      });
    }

    return records;
  }
}
