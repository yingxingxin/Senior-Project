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
        "relative overflow-hidden pc98-border transition text-center pc98-font",
        compact ? "p-3" : "p-4",
        earned
          ? "pc98-glow"
          : ""
      )}
      style={{
        background: earned ? 'var(--pc98-card-bg)' : 'var(--pc98-bg)',
        color: 'var(--pc98-fg)'
      }}
      title={earned ? "Unlocked" : badge.hint ?? "Keep going"}
    >
      {/* Icon circle centered */}
      <div
        className={cn(
          "mx-auto mb-2 pc98-border grid place-items-center",
          compact ? "h-10 w-10" : "h-14 w-14"
        )}
        style={{
          background: earned ? 'var(--pc98-accent)' : 'var(--pc98-card-bg)',
          color: earned ? 'var(--pc98-bg)' : 'var(--pc98-fg)'
        }}
      >
        <BadgeIcon
          name={badge.icon}
          className={cn(
            compact ? "h-5 w-5" : "h-6 w-6"
          )}
        />
      </div>

      <div className={cn("font-semibold pc98-font", compact ? "text-sm" : "")} style={{color: 'var(--pc98-fg)'}}>{badge.name}</div>
      {!compact && (
        <div
          className="mt-0.5 text-xs pc98-font"
          style={{color: earned ? 'var(--pc98-accent)' : 'var(--pc98-fg)'}}
        >
          {earned ? "Unlocked" : badge.hint ?? "Locked"}
        </div>
      )}

      {earned && (
        <span className={cn(
          "absolute right-1 top-1 inline-flex items-center gap-0.5 pc98-border px-1.5 py-0.5 font-semibold pc98-font",
          compact ? "text-[9px]" : "text-[10px]"
        )}
        style={{
          background: 'var(--pc98-accent)',
          color: 'var(--pc98-bg)'
        }}>
          <CheckCircle className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
          {!compact && "NEW"}
        </span>
      )}
    </div>
  );
}