#!/usr/bin/env tsx

/**
 * BullMQ Worker Process
 *
 * Standalone worker process that processes jobs from BullMQ queues.
 * Run this in a separate process from the Next.js server.
 *
 * Usage:
 *   npm run worker           # Run in development
 *   tsx scripts/worker.ts    # Run directly with tsx
 *
 * Environment Variables Required:
 *   - REDIS_URL or REDIS_HOST/REDIS_PORT/REDIS_PASSWORD
 *   - ENABLE_WORKERS=true (optional, defaults to true for this script)
 *   - DATABASE_URL (for database access in job processors)
 *   - OPENROUTER_API_KEY (for AI generation)
 */

import { initializeAllWorkers, shutdownAllWorkers } from '../src/lib/queue';

// Force enable workers for this script
process.env.ENABLE_WORKERS = 'true';

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     🚀 BullMQ Worker Process Starting                         ║
║                                                                ║
║     Processing: AI Lesson Generation Jobs                     ║
║     Redis: ${process.env.REDIS_URL ? 'URL-based' : 'Host-based'}                                      ║
║     Concurrency: ${process.env.WORKER_CONCURRENCY || '2'} concurrent jobs                             ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

// Check required environment variables
const requiredEnvVars = ['DATABASE_URL', 'OPENROUTER_API_KEY'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach((key) => {
    console.error(`   - ${key}`);
  });
  console.error('\nPlease set these in your .env file');
  process.exit(1);
}

// Check Redis configuration
if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
  console.error('❌ Missing Redis configuration:');
  console.error('   Set either REDIS_URL or REDIS_HOST/REDIS_PORT');
  console.error('\n  Examples:');
  console.error('    REDIS_URL=redis://localhost:6379');
  console.error('    REDIS_HOST=localhost');
  console.error('    REDIS_PORT=6379');
  process.exit(1);
}

console.log('✅ Environment configuration validated\n');

// Initialize all workers
try {
  initializeAllWorkers();
  console.log('\n✅ Workers initialized and ready to process jobs');
  console.log('   Press Ctrl+C to gracefully shutdown\n');
} catch (error) {
  console.error('❌ Failed to initialize workers:', error);
  process.exit(1);
}

// Keep the process alive
process.stdin.resume();

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n📦 Received SIGTERM - Shutting down gracefully...');
  await shutdownAllWorkers();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n📦 Received SIGINT - Shutting down gracefully...');
  await shutdownAllWorkers();
  process.exit(0);
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  shutdownAllWorkers().finally(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
  shutdownAllWorkers().finally(() => {
    process.exit(1);
  });
});
