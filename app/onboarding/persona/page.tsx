import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import {
  requireActiveOnboardingUser,
  resolveOnboardingStep,
} from '@/app/onboarding/_lib/server';
import { getOnboardingStepHref } from '@/app/onboarding/_lib/steps';
import { PERSONA_OPTIONS } from '@/app/onboarding/_lib/fixtures';
import { PersonaSelectionForm } from '../_components/persona-selection-form';
import { PersistOnboardingStep } from '@/app/onboarding/_components/PersistOnboardingStep';
import { Button } from '@/components/ui/button';
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
        <Link href={getOnboardingStepHref('gender')}>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assistant Selection
          </Button>
        </Link>
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