import { getExploreData } from "../actions";
import { UserProfileSection } from "@/components/home/user-profile-section";
import { AssistantHero } from "@/components/home/assistant-hero";
import { AchievementsSection } from "@/components/home/achievements-section";
import { QuickStatsCard } from "@/components/home/quick-stats-card";
import { RecentActivities } from "@/components/home/recent-activities";
import { ExploreSection } from "@/components/home/explore-section";

export default async function HomePage() {
  const data = await getExploreData();
  const earnedBadgesCount = data.badges.filter(b => b.earned).length;

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-16 space-y-8">
        <UserProfileSection
          userName={data.userName}
          email={data.email}
          skillLevel={data.skillLevel}
          level={data.level}
          points={data.points}
          streakDays={data.streakDays}
          earnedBadgesCount={earnedBadgesCount}
          assistantName={data.assistant.name}
          levelProgress={data.levelProgress}
        />

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <AssistantHero
              persona={data.persona}
              assistant={data.assistant}
              primaryAction={data.primaryAction}
              speech={data.assistantSpeech}
            />
            <RecentActivities activities={data.recent} />
          </div>

          <div className="space-y-6">
            <AchievementsSection badges={data.badges} />
            <QuickStatsCard
              points={data.points}
              nextMilestonePoints={data.nextMilestonePoints}
              earnedBadgesCount={earnedBadgesCount}
              totalBadgesCount={data.badges.length}
            />
          </div>
        </div>

        <ExploreSection lessons={data.lessons} />
      </main>
    </div>
  );
}