import { createHmac, timingSafeEqual } from 'crypto';
import type { SourceType, SyncMode } from '@eye1/common';
import { BaseConnector } from '../base/connector';
import type {
  ConnectionConfig,
  ConnectionResult,
  HealthCheck,
  SyncCursor,
  FetchResult,
  WebhookPayload,
  WebhookValidationResult,
  RawEventPayload,
  RateLimitConfig,
} from '../base/types';

const GITHUB_API = 'https://api.github.com';

export class GitHubConnector extends BaseConnector {
  readonly sourceType: SourceType = 'github';
  readonly displayName = 'GitHub';
  readonly supportedSyncModes: SyncMode[] = ['webhook', 'polling'];
  readonly rateLimits: RateLimitConfig = {
    requestsPerMinute: 80,
    requestsPerHour: 5000,
    burstLimit: 100,
  };

  async connect(config: ConnectionConfig): Promise<ConnectionResult> {
    const { accessToken } = config.credentials;
    if (!accessToken) {
      return { success: false, error: 'Access token required' };
    }

    try {
      const user = await this.apiRequest('/user', accessToken);
      return {
        success: true,
        externalAccountId: String(user.id),
        externalAccountName: user.login,
        scopes: config.scopes,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect',
      };
    }
  }

  async disconnect(): Promise<void> {
    // GitHub tokens don't need explicit revocation for PATs
    // For OAuth apps, we could revoke the grant
  }

  async testConnection(credentials: Record<string, string>): Promise<HealthCheck> {
    const start = Date.now();
    try {
      await this.apiRequest('/user', credentials.accessToken!);
      return { healthy: true, latencyMs: Date.now() - start };
    } catch (error) {
      return {
        healthy: false,
        latencyMs: Date.now() - start,
        error: error instanceof Error ? error.message : 'Connection test failed',
      };
    }
  }

  async fetchIncremental(
    credentials: Record<string, string>,
    cursor: SyncCursor,
  ): Promise<FetchResult> {
    const since = cursor.lastSyncAt || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const events: RawEventPayload[] = [];
    let rateLimitRemaining: number | undefined;

    // Fetch recent events for the authenticated user
    const response = await this.apiRequestWithHeaders(
      `/users/${cursor.customData?.login || 'me'}/events?per_page=100`,
      credentials.accessToken!,
    );

    rateLimitRemaining = parseInt(response.headers['x-ratelimit-remaining'] || '0', 10);

    for (const event of response.data as Array<Record<string, unknown>>) {
      const createdAt = event.created_at as string;
      if (createdAt && new Date(createdAt) > new Date(since)) {
        events.push({
          sourceType: 'github',
          eventType: `event.${(event.type as string || 'unknown').toLowerCase()}`,
          externalId: event.id as string,
          payload: event,
          occurredAt: createdAt,
        });
      }
    }

    return {
      events,
      hasMore: false,
      nextCursor: { lastSyncAt: new Date().toISOString(), customData: cursor.customData },
      rateLimitRemaining,
    };
  }

  async fetchFull(credentials: Record<string, string>): Promise<FetchResult> {
    const events: RawEventPayload[] = [];
    const token = credentials.accessToken!;

    // 1. Fetch all repos
    const repos = await this.fetchAllPages('/user/repos?per_page=100&sort=pushed', token);
    for (const repo of repos) {
      events.push({
        sourceType: 'github',
        eventType: 'repository.synced',
        externalId: String(repo.id),
        payload: repo,
        occurredAt: repo.pushed_at as string,
      });
    }

    // 2. For each repo, fetch recent PRs and issues
    for (const repo of repos.slice(0, 20)) {
      // Limit to 20 most recently pushed repos
      const fullName = repo.full_name as string;

      try {
        const prs = await this.fetchAllPages(
          `/repos/${fullName}/pulls?state=all&per_page=100&sort=updated&direction=desc`,
          token,
          2, // max 2 pages = 200 PRs
        );
        for (const pr of prs) {
          events.push({
            sourceType: 'github',
            eventType: 'pull_request.synced',
            externalId: `${fullName}#${pr.number}`,
            payload: { ...pr, _repository: fullName },
            occurredAt: pr.updated_at as string,
          });
        }

        const issuesData = await this.fetchAllPages(
          `/repos/${fullName}/issues?state=all&per_page=100&sort=updated&direction=desc`,
          token,
          2,
        );
        for (const issue of issuesData) {
          // Skip pull requests (GitHub lists PRs as issues too)
          if (issue.pull_request) continue;
          events.push({
            sourceType: 'github',
            eventType: 'issue.synced',
            externalId: `${fullName}#${issue.number}`,
            payload: { ...issue, _repository: fullName },
            occurredAt: issue.updated_at as string,
          });
        }
      } catch {
        // Skip repos we can't access (permissions)
        continue;
      }
    }

    return {
      events,
      hasMore: false,
    };
  }

