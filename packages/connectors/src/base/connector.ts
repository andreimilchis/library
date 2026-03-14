import type { SourceType, SyncMode } from '@eye1/common';
import type {
  ConnectionConfig,
  ConnectionResult,
  HealthCheck,
  SyncCursor,
  FetchResult,
  WebhookPayload,
  WebhookValidationResult,
  RawEventPayload,
  ImportFile,
  RateLimitConfig,
} from './types';

/**
 * Abstract base class for all source connectors.
 * Each connector implements this interface to provide standardized
 * data fetching, webhook handling, and auth management.
 */
export abstract class BaseConnector {
  abstract readonly sourceType: SourceType;
  abstract readonly displayName: string;
  abstract readonly supportedSyncModes: SyncMode[];
  abstract readonly rateLimits: RateLimitConfig;

  /**
   * Establish connection with the source platform.
   * For OAuth: exchange code for tokens.
   * For API key: validate the key.
   */
  abstract connect(config: ConnectionConfig): Promise<ConnectionResult>;

  /**
   * Clean up connection resources.
   */
  abstract disconnect(): Promise<void>;

  /**
   * Test if the connection is still valid.
   */
  abstract testConnection(credentials: Record<string, string>): Promise<HealthCheck>;

  /**
   * Fetch data incrementally from the last sync point.
   */
  abstract fetchIncremental(
    credentials: Record<string, string>,
    cursor: SyncCursor,
  ): Promise<FetchResult>;

  /**
   * Fetch all available data (for initial sync / backfill).
   */
  abstract fetchFull(credentials: Record<string, string>): Promise<FetchResult>;

  /**
   * Validate and parse a webhook payload.
   */
  validateWebhook?(payload: WebhookPayload, secret: string): WebhookValidationResult;

  /**
   * Transform a validated webhook payload into raw events.
   */
  handleWebhook?(payload: WebhookPayload): RawEventPayload[];

  /**
   * Import data from a file upload.
   */
  importFile?(file: ImportFile): Promise<RawEventPayload[]>;

  /**
   * Get the OAuth authorization URL.
   */
  getAuthUrl?(redirectUri: string, state: string): string;

  /**
   * Exchange OAuth code for tokens.
   */
  exchangeCode?(code: string, redirectUri: string): Promise<Record<string, string>>;

  /**
   * Refresh an expired OAuth token.
   */
  refreshToken?(refreshToken: string): Promise<Record<string, string>>;

  /**
   * Get available data scopes for this connector.
   */
  getAvailableScopes(): string[] {
    return [];
  }
}
