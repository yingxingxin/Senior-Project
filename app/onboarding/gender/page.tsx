import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import {
  requireActiveOnboardingUser,
  resolveOnboardingStep,
} from '@/src/lib/onboarding/server';
import { getOnboardingStepHref } from '@/src/lib/onboarding/steps';
import { getAssistantOptions } from '@/src/db/queries/onboarding';
import { AssistantSelectionForm } from '@/components/onboarding/AssistantSelectionForm';
import { PersistOnboardingStep } from '@/components/onboarding/PersistOnboardingStep';
import { Button } from '@/components/ui/button';
import { Display, Body } from '@/components/ui/typography';

export default async function OnboardingGenderPage() {
  const user = await requireActiveOnboardingUser();
  const currentStep = resolveOnboardingStep(user);

  // Only redirect if user is trying to skip ahead
  // Allow access if this is current step or user is going back
  const currentIndex = ['welcome', 'gender', 'persona', 'guided_intro'].indexOf(currentStep);
  const thisIndex = 1; // gender is index 1

  if (currentIndex > thisIndex + 1) {
    // User has progressed beyond this step, allow them to come back
  } else if (currentIndex < thisIndex) {
    // User hasn't reached this step yet, redirect to current
    redirect(getOnboardingStepHref(currentStep));
  }

  const assistants = await getAssistantOptions();

  return (
    <div className="w-full">
      <PersistOnboardingStep step="gender" />

      {/* Back navigation */}
      <div className="mb-6">
        <Link href={getOnboardingStepHref('welcome')}>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Welcome
          </Button>
        </Link>
      </div>

      {/* Full-width header section */}
      <div className="mb-12 text-center">
        <Display level={1} className="mb-4">
          Choose Your Assistant
        </Display>
        <Body variant="large" className="mx-auto max-w-3xl text-muted-foreground">
          These portraits shape the energy your companion brings to every study session. Pick the style that keeps you inspired.
        </Body>
      </div>

      {/* Full-width assistant selection */}
      <div className="animate-fade-in-up">
        <AssistantSelectionForm options={assistants} selectedAssistantId={user.assistantId ?? null} />
      </div>
    </div>
  );
}