import type { ReactNode } from 'react';

import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import type { OnboardingStep, OnboardingStepDefinition } from '@/src/lib/onboarding/steps';
import { ONBOARDING_STEPS } from '@/src/lib/onboarding/steps';
import {
  requireActiveOnboardingUser,
  resolveOnboardingStep,
} from '@/src/lib/onboarding/server';

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
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Animated background layers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--onboarding-bg-dark)] to-[var(--onboarding-bg-base)]" />
        <div className="onboarding-bg-mesh" />
        <div className="onboarding-bg-aurora" />
        <div className="onboarding-bg-particles" />
        <div className="onboarding-bg-glow" />

        {/* Noise texture overlay for depth */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      <div className="relative flex min-h-screen flex-col">
        {/* Header with progress indicator */}
        <header className="relative z-20 border-b border-white/10 bg-black/20 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <OnboardingProgress steps={progressSteps} currentStep={currentStep} />
          </div>
        </header>

        {/* Main content area - Full width */}
        <main className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-6xl">
            {/* Content container with full viewport utilization */}
            <div className="onboarding-animate-fade-in">
              {children}
            </div>
          </div>
        </main>

        {/* Mobile navigation helpers */}
        <footer className="relative z-10 border-t border-white/10 bg-black/20 backdrop-blur-xl lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/50">
                Step {progressSteps.findIndex(s => s.id === currentStep) + 1} of {progressSteps.length}
              </div>
              <div className="flex gap-2">
                {progressSteps.map((step, index) => (
                  <span
                    key={step.id}
                    className={`h-1 w-8 rounded-full transition-colors ${
                      index <= progressSteps.findIndex(s => s.id === currentStep)
                        ? 'bg-cyan-400'
                        : 'bg-white/20'
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