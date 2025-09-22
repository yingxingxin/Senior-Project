import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

import { auth } from '@/src/lib/auth';
import { db, users } from '@/src/db';
import { assistantPersonaEnum } from '@/src/db/schema';

import {
  getOnboardingStepHref,
  type OnboardingStep,
  ONBOARDING_STEPS,
} from './steps';

const LOGIN_REDIRECT = '/login?next=/onboarding';

// TODO: export these types from the schema
export type AssistantPersona = (typeof assistantPersonaEnum.enumValues)[number];
export interface ActiveOnboardingUser {
  userId: number;
  username: string;
  assistantId: number | null;
  assistantPersona: AssistantPersona | null;
  onboardingCompletedAt: Date | null;
  onboardingStep: OnboardingStep | null;
}

export async function requireActiveOnboardingUser(): Promise<ActiveOnboardingUser> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect(LOGIN_REDIRECT);
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
    redirect(LOGIN_REDIRECT);
  }

  if (record.onboardingCompletedAt) {
    redirect('/');
  }

  return {
    userId: record.userId,
    username: record.username,
    assistantId: record.assistantId,
    assistantPersona: record.assistantPersona as AssistantPersona | null,
    onboardingCompletedAt: record.onboardingCompletedAt,
    onboardingStep: record.onboardingStep as OnboardingStep | null,
  };
}

export function resolveOnboardingStep(user: ActiveOnboardingUser): OnboardingStep {
  if (user.onboardingStep) {
    return user.onboardingStep;
  }

  // New users start at welcome
  if (!user.onboardingStep && !user.assistantId) {
    return 'welcome';
  }

  if (!user.assistantId) {
    return 'gender';
  }

  if (!user.assistantPersona) {
    return 'persona';
  }

  return 'guided_intro';
}

export function getOnboardingRedirectTarget(user: ActiveOnboardingUser): string {
  return getOnboardingStepHref(resolveOnboardingStep(user));
}

export function isValidOnboardingStep(step: string): step is OnboardingStep {
  return ONBOARDING_STEPS.some((definition) => definition.id === step);
}
