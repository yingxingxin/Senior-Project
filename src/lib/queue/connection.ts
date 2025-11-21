/**
 * BullMQ Redis Connection Configuration
 *
 * Centralized Redis connection settings for BullMQ queues and workers.
 * Supports local development and production environments.
 */

import type { ConnectionOptions } from 'bullmq';

/**
 * Redis connection options for BullMQ
 *
 * IMPORTANT: In production, ensure REDIS_URL is set in environment variables.
 * Format: redis://username:password@host:port or rediss:// for TLS
 */
export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,

  // Use TLS in production
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,

  // Connection timeout and retry settings
  connectTimeout: 10000, // 10 seconds
  maxRetriesPerRequest: 3,

  // Keep-alive settings
  keepAlive: 30000, // 30 seconds

  // Reconnect on error
  retryStrategy: (times: number) => {
    // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
    const delay = Math.min(Math.pow(2, times) * 1000, 10000);
    console.log(`[Redis] Retry connection in ${delay}ms (attempt ${times})`);
    return delay;
  },
};

/**
 * Parse Redis URL from environment variable
 * Useful for services like Railway, Render, Heroku, etc.
 */
export function getRedisConnectionFromUrl(): ConnectionOptions | null {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    return null;
  }

  try {
    const url = new URL(redisUrl);

    return {
      host: url.hostname,
      port: parseInt(url.port || '6379', 10),
      password: url.password || undefined,
      username: url.username || undefined,
      tls: url.protocol === 'rediss:' ? {} : undefined,
      connectTimeout: 10000,
      maxRetriesPerRequest: 3,
      keepAlive: 30000,
      retryStrategy: (times: number) => Math.min(Math.pow(2, times) * 1000, 10000),
    };
  } catch (error) {
    console.error('[Redis] Failed to parse REDIS_URL:', error);
    return null;
  }
}

/**
 * Get the appropriate Redis connection based on environment
 */
export function getRedisConnection(): ConnectionOptions {
  // Try URL-based connection first (production)
  const urlConnection = getRedisConnectionFromUrl();
  if (urlConnection) {
    console.log('[Redis] Using connection from REDIS_URL');
    return urlConnection;
  }

  // Fall back to host/port configuration (development)
  console.log('[Redis] Using host/port configuration');
  return redisConnection;
}
