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
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
          Set Your Assistant&apos;s Voice
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-white/70 sm:text-xl">
          Every persona nudges your study partner&apos;s coaching style. Preview their voice and lock in the tone that helps you stay focused.
        </p>
      </div>

      {/* Full-width persona selection */}
      <div className="onboarding-animate-fade-in">
        <PersonaSelectionForm options={PERSONA_OPTIONS} selectedPersona={user.assistantPersona ?? null} />
      </div>
    </div>
  );
}