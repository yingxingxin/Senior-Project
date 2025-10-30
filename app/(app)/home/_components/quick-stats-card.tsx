import { Trophy, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading, Muted } from "@/components/ui/typography";
import { Stack, Grid, Inline } from "@/components/ui/spacing";

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
    <div className="pc98-card pc98-glow">
      <div className="p-6">
        <Heading level={5} className="mb-4 pc98-font" style={{color: 'var(--pc98-fg)'}}>Next Milestone</Heading>
        <Stack gap="tight">
          <div>
            <Inline gap="default" align="center" justify="between" className="mb-2">
              <Muted variant="small" as="span" className="pc98-font" style={{color: 'var(--pc98-fg)'}}>Points Progress</Muted>
              <span className="text-sm font-semibold pc98-font" style={{color: 'var(--pc98-fg)'}}>
                {points.toLocaleString()} / {nextMilestonePoints.toLocaleString()}
              </span>
            </Inline>
            <div className="pc98-progress">
              <div
                className="pc98-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Grid cols={2} gap="tight" className="pt-2">
            <div className="text-center p-3 pc98-border pc98-font" style={{background: 'var(--pc98-card-bg)', color: 'var(--pc98-fg)'}}>
              <Trophy className="h-5 w-5 mx-auto mb-1" style={{color: 'var(--pc98-accent)'}} />
              <div className="text-lg font-bold pc98-font" style={{color: 'var(--pc98-fg)'}}>{earnedBadgesCount}</div>
              <Muted variant="tiny" as="div" className="pc98-font" style={{color: 'var(--pc98-fg)'}}>Earned</Muted>
            </div>
            <div className="text-center p-3 pc98-border pc98-font" style={{background: 'var(--pc98-card-bg)', color: 'var(--pc98-fg)'}}>
              <Star className="h-5 w-5 mx-auto mb-1" style={{color: 'var(--pc98-accent)'}} />
              <div className="text-lg font-bold pc98-font" style={{color: 'var(--pc98-fg)'}}>{totalBadgesCount}</div>
              <Muted variant="tiny" as="div" className="pc98-font" style={{color: 'var(--pc98-fg)'}}>Total</Muted>
            </div>
          </Grid>
        </Stack>
      </div>
    </div>
  );
}