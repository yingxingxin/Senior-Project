import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { db, users } from "@/src/db";
import { eq } from "drizzle-orm";
import Navbar from "@/components/home/navbar";
import { getUserNavbarData } from "./actions";
import { getOnboardingRedirectTarget } from "@/src/lib/onboarding/server";

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
    const redirectTarget = getOnboardingRedirectTarget({
      userId,
      username: session.user.name || "",
      assistantId: userRecord?.assistant_id || null,
      assistantPersona: userRecord?.assistant_persona || null,
      skillLevel: userRecord?.skill_level || null,
      onboardingCompletedAt: null,
      onboardingStep: userRecord?.onboarding_step || null,
    });
    redirect(redirectTarget);
  }

  // Fetch navbar data from database
  const navbarData = await getUserNavbarData();

  return (
    <>
      <Navbar data={navbarData} />
      <main>{children}</main>
    </>
  );
}