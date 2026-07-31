import { getRedisClient } from './redis.js';

const COUNTER_KEY = 'resume:views';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const redis = getRedisClient();

    if (req.method === 'GET') {
      const value = await redis.get(COUNTER_KEY);
      const numberValue = typeof value === 'number' ? value : Number(value) || 0;
      return res.status(200).json({ value: numberValue });
    }

    if (req.method === 'POST') {
      const value = await redis.incr(COUNTER_KEY);
      return res.status(200).json({ value });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Resume counter failed',
    });
  }
}
