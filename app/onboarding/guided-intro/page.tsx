import { redirect } from 'next/navigation';

import { GuidedIntroCompletion } from '@/components/onboarding/GuidedIntroCompletion';
import { PersistOnboardingStep } from '@/components/onboarding/PersistOnboardingStep';
import { BackButton } from '@/components/onboarding/BackButton';
import { getAssistantNameForUser } from '@/src/db/queries/onboarding';
import { PERSONA_OPTIONS } from '@/src/lib/onboarding/fixtures';
import {
  requireActiveOnboardingUser,
  resolveOnboardingStep,
} from '@/src/lib/onboarding/server';
import { getOnboardingStepHref } from '@/src/lib/onboarding/steps';

export default async function OnboardingGuidedIntroPage() {
  const user = await requireActiveOnboardingUser();

  if (!user.assistantId) {
    redirect(getOnboardingStepHref('gender'));
  }

  if (!user.assistantPersona) {
    redirect(getOnboardingStepHref('persona'));
  }

  const currentStep = resolveOnboardingStep(user);

  // Only redirect if user is trying to skip ahead
  // Allow access if this is current step or user is going back
  const currentIndex = ['welcome', 'gender', 'persona', 'guided_intro'].indexOf(currentStep);
  const thisIndex = 3; // guided_intro is index 3

  if (currentIndex > thisIndex + 1) {
    // User has progressed beyond this step, allow them to come back
  } else if (currentIndex < thisIndex) {
    // User hasn't reached this step yet, redirect to current
    redirect(getOnboardingStepHref(currentStep));
  }

  const assistantName = user.assistantId ? await getAssistantNameForUser(user.userId) : null;
  const personaLabel = PERSONA_OPTIONS.find((option) => option.id === user.assistantPersona)?.title ?? 'Custom';

  return (
    <div className="w-full">
      <PersistOnboardingStep step="guided_intro" />

      {/* Back navigation */}
      <div className="mb-6">
        <BackButton href={getOnboardingStepHref('persona')} label="Back to Personality" />
      </div>

      {/* Full-width header section */}
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
          Welcome Aboard!
        </h1>
        <p className="mx-auto max-w-3xl text-lg text-white/70 sm:text-xl">
          You&apos;re one tap away from meeting your assistant inside Sprite.exe. We&apos;ll walk you through the dashboard and highlight the tools that matter most.
        </p>
      </div>

      {/* Centered content grid */}
      <div className="mx-auto max-w-5xl onboarding-animate-fade-in">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/10 p-6 shadow-[0_24px_70px_rgba(8,47,73,0.4)] backdrop-blur-2xl sm:p-8 onboarding-animate-scale-in">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.24),transparent_65%)] opacity-90" aria-hidden />
          <div className="relative flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.38em] text-white/50">Summary</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Your companion is ready to launch</h3>
            </div>

            <dl className="grid gap-4 text-sm text-white/75 sm:grid-cols-2">
              <div className="space-y-1 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
                <dt className="text-xs uppercase tracking-[0.32em] text-white/45">Companion</dt>
                <dd className="text-base text-white">
                  {assistantName ? assistantName : `Assistant #${user.assistantId}`}
                </dd>
              </div>
              <div className="space-y-1 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
                <dt className="text-xs uppercase tracking-[0.32em] text-white/45">Voice</dt>
                <dd className="text-base text-white">{personaLabel}</dd>
              </div>
              <div className="space-y-1 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
                <dt className="text-xs uppercase tracking-[0.32em] text-white/45">Next action</dt>
                <dd className="text-base text-white">Guided dashboard tour</dd>
              </div>
              <div className="space-y-1 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
                <dt className="text-xs uppercase tracking-[0.32em] text-white/45">Runtime</dt>
                <dd className="text-base text-white">Under 2 minutes</dd>
              </div>
            </dl>

            <div className="rounded-2xl border border-cyan-300/20 bg-gradient-to-r from-cyan-500/10 to-sky-500/5 p-4 text-sm text-white/80 onboarding-animate-glow-pulse">
              <p className="flex items-start gap-2">
                <span className="mt-1 size-1.5 rounded-full bg-cyan-300 animate-pulse" />
                Look for the neon highlights—they&apos;ll guide you through Study Queue, Practice Arena, and your Progress Pulse.
              </p>
            </div>
          </div>
        </section>

        <aside className="flex flex-col justify-between gap-6 rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-white/10 p-6 text-sm text-white/80 shadow-[0_24px_60px_rgba(8,47,73,0.35)] backdrop-blur-2xl onboarding-animate-slide-in">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">Final check</h3>
            <p className="leading-relaxed text-white/70">
              We saved your setup. Kick off the guided intro whenever you&apos;re ready—we&apos;ll keep the welcome tour on standby if you need a refresher later.
            </p>
          </div>

          <GuidedIntroCompletion />
        </aside>
        </div>
      </div>
    </div>
  );
}