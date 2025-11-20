import { Trophy, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading, Muted } from "@/components/ui/typography";
import { Inline, Stack } from "@/components/ui/spacing";

interface UserProfileSectionProps {
  userName: string;
  email?: string;
  skillLevel?: string | null;
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
  skillLevel,
  level,
  points,
  streakDays,
  earnedBadgesCount,
  assistantName,
  levelProgress
}: UserProfileSectionProps) {
  return (
    <Card className="bg-card/50 backdrop-blur border-border shadow-lg">
      <div className="p-6">
        <Inline gap="default" align="center" justify="between" className="flex-wrap">
          {/* User Info */}
          <Inline gap="default" align="center">
            <div className="h-16 w-16 border-2 border-border rounded-xl grid place-items-center bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-primary/30 shadow-lg">
              <span className="text-2xl font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <Stack gap="tight">
              <Heading level={2} as="h1" className="text-foreground">{userName}</Heading>
              {skillLevel && (
                <Muted variant="small" className="text-primary">
                  {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} Level
                </Muted>
              )}
              {assistantName && (
                <Muted variant="small" className="text-muted-foreground">
                  Learning with {assistantName}
                </Muted>
              )}
              {email && (
                <Muted variant="tiny" className="text-muted-foreground">{email}</Muted>
              )}
            </Stack>
          </Inline>

          {/* Level Progress */}
          <div className="flex-1 max-w-md min-w-[250px]">
            <Inline gap="default" align="center" justify="between" className="mb-2">
              <Inline gap="tight" align="center">
                <Trophy className="h-4 w-4 text-primary" />
                <Heading level={6} as="span" className="text-foreground">Level {level}</Heading>
              </Inline>
              <Muted variant="small" as="span" className="text-muted-foreground">
                {points.toLocaleString()} points
              </Muted>
            </Inline>
            <div className="bg-muted/50 border border-border rounded-lg h-2 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-lg shadow-primary/50 shadow-md"
                style={{ width: `${levelProgress.percent}%` }}
              />
            </div>
            <Inline gap="default" align="center" justify="between" className="mt-1">
              <Muted variant="tiny" as="span" className="text-muted-foreground">{levelProgress.percent}% to Level {level + 1}</Muted>
              <Muted variant="tiny" as="span" className="text-muted-foreground">{levelProgress.pointsToNext.toLocaleString()} pts needed</Muted>
            </Inline>
          </div>

          {/* Quick Stats */}
          <Inline gap="loose" align="center">
            <Card className="text-center bg-card/30 backdrop-blur border-border shadow-md p-4">
              <Inline gap="tight" align="center" className="mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <Heading level={2} as="span" className="text-foreground">{streakDays}</Heading>
              </Inline>
              <Muted variant="tiny" as="span" className="text-muted-foreground">Day Streak</Muted>
            </Card>
          </Inline>
        </Inline>
      </div>
    </Card>
  );
}
