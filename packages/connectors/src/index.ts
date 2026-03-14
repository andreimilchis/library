export { BaseConnector } from './base';
export * from './base/types';
export { GitHubConnector, GitHubNormalizer } from './github';

import type { SourceType } from '@eye1/common';
import { BaseConnector } from './base';
import { GitHubConnector } from './github';

const connectorRegistry = new Map<SourceType, () => BaseConnector>();

connectorRegistry.set('github', () => new GitHubConnector());
// Future: connectorRegistry.set('notion', () => new NotionConnector());
// Future: connectorRegistry.set('whoop', () => new WhoopConnector());

export function getConnector(sourceType: SourceType): BaseConnector {
  const factory = connectorRegistry.get(sourceType);
  if (!factory) {
    throw new Error(`No connector registered for source type: ${sourceType}`);
  }
  return factory();
}

export function getRegisteredConnectors(): SourceType[] {
  return Array.from(connectorRegistry.keys());
}
