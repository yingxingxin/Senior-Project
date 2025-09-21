import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';

import { AUTH_COOKIE, verifyAuthToken } from '@/lib/auth';
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
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    redirect(LOGIN_REDIRECT);
  }

  let sessionUserId: number | null = null;

  try {
    const session = await verifyAuthToken(token!);
    sessionUserId = session.userId;
  } catch {
    redirect(LOGIN_REDIRECT);
  }

  const [record] = await db
    .select({
      userId: users.userId,
      username: users.username,
      assistantId: users.assistantId,
      assistantPersona: users.assistantPersona,
      onboardingCompletedAt: users.onboardingCompletedAt,
      onboardingStep: users.onboardingStep,
    })
    .from(users)
    .where(eq(users.userId, sessionUserId!))
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
