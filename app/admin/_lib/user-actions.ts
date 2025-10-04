"use server";

import { db, users } from "@/src/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/app/admin/_lib/admin-guard";
import { revalidatePath } from "next/cache";

type UserInsert = typeof users.$inferInsert;

/**
 * Reset user's onboarding to the welcome step
 * Replaces: node scripts/dev_onboarding.js reset <email>
 */
export async function resetUserOnboarding(userId: number) {
  await requireAdmin();

  // TODO: Add audit logging when implemented
  // await logAdminAction("user.onboarding.reset", "users", userId.toString());

  await db
    .update(users)
    .set({
      onboarding_completed_at: null,
      onboarding_step: "welcome",
      skill_level: null,
      assistant_id: null,
      assistant_persona: null,
    })
    .where(eq(users.id, userId));

  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

/**
 * Set user's onboarding to a specific step
 * Replaces: node scripts/dev_onboarding.js goto <email> <step>
 */
export async function setUserOnboardingStep(
  userId: number,
  step: "welcome" | "gender" | "skill_quiz" | "persona" | "guided_intro"
) {
  await requireAdmin();

  // TODO: Add audit logging when implemented
  // await logAdminAction("user.onboarding.set_step", "users", userId.toString(), { step });

  const updates: Partial<UserInsert> = {
    onboarding_step: step,
    onboarding_completed_at: null,
  };

  // Set up prerequisites based on step
  if (step === "gender" || step === "skill_quiz" || step === "persona" || step === "guided_intro") {
    // Need assistant selected for these steps
    updates.assistant_id = 1; // Default to first assistant
  }

  if (step === "persona" || step === "guided_intro") {
    // Need skill level for these steps
    updates.skill_level = "intermediate"; // Default skill level
  }

  if (step === "guided_intro") {
    // Need persona for this step
    updates.assistant_persona = "kind"; // Default persona
  }

  await db.update(users).set(updates).where(eq(users.id, userId));

  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

/**
 * Mark user's onboarding as complete
 * Replaces: node scripts/dev_onboarding.js complete <email>
 */
export async function completeUserOnboarding(userId: number) {
  await requireAdmin();

  // TODO: Add audit logging when implemented
  // await logAdminAction("user.onboarding.complete", "users", userId.toString());

  await db
    .update(users)
    .set({
      onboarding_completed_at: new Date(),
      onboarding_step: null,
    })
    .where(eq(users.id, userId));

  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}

/**
 * Update user's role (admin/user)
 */
export async function updateUserRole(userId: number, role: "user" | "admin") {
  await requireAdmin();

  // TODO: Add audit logging when implemented
  // await logAdminAction("user.role.update", "users", userId.toString(), { role });

  await db.update(users).set({ role }).where(eq(users.id, userId));

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { success: true };
}
