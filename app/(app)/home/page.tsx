import { getExploreData } from "../actions";
import { UserProfileSection } from "@/app/(app)/home/_components/user-profile-section";
import { AssistantHero } from "@/app/(app)/home/_components/assistant-hero";
import { RecommendedCourseSection } from "@/app/(app)/home/_components/recommended-course-section";
import { Stack, Grid } from "@/components/ui/spacing";

export default async function HomePage() {
  const data = await getExploreData();

  return (
    <div className="min-h-dvh relative text-foreground bg-background">
      <main className="mx-auto max-w-6xl px-4 pt-6 pb-16 relative z-10">
        <Stack gap="loose">
          <div>
            <UserProfileSection
              userName={data.userName}
              email={data.email}
              skillLevel={data.skillLevel}
              level={data.level}
              points={data.points}
              streakDays={data.streakDays}
              earnedBadgesCount={0}
              assistantName={data.assistant.name}
              levelProgress={data.levelProgress}
            />
          </div>

          <Grid gap="default" className="lg:grid-cols-[2fr_1fr]">
            <Stack gap="default">
              <div>
                <AssistantHero
                  persona={data.persona}
                  assistant={data.assistant}
                  primaryAction={data.primaryAction}
                  speech={data.assistantSpeech}
                />
              </div>
            </Stack>

            <Stack gap="default">
              <div>
                <RecommendedCourseSection skillLevel={data.skillLevel} />
              </div>
            </Stack>
          </Grid>
        </Stack>
      </main>
    </div>
  );
}