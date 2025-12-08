import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { db, SkillLevel, users } from "@/src/db";
import { eq } from "drizzle-orm";
import Navbar from "@/app/(app)/home/_components/navbar";
import { getUserNavbarData, getUserAssistantData } from "./actions";
import { getNextAllowedStep } from "@/app/onboarding/_lib/guard";
import { getOnboardingStepHref } from "@/app/onboarding/_lib/steps";
import type { OnboardingStep, AssistantPersona } from "@/src/db/schema";
import { MusicProvider } from "@/components/music";
import { MusicPlayer } from "@/components/music";
import { FloatingAIChat } from "@/components/floating-ai-chat";
import { AIContextProvider } from "@/components/ai-context-provider";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  /**
   * Redirect flow for /home and other protected app routes:
   *
   * 1. User visits /home (or any route under app/(app))
   * 2. Check authentication:
   *    - Not authenticated → Redirect to /login
   * 3. Check onboarding status:
   *    - onboarding_completed_at is null → Redirect to /onboarding/{current_step}
   *    - onboarding_completed_at exists → Continue to render page
   * 4. Page renders with real user data from database
   *
   * This ensures users must complete: Signup → Onboarding → Access app
   */
  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number(session.user.id);

  // Check if user has completed onboarding
  const [userRecord] = await db
    .select({
      onboarding_completed_at: users.onboarding_completed_at,
      onboarding_step: users.onboarding_step,
      assistant_id: users.assistant_id,
      assistant_persona: users.assistant_persona,
      skill_level: users.skill_level,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userRecord?.onboarding_completed_at) {
    // User hasn't completed onboarding, redirect to appropriate step
    const nextStep = getNextAllowedStep({
      id: userId,
      name: session.user.name || "",
      assistantId: userRecord?.assistant_id || null,
      assistantPersona: (userRecord?.assistant_persona as AssistantPersona) || null,
      skillLevel: userRecord?.skill_level as SkillLevel,
      currentStep: (userRecord?.onboarding_step as OnboardingStep) || null,
      completedAt: null,
    });
    redirect(getOnboardingStepHref(nextStep));
  }

  // Fetch navbar data from database
  const navbarData = await getUserNavbarData();

  // Fetch assistant data for AI chat
  const assistantData = await getUserAssistantData();

  return (
    <AIContextProvider>
      <MusicProvider>
        <Navbar data={navbarData} />
        <main>{children}</main>
        <MusicPlayer userId={userId} />
        {assistantData && (
          <FloatingAIChat
            assistantAvatarUrl={assistantData.avatarUrl}
            assistantName={assistantData.name}
          />
        )}
      </MusicProvider>
    </AIContextProvider>
  );
}