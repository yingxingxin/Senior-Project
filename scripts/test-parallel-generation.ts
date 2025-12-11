#!/usr/bin/env tsx

/**
 * Test Script: Parallel Lesson Generation
 *
 * Tests the new parallel flow using BullMQ Flows.
 *
 * Usage:
 *   npx tsx scripts/test-parallel-generation.ts
 *
 * Make sure the worker is running in another terminal:
 *   npm run worker:dev
 */

import { startParallelLessonGenerationFlow } from '../src/lib/queue';
import { lessonGenerationQueue } from '../src/lib/queue/queues';

// Test user ID - change this to a valid user ID in your database
const TEST_USER_ID = 1;

async function main() {
  console.log('Testing Parallel Lesson Generation\n');
  console.log('This will create a course using the new parallel flow.');
  console.log('Lessons will be generated in parallel for faster completion.\n');

  const startTime = Date.now();

  // Start the parallel flow
  const { parentJobId, childrenCount } = await startParallelLessonGenerationFlow({
    userId: TEST_USER_ID,
    topic: 'Python Data Structures',
    difficulty: 'standard',
    triggerSource: 'manual',
    estimatedDurationMinutes: 30,
  });

  console.log(`Flow created:`);
  console.log(`   Parent job (finalize-course): ${parentJobId}`);
  console.log(`   Children (generate-single-lesson): ${childrenCount} lessons\n`);
  console.log('Polling for status...\n');

  // Poll for parent job completion
  // Note: FlowProducer jobs may take a moment to appear in the queue
  let lastState = '';
  let pollCount = 0;
  const maxPolls = 180; // 3 minutes max

  // Wait a moment for jobs to be created
  await new Promise(resolve => setTimeout(resolve, 2000));

  while (pollCount < maxPolls) {
    const parentJob = await lessonGenerationQueue.getJob(parentJobId);

    if (!parentJob) {
      // Job might not be visible yet, keep polling
      if (pollCount < 10) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        pollCount++;
        continue;
      }
      console.log('Parent job not found after waiting');
      break;
    }

    const state = await parentJob.getState();

    // Only log state changes
    if (state !== lastState) {
      console.log(`Parent job state: ${state}`);
      lastState = state;
    }

    // Check children status
    if (pollCount % 5 === 0) {
      const children = await parentJob.getChildrenValues();
      const completedCount = Object.keys(children).length;
      console.log(`   Children completed: ${completedCount}/${childrenCount}`);
    }

    // Check completion
    if (state === 'completed') {
      const result = parentJob.returnvalue;
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      console.log(`\nJob completed in ${elapsed}s!\n`);
      console.log('Result:', JSON.stringify(result, null, 2));

      if (result?.sectionCount && result.sectionCount > 0) {
        console.log(`\nSUCCESS: Created ${result.sectionCount} sections total`);
        console.log(`   Course ID: ${result.lessonId}`);
        console.log(`   Course Slug: ${result.lessonSlug}`);
        console.log(`   Generation Time: ${elapsed}s`);
      }
      break;
    }

    if (state === 'failed') {
      const error = parentJob.failedReason;
      console.log('\nJob failed!');
      console.log('Error:', error);
      break;
    }

    // Check if waiting for children
    if (state === 'waiting-children') {
      process.stdout.write(`\r   Waiting for ${childrenCount} lessons to complete...`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    pollCount++;
  }

  if (pollCount >= maxPolls) {
    console.log('\nTimeout - job taking too long');
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
