#!/usr/bin/env tsx

/**
 * Test Script: Lesson Generation
 *
 * Triggers a test lesson generation job to verify the fix for empty lessons.
 *
 * Usage:
 *   npx tsx scripts/test-lesson-generation.ts
 *
 * Make sure the worker is running in another terminal:
 *   npm run worker:dev
 */

import { enqueueLessonGeneration, getLessonGenerationJobStatus } from '../src/lib/queue/queues';

// Test user ID - change this to a valid user ID in your database
const TEST_USER_ID = 1;

async function main() {
  console.log('Testing Lesson Generation Fix\n');
  console.log('This will create a course about "Heaps and Heapsort" to test the fix.');
  console.log('The bug was: lessons created with 0 sections.\n');

  // Enqueue the test job
  const jobId = await enqueueLessonGeneration({
    userId: TEST_USER_ID,
    topic: 'Heaps and Heapsort',
    difficulty: 'standard',
    triggerSource: 'manual',
    estimatedDurationMinutes: 15,
  });

  console.log(`Job enqueued: ${jobId}\n`);
  console.log('Polling for status...\n');

  // Poll for job completion
  let lastState = '';
  let pollCount = 0;
  const maxPolls = 120; // 2 minutes max

  while (pollCount < maxPolls) {
    const status = await getLessonGenerationJobStatus(jobId!);

    if (!status) {
      console.log('Job not found');
      break;
    }

    // Only log state changes
    if (status.state !== lastState) {
      console.log(`State: ${status.state}`);
      lastState = status.state;
    }

    // Log progress updates
    if (status.progress && typeof status.progress === 'object') {
      const prog = status.progress as { percentage?: number; message?: string };
      if (prog.percentage !== undefined) {
        process.stdout.write(`\r   Progress: ${prog.percentage}% - ${prog.message || ''}`);
      }
    }

    // Check completion
    if (status.state === 'completed') {
      console.log('\n\nJob completed successfully!\n');
      console.log('Result:', JSON.stringify(status.result, null, 2));

      // Check if any lessons were created with sections
      if (status.result?.sectionCount && status.result.sectionCount > 0) {
        console.log(`\nSUCCESS: Created ${status.result.sectionCount} sections total`);
        console.log(`   Course ID: ${status.result.lessonId}`);
        console.log(`   Course Slug: ${status.result.lessonSlug}`);
      } else {
        console.log('\nFAILURE: No sections created (bug not fixed?)');
      }
      break;
    }

    if (status.state === 'failed') {
      console.log('\n\nJob failed!');
      console.log('Error:', status.error);
      break;
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
