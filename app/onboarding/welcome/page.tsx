import { redirect } from 'next/navigation';
import Image from 'next/image';

import {
  requireActiveOnboardingUser,
  resolveOnboardingStep,
} from '@/src/lib/onboarding/server';
import { getOnboardingStepHref } from '@/src/lib/onboarding/steps';
import { persistOnboardingStep } from '@/app/onboarding/actions';

export default async function OnboardingWelcomePage() {
  const user = await requireActiveOnboardingUser();
  const currentStep = resolveOnboardingStep(user);

  // Only redirect if user is trying to skip ahead
  // Allow access if this is current step or user is going back
  const currentIndex = ['welcome', 'gender', 'skill_quiz', 'persona', 'guided_intro'].indexOf(currentStep);
  const thisIndex = 0; // welcome is index 0

  if (currentIndex > thisIndex + 1) {
    // User has progressed beyond this step, allow them to come back
  } else if (currentIndex < thisIndex) {
    // User hasn't reached this step yet, redirect to current
    redirect(getOnboardingStepHref(currentStep));
  }

  async function handleStartOnboarding() {
    'use server';
    await persistOnboardingStep('gender');
    redirect(getOnboardingStepHref('gender'));
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background to-muted">
      {/* Simple gradient background with subtle animation */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          {/* Main content card */}
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
            <div className="relative">
              {/* Hero image section */}
              <div className="relative h-64 overflow-hidden sm:h-80 lg:h-96">
                <Image
                  src="/anime.png"
                  alt="Sprite.exe hero"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />

                {/* Hero content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                  <span className="mb-4 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Personalize Sprite.exe
                  </span>
                  <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                    Welcome to Your Study Companion
                  </h1>
                </div>
              </div>

              {/* Content section */}
              <div className="p-8 lg:p-12">
                <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
                  Craft the companion who keeps you moving forward. Every choice here tunes how your assistant looks, speaks, and supports your goals.
                </p>

                {/* What to expect section */}
                <div className="mt-12 space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    What to expect
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-start gap-4 rounded-2xl border border-border bg-muted/30 p-4 backdrop-blur">
                      <span className="mt-1 size-2 rounded-full bg-primary" aria-hidden />
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold text-foreground">Step 1: Choose Your Assistant</h3>
                        <p className="text-sm text-muted-foreground">Pick the visual style that feels most comfortable for your study sessions.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-2xl border border-border bg-muted/30 p-4 backdrop-blur">
                      <span className="mt-1 size-2 rounded-full bg-primary" aria-hidden />
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold text-foreground">Step 2: Quick Skill Check</h3>
                        <p className="text-sm text-muted-foreground">Answer a few questions so we can start you at the right learning level.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-2xl border border-border bg-muted/30 p-4 backdrop-blur">
                      <span className="mt-1 size-2 rounded-full bg-primary" aria-hidden />
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold text-foreground">Step 3: Set Their Voice</h3>
                        <p className="text-sm text-muted-foreground">Preview how they&apos;ll respond and choose the coaching tone that motivates you.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-2xl border border-border bg-muted/30 p-4 backdrop-blur">
                      <span className="mt-1 size-2 rounded-full bg-primary" aria-hidden />
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold text-foreground">Step 4: Guided Tour</h3>
                        <p className="text-sm text-muted-foreground">Launch straight into a dashboard tour with your new companion.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA section */}
                <div className="mt-12 flex flex-col items-center gap-6">
                  <form action={handleStartOnboarding}>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 hover:shadow-xl hover:scale-105"
                    >
                      Start Customization
                    </button>
                  </form>

                  <p className="text-center text-sm text-muted-foreground">
                    Takes about 3 minutes to complete
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}