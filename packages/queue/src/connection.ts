import IORedis from 'ioredis';

let _redis: IORedis | null = null;

export function getRedis(): IORedis {
  if (!_redis) {
    const url = process.env.REDIS_URL || 'redis://localhost:6379';
    _redis = new IORedis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }
  return _redis;
}
