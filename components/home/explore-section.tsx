import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

type Lesson = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  difficulty: "easy" | "standard" | "hard" | null;
  estimatedDurationSec: number | null;
};

interface ExploreSectionProps {
  lessons: Lesson[];
}

export function ExploreSection({ lessons }: ExploreSectionProps) {
  // Format duration from seconds to human-readable format
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Get difficulty label with proper casing
  const getDifficultyLabel = (difficulty: string | null) => {
    if (!difficulty) return "";
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  // If no lessons, show a default message
  if (!lessons || lessons.length === 0) {
    return (
      <section>
        <h2 className="mb-3 text-lg font-semibold">Explore</h2>
        <Card>
          <div className="p-8 text-center text-muted-foreground">
            <p>No lessons available yet. Check back soon!</p>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">Explore</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lessons.map((lesson) => {
          const duration = formatDuration(lesson.estimatedDurationSec);
          const difficulty = getDifficultyLabel(lesson.difficulty);
          const meta = [duration, difficulty].filter(Boolean).join(" · ");

          return (
            <Card key={lesson.id}>
              <div className="p-4">
                <div className="h-28 w-full rounded-[16px] bg-muted mb-3" />
                <div className="text-sm font-semibold">{lesson.title}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {meta || lesson.description?.slice(0, 50) || "Start learning"}
                </div>
                <Link
                  href={`/learn/lesson/${lesson.slug}`}
                  className="mt-3 inline-flex items-center gap-2 rounded-[12px] border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}