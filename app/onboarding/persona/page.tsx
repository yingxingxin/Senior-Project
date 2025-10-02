import { redirect } from 'next/navigation';

import {
  requireActiveOnboardingUser,
  resolveOnboardingStep,
} from '@/src/lib/onboarding/server';
import { getOnboardingStepHref } from '@/src/lib/onboarding/steps';
import { PERSONA_OPTIONS } from '@/src/lib/onboarding/fixtures';
import { PersonaSelectionForm } from '@/components/onboarding/PersonaSelectionForm';
import { PersistOnboardingStep } from '@/components/onboarding/PersistOnboardingStep';
import { BackButton } from '@/components/onboarding/BackButton';
import { Display, Body } from '@/components/ui/typography';

export default async function OnboardingPersonaPage() {
  const user = await requireActiveOnboardingUser();

  if (!user.assistantId) {
    redirect(getOnboardingStepHref('gender'));
  }

  const currentStep = resolveOnboardingStep(user);

  // Only redirect if user is trying to skip ahead
  // Allow access if this is current step or user is going back
  const currentIndex = ['welcome', 'gender', 'persona', 'guided_intro'].indexOf(currentStep);
  const thisIndex = 2; // persona is index 2

  if (currentIndex > thisIndex + 1) {
    // User has progressed beyond this step, allow them to come back
  } else if (currentIndex < thisIndex) {
    // User hasn't reached this step yet, redirect to current
    redirect(getOnboardingStepHref(currentStep));
  }

  return (
    <div className="w-full">
      <PersistOnboardingStep step="persona" />

      {/* Back navigation */}
      <div className="mb-6">
        <BackButton href={getOnboardingStepHref('gender')} label="Back to Assistant Selection" />
      </div>

      {/* Full-width header section */}
      <div className="mb-12 text-center">
        <Display level={1} className="mb-4">
          Set Your Assistant&apos;s Voice
        </Display>
        <Body variant="large" className="mx-auto max-w-3xl text-muted-foreground">
          Every persona nudges your study partner&apos;s coaching style. Preview their voice and lock in the tone that helps you stay focused.
        </Body>
      </div>

      {/* Full-width persona selection */}
      <div className="animate-fade-in-up">
        <PersonaSelectionForm options={PERSONA_OPTIONS} selectedPersona={user.assistantPersona ?? null} />
      </div>
    </div>
  );
}