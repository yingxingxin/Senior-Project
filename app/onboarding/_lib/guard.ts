/**
 * app/onboarding/_lib/guard.ts
 *
 * Guards the onboarding process and ensures users can only access steps they have completed.
 */
import { asc, eq } from 'drizzle-orm';
import { assistants, db, users } from '@/src/db';
import type { SkillLevel, AssistantPersona, AssistantGender, OnboardingStep } from '@/src/db/schema';
import { getStepIndex } from './steps';


/**
 * Subset of user data needed for onboarding guard functions.
 * Uses camelCase naming to match application conventions.
 */
export type OnboardingUserGuard = {
  id: number;
  name: string;
  assistantId: number | null;
  assistantPersona: AssistantPersona | null;
  skillLevel: SkillLevel;
  completedAt: Date | null;
  currentStep: OnboardingStep | null;
};

/**
 * Pure guard functions - no redirects, just data + logic.
 * Redirects are handled by layout.tsx.
 */
function prereqsMet(u: OnboardingUserGuard, target: OnboardingStep): boolean {
  // Gender (assistant selection) has no prerequisites
  if (target === 'gender') return true;

  // Skill quiz requires assistant selection
  if (target === 'skill_quiz') return u.assistantId !== null;

  // Persona requires assistant (skill quiz optional in current flow)
  if (target === 'persona') return u.assistantId !== null;

  // Guided intro requires assistant and persona
  if (target === 'guided_intro') return u.assistantId !== null && u.assistantPersona !== null;

  return true;
}

export interface AssistantOption {
  id: number;
  name: string;
  slug: string;
  gender: AssistantGender | null;
  avatarUrl: string | null;
  tagline: string | null;
  description: string | null;
}

export async function getAssistantOptions(): Promise<AssistantOption[]> {
  const rows = await db
    .select({
      id: assistants.id,
      name: assistants.name,
      slug: assistants.slug,
      gender: assistants.gender,
      avatarUrl: assistants.avatar_url,
      tagline: assistants.tagline,
      description: assistants.description,
    })
    .from(assistants)
    .orderBy(asc(assistants.name));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    gender: row.gender,
    avatarUrl: row.avatarUrl,
    tagline: row.tagline,
    description: row.description,
  }));
} 

export async function loadActiveUser(sessionUserId: number): Promise<OnboardingUserGuard> {
  const [r] = await db
    .select({
      id: users.id,
      name: users.name,
      assistant_id: users.assistant_id,
      assistant_persona: users.assistant_persona,
      skill_level: users.skill_level,
      onboarding_completed_at: users.onboarding_completed_at,
      onboarding_step: users.onboarding_step,
    })
    .from(users)
    .where(eq(users.id, sessionUserId))
    .limit(1);

  if (!r) throw new Error('User not found');

  return {
    id: r.id,
    name: r.name,
    assistantId: r.assistant_id,
    assistantPersona: r.assistant_persona as AssistantPersona | null,
    skillLevel: r.skill_level as SkillLevel,
    currentStep: r.onboarding_step as OnboardingStep | null,
    completedAt: r.onboarding_completed_at,
  };
}

export function getNextAllowedStep(u: OnboardingUserGuard): OnboardingStep {
  // Determine the furthest step the user can access
  if (!u.assistantId) return 'gender';
  if (!u.assistantPersona) return 'persona';
  return 'guided_intro';
}

export function canAccessStep(u: OnboardingUserGuard, target: OnboardingStep): boolean {
  const currentIdx = u.currentStep ? getStepIndex(u.currentStep) : 0;
  const targetIdx = getStepIndex(target);

  // Can access current step or earlier steps
  if (targetIdx <= currentIdx) return true;

  // Can access next step if prerequisites are met
  if (targetIdx === currentIdx + 1 && prereqsMet(u, target)) return true;

  return false;
}