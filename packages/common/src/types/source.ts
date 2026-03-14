import { z } from 'zod';

export const SourceType = z.enum([
  'github',
  'notion',
  'whoop',
  'revolut',
  'smartbill',
  'whatsapp',
  'spotify',
  'claude',
  'chatgpt',
]);
export type SourceType = z.infer<typeof SourceType>;

export const SourceConnectionStatus = z.enum([
  'pending_auth',
  'connected',
  'syncing',
  'error',
  'disconnected',
  'deleted',
]);
export type SourceConnectionStatus = z.infer<typeof SourceConnectionStatus>;

export const SyncJobType = z.enum(['full', 'incremental', 'backfill', 'webhook', 'import']);
export type SyncJobType = z.infer<typeof SyncJobType>;

export const SyncJobStatus = z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']);
export type SyncJobStatus = z.infer<typeof SyncJobStatus>;

export const SyncMode = z.enum(['webhook', 'polling', 'import', 'hybrid']);
export type SyncMode = z.infer<typeof SyncMode>;

export interface SourceConnectorConfig {
  sourceType: SourceType;
  displayName: string;
  description: string;
  supportedSyncModes: SyncMode[];
  authType: 'oauth2' | 'api_key' | 'import_only';
  mvpSupported: boolean;
  defaultPollIntervalMinutes: number;
}

export const SOURCE_CONFIGS: Record<SourceType, SourceConnectorConfig> = {
  github: {
    sourceType: 'github',
    displayName: 'GitHub',
    description: 'Repositories, commits, PRs, issues, code reviews',
    supportedSyncModes: ['webhook', 'polling'],
    authType: 'oauth2',
    mvpSupported: true,
    defaultPollIntervalMinutes: 15,
  },
  notion: {
    sourceType: 'notion',
    displayName: 'Notion',
    description: 'Pages, databases, blocks, knowledge base',
    supportedSyncModes: ['polling'],
    authType: 'oauth2',
    mvpSupported: true,
    defaultPollIntervalMinutes: 10,
  },
  whoop: {
    sourceType: 'whoop',
    displayName: 'WHOOP',
    description: 'Sleep, recovery, strain, workouts, health metrics',
    supportedSyncModes: ['webhook', 'polling'],
    authType: 'oauth2',
    mvpSupported: true,
    defaultPollIntervalMinutes: 30,
  },
  revolut: {
    sourceType: 'revolut',
    displayName: 'Revolut',
    description: 'Transactions, balances, financial data',
    supportedSyncModes: ['polling', 'import'],
    authType: 'oauth2',
    mvpSupported: false,
    defaultPollIntervalMinutes: 60,
  },
  smartbill: {
    sourceType: 'smartbill',
    displayName: 'SmartBill',
    description: 'Invoices, clients, financial documents',
    supportedSyncModes: ['polling'],
    authType: 'api_key',
    mvpSupported: false,
    defaultPollIntervalMinutes: 60,
  },
  whatsapp: {
    sourceType: 'whatsapp',
    displayName: 'WhatsApp Business',
    description: 'Messages, conversations, contacts',
    supportedSyncModes: ['webhook'],
    authType: 'oauth2',
    mvpSupported: false,
    defaultPollIntervalMinutes: 0,
  },
  spotify: {
    sourceType: 'spotify',
    displayName: 'Spotify',
    description: 'Listening history, playlists, audio features',
    supportedSyncModes: ['polling'],
    authType: 'oauth2',
    mvpSupported: false,
    defaultPollIntervalMinutes: 5,
  },
  claude: {
    sourceType: 'claude',
    displayName: 'Claude',
    description: 'Conversation exports, artifacts, knowledge',
    supportedSyncModes: ['import'],
    authType: 'import_only',
    mvpSupported: false,
    defaultPollIntervalMinutes: 0,
  },
  chatgpt: {
    sourceType: 'chatgpt',
    displayName: 'ChatGPT',
    description: 'Conversation exports, artifacts, knowledge',
    supportedSyncModes: ['import'],
    authType: 'import_only',
    mvpSupported: false,
    defaultPollIntervalMinutes: 0,
  },
};
