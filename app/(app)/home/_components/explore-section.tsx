import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading, Muted } from "@/components/ui/typography";
import { Grid } from "@/components/ui/spacing";

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
        <Heading level={5} className="mb-3">Explore</Heading>
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
      <Heading level={5} className="mb-3">Explore</Heading>
      <Grid cols={3} gap="tight">
        {lessons.map((lesson) => {
          const duration = formatDuration(lesson.estimatedDurationSec);
          const difficulty = getDifficultyLabel(lesson.difficulty);
          const meta = [duration, difficulty].filter(Boolean).join(" · ");

          return (
            <Card key={lesson.id}>
              <div className="p-4">
                <div className="h-28 w-full rounded-[16px] bg-muted mb-3" />
                <Heading level={6} as="div">{lesson.title}</Heading>
                <Muted variant="tiny" as="div">
                  {meta || lesson.description?.slice(0, 50) || "Start learning"}
                </Muted>
                <Link
                  href={`/learn/lesson/${lesson.slug}`}
                  className="mt-3 inline-flex items-center gap-2 rounded-[12px] border border-border px-3 py-2 text-sm hover:bg-accent transition"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Card>
          );
        })}
      </Grid>
    </section>
  );
}