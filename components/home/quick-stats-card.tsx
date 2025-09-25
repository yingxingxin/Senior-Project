import { Trophy, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface QuickStatsCardProps {
  points: number;
  nextMilestonePoints: number;
  earnedBadgesCount: number;
  totalBadgesCount: number;
}

export function QuickStatsCard({
  points,
  nextMilestonePoints,
  earnedBadgesCount,
  totalBadgesCount,
}: QuickStatsCardProps) {
  const progress = Math.min(100, (points / nextMilestonePoints) * 100);

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Next Milestone</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Points Progress</span>
              <span className="text-sm font-semibold">
                {points.toLocaleString()} / {nextMilestonePoints.toLocaleString()}
              </span>
            </div>
            <div className="h-2 rounded-full bg-zinc-100 dark:bg-zinc-900">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <Trophy className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-bold">{earnedBadgesCount}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Earned</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900">
              <Star className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
              <div className="text-lg font-bold">{totalBadgesCount}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Total</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}