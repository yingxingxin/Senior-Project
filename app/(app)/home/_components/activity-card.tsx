import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Swords } from "lucide-react";
import type { Activity } from "./recent-activities";
import { Heading } from "@/components/ui/typography";
import { Inline } from "@/components/ui/spacing";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const isLesson = activity.kind === "lesson";
  const isQuiz = activity.kind === "quiz";

  return (
    <Inline gap="default" align="center" className="p-4 pc98-border pc98-font transition" style={{background: 'var(--pc98-card-bg)', color: 'var(--pc98-fg)'}}>
      <div className="shrink-0">
        <div className="h-12 w-12 pc98-border grid place-items-center" style={{background: 'var(--pc98-bg)'}}>
          {isLesson ? (
            <BookOpen className="h-6 w-6" style={{color: 'var(--pc98-accent)'}} />
          ) : isQuiz ? (
            <Sparkles className="h-6 w-6" style={{color: 'var(--pc98-accent)'}} />
          ) : (
            <Swords className="h-6 w-6" style={{color: 'var(--pc98-accent)'}} />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Heading level={6} as="div" className="truncate pc98-font" style={{color: 'var(--pc98-fg)'}}>{activity.title}</Heading>
            <div className="text-sm pc98-font" style={{color: 'var(--pc98-fg)'}}>
              {activity.timestamp}
            </div>
          </div>
          <div className="shrink-0">
            {isLesson && activity.progressPct !== undefined ? (
              <span className="text-sm font-semibold pc98-font" style={{color: 'var(--pc98-accent)'}}>
                {activity.progressPct}%
              </span>
            ) : isQuiz && activity.scorePct !== undefined ? (
              <span className="text-sm font-semibold pc98-font" style={{color: 'var(--pc98-accent)'}}>
                {activity.scorePct}%
              </span>
            ) : null}
          </div>
        </div>

        {isLesson && activity.progressPct !== undefined && (
          <div className="mt-2">
            <div className="pc98-progress">
              <div
                className="pc98-progress-fill"
                style={{ width: `${Math.max(0, Math.min(100, activity.progressPct))}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <Link
        href={activity.actionHref}
        className="pc98-button shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-sm pc98-font"
      >
        {isQuiz ? "Review" : "Resume"}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Inline>
  );
}