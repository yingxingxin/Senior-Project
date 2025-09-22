'use server';

import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';

import { auth } from '@/src/lib/auth';
import { headers } from 'next/headers';
import { db, assistants, users } from '@/src/db';
import type { ActiveOnboardingUser, AssistantPersona } from '@/src/lib/onboarding/server';
import { getOnboardingStepHref, OnboardingStep, ONBOARDING_STEPS } from '@/src/lib/onboarding/steps';

async function loadActiveOnboardingUser(): Promise<ActiveOnboardingUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    throw new Error('Not authenticated');
  }

  const sessionUserId = Number(session.user.id);

  const [record] = await db
    .select({
      userId: users.id,
      username: users.name,
      assistantId: users.assistantId,
      assistantPersona: users.assistantPersona,
      onboardingCompletedAt: users.onboardingCompletedAt,
      onboardingStep: users.onboardingStep,
    })
    .from(users)
    .where(eq(users.id, sessionUserId))
    .limit(1);

  if (!record) {
    throw new Error('User not found');
  }

  if (record.onboardingCompletedAt) {
    throw new Error('Onboarding already completed');
  }

  return {
    userId: record.userId,
    username: record.username,
    assistantId: record.assistantId,
    assistantPersona: record.assistantPersona,
    onboardingCompletedAt: record.onboardingCompletedAt,
    onboardingStep: record.onboardingStep,
  };
}
  
export async function selectAssistantGenderAction(assistantId: number) {
  const user = await loadActiveOnboardingUser();

  const [assistant] = await db
    .select({ assistantId: assistants.id })
    .from(assistants)
    .where(eq(assistants.id, assistantId))
    .limit(1);

  if (!assistant) {
    throw new Error('Assistant option not found');
  }

  await db
    .update(users)
    .set({
      assistantId,
      onboardingStep: 'persona',
      onboardingCompletedAt: null,
    })
    .where(eq(users.id, user.userId));

  // TODO: emit analytics event `assistant_gender_selected`.

  revalidatePath('/onboarding');

  return {
    nextStep: 'persona' as const,
    nextHref: getOnboardingStepHref('persona'),
  };
}

export async function selectAssistantPersonaAction(persona: AssistantPersona) {
  const user = await loadActiveOnboardingUser();

  if (!user.assistantId) {
    throw new Error('Select an assistant before choosing a persona');
  }

  await db
    .update(users)
    .set({
      assistantPersona: persona,
      onboardingStep: 'guided_intro',
    })
    .where(eq(users.id, user.userId));

  // TODO: emit analytics event `assistant_persona_selected`.

  revalidatePath('/onboarding');

  return {
    nextStep: 'guided_intro' as const,
    nextHref: getOnboardingStepHref('guided_intro'),
  };
}

export async function updateOnboardingStepAction(step: OnboardingStep) {
  const user = await loadActiveOnboardingUser();

  await db
    .update(users)
    .set({ onboardingStep: step })
    .where(eq(users.id, user.userId));

  revalidatePath('/onboarding');

  return { ok: true } as const;
}

// Alias for consistency with naming convention
export const persistOnboardingStep = updateOnboardingStepAction;

export async function navigateToOnboardingStep(targetStep: OnboardingStep) {
  const user = await loadActiveOnboardingUser();

  // Find the index of current and target steps
  const currentStepIndex = ONBOARDING_STEPS.findIndex(s => s.id === user.onboardingStep);
  const targetStepIndex = ONBOARDING_STEPS.findIndex(s => s.id === targetStep);

  // Prevent skipping ahead
  if (targetStepIndex > currentStepIndex + 1) {
    throw new Error('Cannot skip ahead in onboarding');
  }

  // Allow navigation to current or previous steps
  if (targetStepIndex <= currentStepIndex) {
    // Don't update the database step, just return the navigation target
    return {
      allowed: true,
      nextHref: getOnboardingStepHref(targetStep),
    };
  }

  // For forward navigation to the immediate next step
  if (targetStepIndex === currentStepIndex + 1) {
    // Check prerequisites
    if (targetStep === 'persona' && !user.assistantId) {
      throw new Error('Please select an assistant first');
    }
    if (targetStep === 'guided_intro' && (!user.assistantId || !user.assistantPersona)) {
      throw new Error('Please complete previous steps first');
    }

    return {
      allowed: true,
      nextHref: getOnboardingStepHref(targetStep),
    };
  }

  throw new Error('Invalid navigation request');
}

export async function completeOnboardingAction() {
  const user = await loadActiveOnboardingUser();

  if (!user.assistantId || !user.assistantPersona) {
    throw new Error('Complete all onboarding steps before finishing');
  }

  await db
    .update(users)
    .set({
      onboardingCompletedAt: new Date(),
      onboardingStep: null,
    })
    .where(eq(users.id, user.userId));

  // TODO: emit analytics event `onboarding_completed` with duration metadata.

  revalidatePath('/onboarding');
  revalidatePath('/explore');

  return { completed: true, redirectTo: '/explore' } as const;
}
