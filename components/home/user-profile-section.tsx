import { Trophy, Flame, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

interface UserProfileSectionProps {
  userName: string;
  email?: string;
  level: number;
  points: number;
  streakDays: number;
  earnedBadgesCount: number;
  assistantName?: string;
  levelProgress: {
    level: number;
    percent: number;
    pointsToNext: number;
  };
}

export function UserProfileSection({
  userName,
  email,
  level,
  points,
  streakDays,
  earnedBadgesCount,
  assistantName,
  levelProgress
}: UserProfileSectionProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary grid place-items-center text-primary-foreground shadow-lg">
              <span className="text-2xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{userName}</h1>
              {assistantName && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Learning with {assistantName}
                </p>
              )}
              {email && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{email}</p>
              )}
            </div>
          </div>

          {/* Level Progress */}
          <div className="flex-1 max-w-md min-w-[250px]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="font-semibold">Level {level}</span>
              </div>
              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                {points.toLocaleString()} points
              </span>
            </div>
            <div className="h-3 rounded-full bg-zinc-100 dark:bg-zinc-900">
              <div
                className="h-3 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${levelProgress.percent}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>{levelProgress.percent}% to Level {level + 1}</span>
              <span>{levelProgress.pointsToNext.toLocaleString()} pts needed</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-2xl font-bold">{streakDays}</span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Day Streak</span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 mb-1">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-2xl font-bold">{earnedBadgesCount}</span>
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Badges</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}