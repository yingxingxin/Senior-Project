import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AchievementTile } from "./achievement-tile";

export type Badge = {
  id: string;
  name: string;
  icon: "trophy" | "flame" | "award" | "star";
  earned: boolean;
  hint?: string;
};

interface AchievementsSectionProps {
  badges: Badge[];
}

export function AchievementsSection({ badges }: AchievementsSectionProps) {
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Achievements</h2>
          <Link
            href="/achievements"
            className="text-sm text-primary hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {badges.slice(0, 6).map((badge) => (
            <AchievementTile key={badge.id} badge={badge} compact />
          ))}
        </div>
      </div>
    </Card>
  );
}