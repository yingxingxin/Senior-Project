import { Trophy, Flame, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading, Muted } from "@/components/ui/typography";
import { Inline } from "@/components/ui/spacing";

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
    <Card className="overflow-hidden">
      <div className="p-6">
        <Inline gap="default" align="center" justify="between" className="flex-wrap">
          {/* User Info */}
          <Inline gap="default" align="center">
            <div className="h-16 w-16 rounded-2xl bg-primary grid place-items-center text-primary-foreground shadow-lg">
              <span className="text-2xl font-bold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <Heading level={2} as="h1">{userName}</Heading>
              {skillLevel && (
                <Muted variant="small" className="text-primary">
                  {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} Level
                </Muted>
              )}
              {assistantName && (
                <Muted variant="small">
                  Learning with {assistantName}
                </Muted>
              )}
              {email && (
                <Muted variant="tiny">{email}</Muted>
              )}
            </div>
          </Inline>

          {/* Level Progress */}
          <div className="flex-1 max-w-md min-w-[250px]">
            <Inline gap="default" align="center" justify="between" className="mb-2">
              <Inline gap="tight" align="center">
                <Trophy className="h-4 w-4 text-primary" />
                <Heading level={6} as="span">Level {level}</Heading>
              </Inline>
              <Muted variant="small" as="span">
                {points.toLocaleString()} points
              </Muted>
            </Inline>
            <div className="h-3 rounded-full bg-muted">
              <div
                className="h-3 rounded-full bg-primary transition-all duration-500"
                style={{ width: `${levelProgress.percent}%` }}
              />
            </div>
            <Inline gap="default" align="center" justify="between" className="mt-1">
              <Muted variant="tiny" as="span">{levelProgress.percent}% to Level {level + 1}</Muted>
              <Muted variant="tiny" as="span">{levelProgress.pointsToNext.toLocaleString()} pts needed</Muted>
            </Inline>
          </div>

          {/* Quick Stats */}
          <Inline gap="loose" align="center">
            <div className="text-center">
              <Inline gap="tight" align="center" className="mb-1">
                <Flame className="h-4 w-4 text-warning" />
                <Heading level={2} as="span">{streakDays}</Heading>
              </Inline>
              <Muted variant="tiny" as="span">Day Streak</Muted>
            </div>
            <div className="text-center">
              <Inline gap="tight" align="center" className="mb-1">
                <Award className="h-4 w-4 text-primary" />
                <Heading level={2} as="span">{earnedBadgesCount}</Heading>
              </Inline>
              <Muted variant="tiny" as="span">Badges</Muted>
            </div>
          </Inline>
        </Inline>
      </div>
    </Card>
  );
}