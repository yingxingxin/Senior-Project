import { Card } from "@/components/ui/card";
import { ActivityCard } from "./activity-card";

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
        <h2 className="mb-4 text-lg font-semibold">Recent Activities</h2>
        <div className="space-y-3">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </Card>
  );
}