/**
 * app/onboarding/_lib/guard.ts
 *
 * Guards the onboarding process and ensures users can only access steps they have completed.
 */
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

export function getNextAllowedStep(u: OnboardingUserGuard): OnboardingStep {
  // Determine the furthest step the user can access
  if (!u.assistantId) return 'gender';
  if (!u.assistantPersona) return 'persona';
  return 'guided_intro';
}

export function canAccessStep(u: OnboardingUserGuard, target: OnboardingStep): boolean {
  // If currentStep is null, derive it from user progress to prevent redirect loops
  const effectiveStep = u.currentStep ?? getNextAllowedStep(u);
  const currentIdx = getStepIndex(effectiveStep);
  const targetIdx = getStepIndex(target);

  // Can access current step or earlier steps
  if (targetIdx <= currentIdx) return true;

  // Can access next step if prerequisites are met
  if (targetIdx === currentIdx + 1 && prereqsMet(u, target)) return true;

  return false;
}