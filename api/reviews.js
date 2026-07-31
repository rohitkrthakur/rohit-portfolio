import { getRedisClient } from './redis.js';

const REVIEWS_KEY = 'portfolio:reviews';
const REVIEWS_LIST_KEY = 'portfolio:reviews:list';
const REVIEW_MIN_LENGTH = 60;
const REVIEW_MAX_LENGTH = 200;
const REVIEW_LIMIT = 30;

function readStoredReviews(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

function normalizeReview(review) {
  return {
    id: review.id || crypto.randomUUID(),
    username: review.username,
    occupation: review.occupation,
    review: review.review,
    createdAt: review.createdAt || new Date().toISOString(),
  };
}

async function readReviews(redis) {
  if (typeof redis.lrange === 'function') {
    try {
      const values = await redis.lrange(REVIEWS_LIST_KEY, 0, REVIEW_LIMIT - 1);
      if (Array.isArray(values) && values.length > 0) {
        return values
          .map((value) => {
            if (typeof value !== 'string') {
              return normalizeReview(value);
            }

            try {
              return normalizeReview(JSON.parse(value));
            } catch {
              return null;
            }
          })
          .filter(Boolean);
      }
    } catch {
      // Fall back to the legacy JSON string below.
    }
  }

  const value = await redis.get(REVIEWS_KEY);
  return readStoredReviews(value).map(normalizeReview);
}

async function storeReview(redis, review) {
  if (typeof redis.lpush === 'function') {
    try {
      await redis.lpush(REVIEWS_LIST_KEY, JSON.stringify(review));
      try {
        await redis.ltrim(REVIEWS_LIST_KEY, 0, REVIEW_LIMIT - 1);
      } catch {
        // The review is already stored; trimming is best-effort.
      }
      return true;
    } catch (error) {
      if (String(error?.message || error).includes('NOPERM')) {
        return false;
      }

      throw error;
    }
  }

  const existingReviews = await readReviews(redis);
  const reviews = [review, ...existingReviews].slice(0, REVIEW_LIMIT);
  await redis.set(REVIEWS_KEY, JSON.stringify(reviews));
  return true;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  try {
    const redis = getRedisClient();

    if (req.method === 'GET') {
      const reviews = await readReviews(redis);
      return res.status(200).json({ reviews });
    }

    if (req.method === 'POST') {
      const { username, occupation, review } = req.body || {};
      const reviewLength = typeof review === 'string' ? review.trim().length : 0;

      if (!username || !occupation || !review) {
        return res.status(400).json({ error: 'Username, occupation, and review are required.' });
      }

      if (reviewLength < REVIEW_MIN_LENGTH || reviewLength > REVIEW_MAX_LENGTH) {
        return res.status(400).json({
          error: `Review must be between ${REVIEW_MIN_LENGTH} and ${REVIEW_MAX_LENGTH} characters.`,
        });
      }

      const nextReview = normalizeReview({ username, occupation, review });

      const persisted = await storeReview(redis, nextReview);

      return res.status(200).json({ review: nextReview, persisted });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Reviews endpoint failed',
    });
  }
}