  validateWebhook(payload: WebhookPayload, secret: string): WebhookValidationResult {
    const signature = payload.headers['x-hub-signature-256'];
    const deliveryId = payload.headers['x-github-delivery'];
    const eventType = payload.headers['x-github-event'];

    if (!signature || !deliveryId || !eventType) {
      return { valid: false, error: 'Missing required webhook headers' };
    }

    const expectedSignature =
      'sha256=' + createHmac('sha256', secret).update(payload.rawBody).digest('hex');

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      return { valid: false, error: 'Invalid webhook signature' };
    }

    return {
      valid: true,
      eventType,
      deliveryId,
    };
  }

  handleWebhook(payload: WebhookPayload): RawEventPayload[] {
    const eventType = payload.headers['x-github-event'] || 'unknown';
    const body = payload.body as Record<string, unknown>;
    const action = body.action as string | undefined;

    const fullEventType = action ? `${eventType}.${action}` : eventType;

    return [
      {
        sourceType: 'github',
        eventType: fullEventType,
        externalId: payload.headers['x-github-delivery'],
        payload: body,
        occurredAt: new Date().toISOString(),
      },
    ];
  }

  getAuthUrl(redirectUri: string, state: string): string {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const scopes = 'repo,read:user,read:org';
    return `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${state}`;
  }

  async exchangeCode(code: string, redirectUri: string): Promise<Record<string, string>> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = (await response.json()) as Record<string, string>;
    if (data.error) {
      throw new Error(`GitHub OAuth error: ${data.error_description || data.error}`);
    }

    return {
      accessToken: data.access_token!,
      tokenType: data.token_type || 'bearer',
      scope: data.scope || '',
    };
  }

  getAvailableScopes(): string[] {
    return ['repo', 'read:user', 'read:org', 'notifications'];
  }

  // Private helpers

  private async apiRequest(path: string, token: string): Promise<Record<string, unknown>> {
    const response = await fetch(`${GITHUB_API}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as Record<string, unknown>;
  }

  private async apiRequestWithHeaders(
    path: string,
    token: string,
  ): Promise<{ data: unknown; headers: Record<string, string> }> {
    const response = await fetch(`${GITHUB_API}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return { data: await response.json(), headers };
  }

  private async fetchAllPages(
    path: string,
    token: string,
    maxPages = 5,
  ): Promise<Array<Record<string, unknown>>> {
    const allItems: Array<Record<string, unknown>> = [];
    let currentPath = path;
    let page = 0;

    while (currentPath && page < maxPages) {
      const response = await fetch(`${GITHUB_API}${currentPath}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });

      if (!response.ok) break;

      const items = (await response.json()) as Array<Record<string, unknown>>;
      allItems.push(...items);

      // Parse Link header for next page
      const linkHeader = response.headers.get('Link');
      const nextMatch = linkHeader?.match(/<([^>]+)>;\s*rel="next"/);
      currentPath = nextMatch ? nextMatch[1]!.replace(GITHUB_API, '') : '';
      page++;
    }

    return allItems;
  }
}
