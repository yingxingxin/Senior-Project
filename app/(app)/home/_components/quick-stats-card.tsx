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
    <Card>
      <div className="p-6">
        <Heading level={5} className="mb-4">Next Milestone</Heading>
        <Stack gap="tight">
          <div>
            <Inline gap="default" align="center" justify="between" className="mb-2">
              <Muted variant="small" as="span">Points Progress</Muted>
              <span className="text-sm font-semibold">
                {points.toLocaleString()} / {nextMilestonePoints.toLocaleString()}
              </span>
            </Inline>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Grid cols={2} gap="tight" className="pt-2">
            <div className="text-center p-3 rounded-xl bg-muted">
              <Trophy className="h-5 w-5 mx-auto mb-1 text-primary" />
              <div className="text-lg font-bold">{earnedBadgesCount}</div>
              <Muted variant="tiny" as="div">Earned</Muted>
            </div>
            <div className="text-center p-3 rounded-xl bg-muted">
              <Star className="h-5 w-5 mx-auto mb-1 text-warning" />
              <div className="text-lg font-bold">{totalBadgesCount}</div>
              <Muted variant="tiny" as="div">Total</Muted>
            </div>
          </Grid>
        </Stack>
      </div>
    </Card>
  );
}