'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { Body, Muted } from '@/components/ui/typography';
import { Progress } from '@/components/ui/progress';

interface GeneratingLessonsIndicatorProps {
  currentLessons: number;
  expectedLessons: number;
  courseSlug: string;
}

/**
 * Client component that polls for new lessons and refreshes the page
 * when more content becomes available
 */
export function GeneratingLessonsIndicator({
  currentLessons,
  expectedLessons,
}: GeneratingLessonsIndicatorProps) {
  const router = useRouter();
  const [lastKnownLessons, setLastKnownLessons] = useState(currentLessons);

  // Poll for new lessons every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh the page to get updated lesson count
      // The server component will re-fetch and show new content
      router.refresh();
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  // If lesson count increased, update our local state
  useEffect(() => {
    if (currentLessons > lastKnownLessons) {
      setLastKnownLessons(currentLessons);
    }
  }, [currentLessons, lastKnownLessons]);

  const progressPercentage = Math.round((currentLessons / expectedLessons) * 100);
  const remainingLessons = expectedLessons - currentLessons;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <Body className="font-medium text-foreground">
            AI is generating more content...
          </Body>
          <Muted variant="small" className="mt-1">
            {remainingLessons} more lesson{remainingLessons !== 1 ? 's' : ''} being created.
            You can start learning while we finish generating the rest!
          </Muted>

          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3 w-3 animate-spin" />
                Generating lessons
              </span>
              <span>{currentLessons} of {expectedLessons}</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
