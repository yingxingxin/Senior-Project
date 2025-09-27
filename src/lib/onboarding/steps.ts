import { onboardingStepEnum } from '@/src/db/schema';

export type OnboardingStep = (typeof onboardingStepEnum.enumValues)[number];

export interface OnboardingStepDefinition {
  id: OnboardingStep;
  title: string;
  description: string;
  segment: string;
}

export const ONBOARDING_STEPS: ReadonlyArray<OnboardingStepDefinition> = [
  {
    id: 'welcome',
    title: 'Welcome to Sprite.exe',
    description: 'Get started with personalizing your study companion.',
    segment: 'welcome',
  },
  {
    id: 'gender',
    title: 'Choose your assistant',
    description: 'Pick the presentation that feels most comfortable.',
    segment: 'gender',
  },
  {
    id: 'skill_quiz',
    title: 'Quick skill check',
    description: 'Answer a few questions so we can start at the right level.',
    segment: 'skill-quiz',
  },
  {
    id: 'persona',
    title: 'Tune their personality',
    description: 'Preview how the assistant speaks and pick your tone.',
    segment: 'persona',
  },
  {
    id: 'guided_intro',
    title: 'Take a quick tour',
    description: 'Get oriented with a guided introduction to the dashboard.',
    segment: 'guided-intro',
  },
] satisfies ReadonlyArray<OnboardingStepDefinition>;

export function getOnboardingStepDefinition(step: OnboardingStep): OnboardingStepDefinition {
  const match = ONBOARDING_STEPS.find((item) => item.id === step);
  if (!match) {
    throw new Error(`Unknown onboarding step: ${step as string}`);
  }
  return match;
}

export function getOnboardingStepHref(step: OnboardingStep): string {
  return `/onboarding/${getOnboardingStepDefinition(step).segment}`;
}

export function getOnboardingStepFromSegment(segment: string | null | undefined): OnboardingStep | null {
  if (!segment) return null;
  const entry = ONBOARDING_STEPS.find((step) => step.segment === segment);
  return entry?.id ?? null;
}

export function getNextOnboardingStep(step: OnboardingStep): OnboardingStep | null {
  const index = ONBOARDING_STEPS.findIndex((item) => item.id === step);
  if (index === -1) return null;
  return ONBOARDING_STEPS[index + 1]?.id ?? null;
}

export function getPreviousOnboardingStep(step: OnboardingStep): OnboardingStep | null {
  const index = ONBOARDING_STEPS.findIndex((item) => item.id === step);
  if (index <= 0) return null;
  return ONBOARDING_STEPS[index - 1]?.id ?? null;
}
