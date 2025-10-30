import { Card } from "@/components/ui/card";
import { ActivityCard } from "./activity-card";
import { Heading } from "@/components/ui/typography";
import { Stack } from "@/components/ui/spacing";

export type Activity = {
  id: string;
  kind: "lesson" | "quiz" | "practice";
  title: string;
  progressPct?: number;
  scorePct?: number;
  timestamp: string;
  actionHref: string;
};

interface RecentActivitiesProps {
  activities: Activity[];
}

export function RecentActivities({ activities }: RecentActivitiesProps) {
  return (
    <div className="pc98-card pc98-glow">
      <div className="p-6">
        <Heading level={5} className="mb-4 pc98-font" style={{color: 'var(--pc98-fg)'}}>Recent Activities</Heading>
        <Stack gap="tight">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </Stack>
      </div>
    </div>
  );
}