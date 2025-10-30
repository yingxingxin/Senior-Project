import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AchievementTile } from "./achievement-tile";
import { Heading } from "@/components/ui/typography";
import { Grid, Inline } from "@/components/ui/spacing";

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
    <div className="pc98-card pc98-glow">
      <div className="p-6">
        <Inline gap="default" align="center" justify="between" className="mb-4">
          <Heading level={5} className="pc98-font" style={{color: 'var(--pc98-fg)'}}>Achievements</Heading>
          <Link
            href="/achievements"
            className="text-sm pc98-font hover:underline"
            style={{color: 'var(--pc98-accent)'}}
          >
            View all →
          </Link>
        </Inline>
        <Grid cols={2} gap="tight">
          {badges.slice(0, 6).map((badge) => (
            <AchievementTile key={badge.id} badge={badge} compact />
          ))}
        </Grid>
      </div>
    </div>
  );
}