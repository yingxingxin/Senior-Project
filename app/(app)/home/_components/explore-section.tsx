import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading, Muted } from "@/components/ui/typography";
import { Grid } from "@/components/ui/spacing";
import { formatDuration } from "../../courses/_lib/utils";

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
  // Get difficulty label with proper casing
  const getDifficultyLabel = (difficulty: string | null) => {
    if (!difficulty) return "";
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  // If no lessons, show a default message
  if (!lessons || lessons.length === 0) {
    return (
      <section>
        <Heading level={5} className="mb-3 pc98-font" style={{color: 'var(--pc98-fg)'}}>Explore</Heading>
        <div className="pc98-card pc98-glow">
          <div className="p-8 text-center pc98-font" style={{color: 'var(--pc98-fg)'}}>
            <p>No lessons available yet. Check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <Heading level={5} className="mb-3 pc98-font" style={{color: 'var(--pc98-fg)'}}>Explore</Heading>
      <Grid cols={3} gap="tight">
        {lessons.map((lesson) => {
          const duration = formatDuration(lesson.estimatedDurationSec);
          const difficulty = getDifficultyLabel(lesson.difficulty);
          const meta = [duration, difficulty].filter(Boolean).join(" · ");

          return (
            <div key={lesson.id} className="pc98-card pc98-glow">
              <div className="p-4">
                <div className="h-28 w-full pc98-border mb-3" style={{background: 'var(--pc98-bg)'}} />
                <Heading level={6} as="div" className="pc98-font" style={{color: 'var(--pc98-fg)'}}>{lesson.title}</Heading>
                <Muted variant="tiny" as="div" className="pc98-font" style={{color: 'var(--pc98-fg)'}}>
                  {meta || lesson.description?.slice(0, 50) || "Start learning"}
                </Muted>
                <Link
                  href={`/learn/lesson/${lesson.slug}`}
                  className="mt-3 pc98-button inline-flex items-center gap-2 px-3 py-2 text-sm pc98-font"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </Grid>
    </section>
  );
}
