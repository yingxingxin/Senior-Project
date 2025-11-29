import { NextResponse } from "next/server";
import { requireAdmin } from "@/app/admin/_lib/admin-guard";
import { lessonGenerationQueue, getLessonGenerationQueueMetrics } from "@/src/lib/queue/queues";

export const dynamic = "force-dynamic";

interface JobSummary {
  id: string | undefined;
  name: string;
  state: string;
  progress: number | object | string | boolean;
  timestamp: number | undefined;
  processedOn: number | undefined;
  finishedOn: number | undefined;
  attemptsMade: number;
  failedReason?: string;
  data: {
    userId?: number;
    topic?: string;
    triggerSource?: string;
  };
}

/**
 * Queue Stats API
 *
 * Returns detailed queue metrics for admin dashboard.
 */
export async function GET() {
  // Verify admin access
  await requireAdmin();

  try {
    // Get basic metrics
    const metrics = await getLessonGenerationQueueMetrics();

    // Get recent jobs for each state
    const [activeJobs, completedJobs, failedJobs, waitingJobs] = await Promise.all([
      lessonGenerationQueue.getActive(0, 10),
      lessonGenerationQueue.getCompleted(0, 10),
      lessonGenerationQueue.getFailed(0, 5),
      lessonGenerationQueue.getWaiting(0, 10),
    ]);

    // Format job data for response
    const formatJob = async (job: Awaited<ReturnType<typeof lessonGenerationQueue.getJob>>): Promise<JobSummary | null> => {
      if (!job) return null;
      const state = await job.getState();
      return {
        id: job.id,
        name: job.name,
        state,
        progress: job.progress,
        timestamp: job.timestamp,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        attemptsMade: job.attemptsMade,
        failedReason: job.failedReason,
        data: {
          userId: job.data.userId,
          topic: job.data.topic,
          triggerSource: job.data.triggerSource,
        },
      };
    };

    // Calculate success rate
    const totalProcessed = metrics.counts.completed + metrics.counts.failed;
    const successRate = totalProcessed > 0
      ? Math.round((metrics.counts.completed / totalProcessed) * 100)
      : 100;

    // Calculate average processing time from completed jobs
    let avgProcessingTime = 0;
    const completedWithTimes = completedJobs.filter(j => j.processedOn && j.finishedOn);
    if (completedWithTimes.length > 0) {
      const totalTime = completedWithTimes.reduce((sum, job) => {
        return sum + ((job.finishedOn || 0) - (job.processedOn || 0));
      }, 0);
      avgProcessingTime = Math.round(totalTime / completedWithTimes.length);
    }

    // Format all jobs
    const [formattedActive, formattedCompleted, formattedFailed, formattedWaiting] = await Promise.all([
      Promise.all(activeJobs.map(formatJob)),
      Promise.all(completedJobs.map(formatJob)),
      Promise.all(failedJobs.map(formatJob)),
      Promise.all(waitingJobs.map(formatJob)),
    ]);

    return NextResponse.json({
      queue: metrics.queue,
      counts: metrics.counts,
      successRate,
      avgProcessingTimeMs: avgProcessingTime,
      activeJobs: formattedActive.filter(Boolean),
      completedJobs: formattedCompleted.filter(Boolean),
      failedJobs: formattedFailed.filter(Boolean),
      waitingJobs: formattedWaiting.filter(Boolean),
    });
  } catch (error) {
    console.error("Queue stats error:", error);

    // Return empty stats if Redis is not available
    return NextResponse.json({
      queue: "lesson-generation",
      counts: {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        total: 0,
      },
      successRate: 100,
      avgProcessingTimeMs: 0,
      activeJobs: [],
      completedJobs: [],
      failedJobs: [],
      waitingJobs: [],
      error: "Unable to connect to queue. Redis may not be running.",
    });
  }
}
