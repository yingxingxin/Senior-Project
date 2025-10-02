import { Card } from "@/components/ui/card";
import { ActivityCard } from "./activity-card";
import { Heading } from "@/components/ui/typography";

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
    <Card>
      <div className="p-6">
        <Heading level={5} className="mb-4">Recent Activities</Heading>
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </Card>
  );
}