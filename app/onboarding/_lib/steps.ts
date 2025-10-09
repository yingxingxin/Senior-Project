/**
 * app/onboarding/_lib/steps.ts
 *
 * Defines the steps of the onboarding process and their corresponding titles.
 */
import type { OnboardingStep, AssistantPersona } from '@/src/db/schema';

export interface OnboardingStepDefinition {
  id: OnboardingStep;
  title: string;
}

/**
 * Simplified step definitions - step IDs are used directly in URLs.
 * Welcome is handled separately; main flow starts at gender.
 */
export const ONBOARDING_STEPS: ReadonlyArray<OnboardingStepDefinition> = [
  { id: 'gender', title: 'Choose Your Assistant' },
  { id: 'skill_quiz', title: 'Skill Assessment' },
  { id: 'persona', title: 'Choose Personality' },
  { id: 'guided_intro', title: 'Guided Tour' },
];

/**
 * Given a step string, return true if it is a valid onboarding step
 */
export function isValidStep(step: string): step is OnboardingStep {
  return ONBOARDING_STEPS.some((s) => s.id === step);
}

/**
 * Given a step, return the href for the onboarding step
 */
export function getOnboardingStepHref(step: OnboardingStep): string {
  return `/onboarding/${step}`;
}

/**
 * Given a step, return the index of the onboarding step
 */
export function getStepIndex(step: OnboardingStep): number {
  const index = ONBOARDING_STEPS.findIndex((s) => s.id === step);
  return index < 0 ? 0 : index;
}

/**
 * Type for tracking onboarding progress
 */
export type OnboardingProgress = {
  currentStep: OnboardingStep;
  assistantId: number | null;
  assistantPersona: AssistantPersona | null;
};

/**
 * Check if user is brand new (hasn't started onboarding)
 */
export function isNewUser(progress: OnboardingProgress): boolean {
  return progress.currentStep === 'gender' && !progress.assistantId;
}

/**
 * Calculate completion percentage for current step
 */
export function calculateProgress(currentStep: OnboardingStep): number {
  const index = getStepIndex(currentStep);
  return Math.round(((index + 1) / ONBOARDING_STEPS.length) * 100);
}

/**
 * Get the title of a step
 */
export function getStepTitle(step: OnboardingStep): string | null {
  return ONBOARDING_STEPS.find(s => s.id === step)?.title ?? null;
}

/**
 * Determine which step user should resume to based on their progress
 */
export function getResumeStep(progress: OnboardingProgress): OnboardingStep {
  if (!progress.assistantId) return 'gender';
  if (!progress.assistantPersona) return 'persona';
  return 'guided_intro';
}
