import { z } from 'zod';
import type { SourceType, SyncMode } from '@eye1/common';

export interface ConnectionConfig {
  credentials: Record<string, string>;
  config?: Record<string, unknown>;
  scopes?: string[];
}

export interface ConnectionResult {
  success: boolean;
  externalAccountId?: string;
  externalAccountName?: string;
  scopes?: string[];
  error?: string;
}

export interface HealthCheck {
  healthy: boolean;
  latencyMs: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface SyncCursor {
  lastSyncAt?: string;
  pageToken?: string;
  offset?: number;
  customData?: Record<string, unknown>;
}

export interface FetchResult {
  events: RawEventPayload[];
  nextCursor?: SyncCursor;
  hasMore: boolean;
  rateLimitRemaining?: number;
  rateLimitResetAt?: string;
}

export interface RawEventPayload {
  sourceType: SourceType;
  eventType: string;
  externalId?: string;
  payload: unknown;
  occurredAt?: string;
}

export interface WebhookPayload {
  headers: Record<string, string>;
  body: unknown;
  rawBody: Buffer;
}

export interface WebhookValidationResult {
  valid: boolean;
  eventType?: string;
  deliveryId?: string;
  error?: string;
}

export interface ImportFile {
  filename: string;
  contentType: string;
  content: Buffer;
}

export interface RateLimitConfig {
  requestsPerMinute: number;
  requestsPerHour?: number;
  burstLimit?: number;
}

export const OAuthTokens = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  tokenType: z.string().default('Bearer'),
  scope: z.string().optional(),
});
export type OAuthTokens = z.infer<typeof OAuthTokens>;
