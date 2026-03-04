/**
 * Rate Limiter
 *
 * Sliding window rate limiter using @upstash/redis.
 * Falls back to an in-memory Map when UPSTASH_REDIS_REST_URL is not configured.
 */

import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Redis client (optional)
// ---------------------------------------------------------------------------

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// ---------------------------------------------------------------------------
// In-memory fallback store
// ---------------------------------------------------------------------------

interface MemoryEntry {
  timestamps: number[];
}

const memoryStore = new Map<string, MemoryEntry>();

// Periodically clean up stale entries to prevent unbounded memory growth
const CLEANUP_INTERVAL = 60_000; // 1 minute
let lastCleanup = Date.now();

function cleanupMemoryStore(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, entry] of memoryStore.entries()) {
    // Remove entries with no recent timestamps (older than 1 hour)
    const cutoff = now - 3_600_000;
    entry.timestamps = entry.timestamps.filter((ts) => ts > cutoff);
    if (entry.timestamps.length === 0) {
      memoryStore.delete(key);
    }
  }
}

// ---------------------------------------------------------------------------
// Rate limit check
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // Unix timestamp (seconds) when the window resets
}

export async function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (redis) {
    return checkRateLimitRedis(identifier, maxRequests, windowSeconds);
  }
  return checkRateLimitMemory(identifier, maxRequests, windowSeconds);
}

// ---------------------------------------------------------------------------
// Redis implementation (sliding window)
// ---------------------------------------------------------------------------

async function checkRateLimitRedis(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = now - windowMs;

  // Use a pipeline for atomic operations
  const pipeline = redis!.pipeline();

  // Remove expired entries
  pipeline.zremrangebyscore(key, 0, windowStart);

  // Count current entries in the window
  pipeline.zcard(key);

  // Add the current request timestamp
  pipeline.zadd(key, { score: now, member: `${now}:${Math.random()}` });

  // Set expiry on the key
  pipeline.expire(key, windowSeconds);

  const results = await pipeline.exec();

  // results[1] is the zcard result (count before adding the new entry)
  const currentCount = (results[1] as number) || 0;

  const success = currentCount < maxRequests;
  const remaining = Math.max(0, maxRequests - currentCount - (success ? 1 : 0));
  const reset = Math.ceil((now + windowMs) / 1000);

  if (!success) {
    // Remove the entry we just added since the request is denied
    const lastResult = results[2];
    if (lastResult) {
      await redis!.zremrangebyscore(key, now, now);
    }
  }

  return { success, remaining, reset };
}

// ---------------------------------------------------------------------------
// In-memory implementation (sliding window)
// ---------------------------------------------------------------------------

function checkRateLimitMemory(
  identifier: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  cleanupMemoryStore();

  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const windowStart = now - windowMs;

  let entry = memoryStore.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    memoryStore.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((ts) => ts > windowStart);

  const currentCount = entry.timestamps.length;
  const success = currentCount < maxRequests;

  if (success) {
    entry.timestamps.push(now);
  }

  const remaining = Math.max(0, maxRequests - entry.timestamps.length);
  const reset = Math.ceil((now + windowMs) / 1000);

  return { success, remaining, reset };
}
