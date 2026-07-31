import { Redis } from '@upstash/redis';

const redisUrl =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  process.env.REDIS_URL ||
  process.env.KV_URL;

const redisToken =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  process.env.REDIS_TOKEN ||
  process.env.KV_TOKEN;

let redisClient = null;

export function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  if (!redisUrl || !redisToken) {
    throw new Error('Missing Upstash Redis environment variables');
  }

  redisClient = new Redis({
    url: redisUrl,
    token: redisToken,
  });

  return redisClient;
}