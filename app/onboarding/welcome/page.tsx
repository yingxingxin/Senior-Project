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

  // Skip welcome if user has already started onboarding
  if (currentStep !== 'welcome' && user.onboardingStep !== null) {
    redirect(getOnboardingStepHref(currentStep));
  }

  async function handleStartOnboarding() {
    'use server';
    await persistOnboardingStep('gender');
    redirect(getOnboardingStepHref('gender'));
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[var(--onboarding-bg-dark)] to-[var(--onboarding-bg-base)]">
      {/* Animated background layers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="onboarding-bg-mesh" />
        <div className="onboarding-bg-aurora" />
        <div className="onboarding-bg-particles" />
        <div className="onboarding-bg-glow" />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          {/* Main content card */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-white/10 shadow-[0_35px_120px_rgba(56,189,248,0.25)] backdrop-blur-3xl">
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                {/* Hero content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                  <span className="mb-4 inline-flex items-center rounded-full border border-cyan-300/30 bg-gradient-to-r from-cyan-500/20 to-sky-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100 shadow-[0_4px_20px_rgba(34,211,238,0.25)]">
                    Personalize Sprite.exe
                  </span>
                  <h1 className="mt-4 text-4xl font-bold sm:text-5xl lg:text-6xl">
                    Welcome to Your Study Companion
                  </h1>
                </div>
              </div>

              {/* Content section */}
              <div className="p-8 lg:p-12">
                <p className="max-w-3xl text-lg leading-relaxed text-white/85 lg:text-xl">
                  Craft the companion who keeps you moving forward. Every choice here tunes how your assistant looks, speaks, and supports your goals.
                </p>

                {/* What to expect section */}
                <div className="mt-12 space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-white/60">
                    What to expect
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
                      <span className="mt-1 size-2 rounded-full bg-cyan-300" aria-hidden />
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold text-white">Step 1: Choose Your Assistant</h3>
                        <p className="text-sm text-white/70">Pick the visual style that feels most comfortable for your study sessions.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
                      <span className="mt-1 size-2 rounded-full bg-violet-300" aria-hidden />
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold text-white">Step 2: Set Their Voice</h3>
                        <p className="text-sm text-white/70">Preview how they&apos;ll respond and choose the coaching tone that motivates you.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur">
                      <span className="mt-1 size-2 rounded-full bg-sky-200" aria-hidden />
                      <div className="flex-1">
                        <h3 className="mb-1 font-semibold text-white">Step 3: Guided Tour</h3>
                        <p className="text-sm text-white/70">Launch straight into a dashboard tour with your new companion.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA section */}
                <div className="mt-12 flex flex-col items-center gap-6">
                  <form action={handleStartOnboarding}>
                    <button
                      type="submit"
                      className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 px-8 py-4 text-lg font-semibold text-white shadow-[0_10px_40px_rgba(8,_112,_184,_0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_60px_rgba(8,_112,_184,_0.7)]"
                    >
                      <span className="relative z-10">Start Customization</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-sky-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </button>
                  </form>

                  <p className="text-center text-sm text-white/50">
                    Takes about 2 minutes to complete
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