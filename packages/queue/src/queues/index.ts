import { Queue } from 'bullmq';
import { getRedis } from '../connection';
import { QUEUES } from '@eye1/common';
import type { NormalizationJobData } from '@eye1/common';

export function createQueue<T = unknown>(name: string) {
  return new Queue<T>(name, {
    connection: getRedis(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: {
        age: 86400, // 24h
        count: 1000,
      },
      removeOnFail: {
        age: 604800, // 7 days
      },
    },
  });
}

// Pre-defined queues
export const ingestionQueue = () => createQueue(QUEUES.INGESTION);
export const normalizationQueue = () => createQueue<NormalizationJobData>(QUEUES.NORMALIZATION);
export const embeddingQueue = () => createQueue(QUEUES.EMBEDDING);
export const graphUpdateQueue = () => createQueue(QUEUES.GRAPH_UPDATE);
export const insightTriggerQueue = () => createQueue(QUEUES.INSIGHT_TRIGGER);
export const agentRunQueue = () => createQueue(QUEUES.AGENT_RUN);
export const syncPollQueue = () => createQueue(QUEUES.SYNC_POLL);
export const deadLetterQueue = () => createQueue(QUEUES.DEAD_LETTER);
