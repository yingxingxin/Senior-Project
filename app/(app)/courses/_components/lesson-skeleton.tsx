/**
 * LessonSkeleton Component
 *
 * Loading skeleton that mirrors the lesson page layout structure.
 * Displayed while fetching section completion status.
 *
 * Structure matches lesson-client.tsx actual layout:
 * - Back button
 * - Lesson header card (title + description)
 * - Section content card
 * - Section navigator (prev/next buttons + counter)
 */

import { Card } from "@/components/ui/card";
import { Stack } from "@/components/ui/spacing";
import { Skeleton } from "@/components/ui/skeleton";

export function LessonSkeleton() {
  return (
    <main className="mx-auto max-w-5xl px-4 pt-6 pb-16">
      <Stack gap="loose">
        {/* Back button skeleton */}
        <Skeleton className="h-10 w-32" />

        {/* Lesson header card skeleton */}
        <Card className="bg-card/50 backdrop-blur border-border shadow-lg p-6">
          <Stack gap="default">
            <Skeleton className="h-8 w-3/4" />  {/* Title */}
            <Skeleton className="h-4 w-full" /> {/* Description line 1 */}
            <Skeleton className="h-4 w-2/3" /> {/* Description line 2 */}
          </Stack>
        </Card>

        {/* Section content card skeleton */}
        <Card className="bg-card/50 backdrop-blur border-border p-6">
          <Stack gap="default">
            <Skeleton className="h-7 w-1/2" />  {/* Section title */}
            <div className="space-y-2 mt-4">
              <Skeleton className="h-4 w-full" /> {/* Content line 1 */}
              <Skeleton className="h-4 w-full" /> {/* Content line 2 */}
              <Skeleton className="h-4 w-5/6" /> {/* Content line 3 */}
              <Skeleton className="h-4 w-4/5" /> {/* Content line 4 */}
            </div>
          </Stack>
        </Card>

        {/* Section navigator skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-28" /> {/* Previous button */}
          <Skeleton className="h-4 w-32" />  {/* Section counter */}
          <Skeleton className="h-10 w-28" /> {/* Next button */}
        </div>
      </Stack>
    </main>
  );
}
