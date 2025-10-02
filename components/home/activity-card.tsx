import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Swords } from "lucide-react";
import type { Activity } from "./recent-activities";
import { Heading } from "@/components/ui/typography";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const isLesson = activity.kind === "lesson";
  const isQuiz = activity.kind === "quiz";

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-accent transition">
      <div className="shrink-0">
        <div className="h-12 w-12 rounded-xl bg-muted grid place-items-center">
          {isLesson ? (
            <BookOpen className="h-6 w-6 text-primary" />
          ) : isQuiz ? (
            <Sparkles className="h-6 w-6 text-primary" />
          ) : (
            <Swords className="h-6 w-6 text-primary" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Heading level={6} as="div" className="truncate">{activity.title}</Heading>
            <div className="text-sm text-muted-foreground">
              {activity.timestamp}
            </div>
          </div>
          <div className="shrink-0">
            {isLesson && activity.progressPct !== undefined ? (
              <span className="text-sm font-semibold text-primary">
                {activity.progressPct}%
              </span>
            ) : isQuiz && activity.scorePct !== undefined ? (
              <span className="text-sm font-semibold text-primary">
                {activity.scorePct}%
              </span>
            ) : null}
          </div>
        </div>

        {isLesson && activity.progressPct !== undefined && (
          <div className="mt-2">
            <div className="h-1.5 rounded-full bg-muted">
              <div
                className="h-1.5 rounded-full bg-primary"
                style={{ width: `${Math.max(0, Math.min(100, activity.progressPct))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <Link
        href={activity.actionHref}
        className="shrink-0 inline-flex items-center gap-1 rounded-[10px] border border-border px-3 py-1.5 text-sm hover:bg-muted transition"
      >
        {isQuiz ? "Review" : "Resume"}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}