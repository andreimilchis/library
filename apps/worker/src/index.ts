import { Worker } from 'bullmq';
import { getRedis } from '@eye1/queue';
import { QUEUES, createLogger } from '@eye1/common';
import type { NormalizationJobData } from '@eye1/common';
import { processNormalization } from '@eye1/ingestion';

const logger = createLogger('worker');

function startWorkers() {
  logger.info('Starting eye1.ai workers...');

  // Normalization worker
  const normalizationWorker = new Worker<NormalizationJobData>(
    QUEUES.NORMALIZATION,
    async (job) => {
      logger.info('Processing normalization job', {
        jobId: job.id,
        rawEventId: job.data.rawEventId,
        sourceType: job.data.sourceType,
      });

      const result = await processNormalization(job.data);

      logger.info('Normalization job completed', {
        jobId: job.id,
        normalizedCount: result.normalizedCount,
        errors: result.errors.length,
      });

      return result;
    },
    {
      connection: getRedis(),
      concurrency: 5,
      limiter: {
        max: 50,
        duration: 60000, // 50 jobs per minute
      },
    },
  );

  normalizationWorker.on('failed', (job, error) => {
    logger.error('Normalization job failed', {
      jobId: job?.id,
      error: error.message,
    });
  });

  // Sync polling worker
  const syncPollWorker = new Worker(
    QUEUES.SYNC_POLL,
    async (job) => {
      logger.info('Processing sync poll', {
        jobId: job.id,
        sourceType: job.data.sourceType,
      });
      // TODO: Implement polling sync logic
    },
    {
      connection: getRedis(),
      concurrency: 3,
    },
  );

  // Agent run worker
  const agentRunWorker = new Worker(
    QUEUES.AGENT_RUN,
    async (job) => {
      logger.info('Processing agent run', {
        jobId: job.id,
        agentType: job.data.agentType,
      });
      // TODO: Implement agent execution
    },
    {
      connection: getRedis(),
      concurrency: 2,
    },
  );

  logger.info('All workers started', {
    workers: [
      QUEUES.NORMALIZATION,
      QUEUES.SYNC_POLL,
      QUEUES.AGENT_RUN,
    ],
  });

  // Graceful shutdown
  const shutdown = async () => {
    logger.info('Shutting down workers...');
    await normalizationWorker.close();
    await syncPollWorker.close();
    await agentRunWorker.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startWorkers();
