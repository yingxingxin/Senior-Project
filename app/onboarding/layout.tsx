import type { ReactNode } from 'react';

import { OnboardingProgress } from '@/app/onboarding/_components/OnboardingProgress';
import { ModeToggle } from '@/components/ui/mode-toggle';
import type { OnboardingStep, OnboardingStepDefinition } from '@/app/onboarding/_lib/steps';
import { ONBOARDING_STEPS } from '@/app/onboarding/_lib/steps';
import {
  requireActiveOnboardingUser,
  resolveOnboardingStep,
} from '@/app/onboarding/_lib/server';

export const metadata = {
  title: 'Assistant Onboarding',
};

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireActiveOnboardingUser();
  const currentStep = resolveOnboardingStep(user);

  // Welcome page has its own layout
  if (currentStep === 'welcome') {
    return <>{children}</>;
  }

  return (
    <OnboardingLayoutShell
      steps={ONBOARDING_STEPS}
      currentStep={currentStep}
    >
      {children}
    </OnboardingLayoutShell>
  );
}

function OnboardingLayoutShell({
  children,
  steps,
  currentStep,
}: {
  children: ReactNode;
  steps: ReadonlyArray<OnboardingStepDefinition>;
  currentStep: OnboardingStep;
}) {
  // Filter out welcome step from progress indicator
  const progressSteps = steps.filter(step => step.id !== 'welcome');

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      {/* Theme toggle in top-right corner */}
      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      {/* Simple gradient background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-background to-muted" />
      </div>

      <div className="relative flex min-h-screen flex-col">
        {/* Header with progress indicator */}
        <header className="relative z-20 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <OnboardingProgress steps={progressSteps} currentStep={currentStep} />
          </div>
        </header>

        {/* Main content area - Full width */}
        <main className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl">
            {/* Content container with full viewport utilization */}
            <div className="animate-fade-in-up">
              {children}
            </div>
          </div>
        </main>

        {/* Mobile navigation helpers */}
        <footer className="relative z-10 border-t border-border bg-background/80 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Step {progressSteps.findIndex(s => s.id === currentStep) + 1} of {progressSteps.length}
              </div>
              <div className="flex gap-2">
                {progressSteps.map((step, index) => (
                  <span
                    key={step.id}
                    className={`h-1 w-8 rounded-full transition-colors ${
                      index <= progressSteps.findIndex(s => s.id === currentStep)
                        ? 'bg-primary'
                        : 'bg-muted'
                    }`}
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}