import { Trophy, Flame, Star, Award, CheckCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import type { Badge } from "./achievements-section";

interface AchievementTileProps {
  badge: Badge;
  compact?: boolean;
}

function BadgeIcon({ name, className }: { name: Badge["icon"]; className?: string }) {
  switch (name) {
    case "trophy":
      return <Trophy className={className} />;
    case "flame":
      return <Flame className={className} />;
    case "award":
      return <Award className={className} />;
    default:
      return <Star className={className} />;
  }
}

export function AchievementTile({ badge, compact = false }: AchievementTileProps) {
  const earned = badge.earned;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border transition text-center",
        compact ? "p-3" : "p-4",
        earned
          ? "border-border bg-accent"
          : "border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
      )}
      title={earned ? "Unlocked" : badge.hint ?? "Keep going"}
    >
      {/* Icon circle centered */}
      <div
        className={cn(
          "mx-auto mb-2 rounded-full grid place-items-center",
          compact ? "h-10 w-10" : "h-14 w-14",
          earned ? "bg-white dark:bg-zinc-950" : "bg-zinc-100 dark:bg-zinc-900"
        )}
      >
        <BadgeIcon
          name={badge.icon}
          className={cn(
            earned ? "text-primary" : "",
            compact ? "h-5 w-5" : "h-6 w-6"
          )}
        />
      </div>

      <div className={cn("font-semibold", compact ? "text-sm" : "")}>{badge.name}</div>
      {!compact && (
        <div
          className={cn(
            "mt-0.5 text-xs",
            earned ? "text-primary" : "text-muted-foreground"
          )}
        >
          {earned ? "Unlocked" : badge.hint ?? "Locked"}
        </div>
      )}

      {earned && (
        <span className={cn(
          "absolute right-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 font-semibold",
          compact ? "text-[9px]" : "text-[10px]"
        )}>
          <CheckCircle className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          {!compact && "NEW"}
        </span>
      )}
    </div>
  );
}