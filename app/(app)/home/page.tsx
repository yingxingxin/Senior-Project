import { getExploreData } from "../actions";
import { UserProfileSection } from "@/app/(app)/home/_components/user-profile-section";
import { AssistantHero } from "@/app/(app)/home/_components/assistant-hero";
import { AchievementsSection } from "@/app/(app)/home/_components/achievements-section";
import { QuickStatsCard } from "@/app/(app)/home/_components/quick-stats-card";
import { RecentActivities } from "@/app/(app)/home/_components/recent-activities";
import { ExploreSection } from "@/app/(app)/home/_components/explore-section";
import { Stack, Grid } from "@/components/ui/spacing";

export default async function HomePage() {
  const data = await getExploreData();
  const earnedBadgesCount = data.badges.filter(b => b.earned).length;

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-16">
        <Stack gap="loose">
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

          <Grid gap="default" className="lg:grid-cols-[2fr_1fr]">
            <Stack gap="default">
              <AssistantHero
                persona={data.persona}
                assistant={data.assistant}
                primaryAction={data.primaryAction}
                speech={data.assistantSpeech}
              />
              <RecentActivities activities={data.recent} />
            </Stack>

            <Stack gap="default">
              <AchievementsSection badges={data.badges} />
              <QuickStatsCard
                points={data.points}
                nextMilestonePoints={data.nextMilestonePoints}
                earnedBadgesCount={earnedBadgesCount}
                totalBadgesCount={data.badges.length}
              />
            </Stack>
          </Grid>

          <ExploreSection lessons={data.lessons} />
        </Stack>
      </main>
    </div>
  );
}