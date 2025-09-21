import Link from 'next/link';

import type { OnboardingStep, OnboardingStepDefinition } from '@/src/lib/onboarding/steps';
import { getOnboardingStepHref } from '@/src/lib/onboarding/steps';
import { cn } from '@/src/lib/utils';
import { Progress } from '@/components/ui/progress';

export function OnboardingProgress({
  steps,
  currentStep,
  className,
}: {
  steps: ReadonlyArray<OnboardingStepDefinition>;
  currentStep: OnboardingStep;
  className?: string;
}) {
  const currentIndex = steps.findIndex((step) => step.id === currentStep);
  const completion = steps.length > 1 ? currentIndex / (steps.length - 1) : 0;

  return (
    <nav
      aria-label="Onboarding steps"
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 via-white/10 to-white/5 backdrop-blur-3xl',
        className,
      )}
    >
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_45%),radial_gradient(circle_at_bottom_right,rgba(167,139,250,0.12),transparent_55%)]" aria-hidden />

      <div className="relative p-6">
        {/* Header with integrated branding */}
        <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full border border-cyan-300/30 bg-gradient-to-r from-cyan-500/20 to-sky-500/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100 shadow-[0_4px_20px_rgba(34,211,238,0.25)]">
              Personalize Sprite.exe
            </span>
            <span className="text-sm text-white/60">
              Step <span className="font-semibold text-white">{currentIndex + 1}</span> of {steps.length}
            </span>
          </div>

          {/* Current step title on desktop */}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white/90">
              {steps[currentIndex]?.title}
            </p>
          </div>
        </div>

        {/* Enhanced progress bar with shadcn Progress */}
        <div className="relative mb-6">
          <Progress
            value={completion * 100}
            className="h-2 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:via-sky-300 [&>div]:to-violet-400 [&>div]:shadow-[0_0_20px_rgba(34,211,238,0.5)]"
          />

          {/* Step dots overlay */}
          <div className="absolute inset-0 flex items-center justify-between px-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  'size-3 rounded-full border-2 transition-all duration-300',
                  index <= currentIndex
                    ? 'border-cyan-300 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]'
                    : 'border-white/30 bg-white/10'
                )}
              />
            ))}
          </div>
        </div>

        {/* Redesigned step cards */}
        <ol className="grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => {
            const isCurrent = index === currentIndex;
            const isComplete = index < currentIndex;
            const isFuture = index > currentIndex;
            const linkHref = getOnboardingStepHref(step.id);
            const canNavigate = !isFuture;

            const stepContent = (
              <div
                className={cn(
                  'group relative h-full overflow-hidden rounded-2xl border p-4 transition-all duration-300',
                  isCurrent
                    ? 'border-cyan-300/50 bg-gradient-to-br from-cyan-500/15 to-sky-500/10 shadow-[0_8px_32px_rgba(34,211,238,0.25)]'
                    : isComplete
                      ? 'border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5'
                      : 'border-white/10 bg-white/5 opacity-60'
                )}
              >
                {/* Card gradient overlay */}
                <div
                  className={cn(
                    'absolute inset-0 opacity-0 transition-opacity duration-300',
                    canNavigate && 'group-hover:opacity-100'
                  )}
                  style={{
                    background: isCurrent
                      ? 'radial-gradient(circle at top, rgba(34,211,238,0.1), transparent 70%)'
                      : 'radial-gradient(circle at top, rgba(255,255,255,0.05), transparent 70%)'
                  }}
                  aria-hidden
                />

                <div className="relative flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-300',
                        isCurrent
                          ? 'bg-gradient-to-br from-cyan-400 to-sky-400 text-white shadow-[0_2px_10px_rgba(34,211,238,0.4)]'
                          : isComplete
                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white'
                            : 'bg-white/10 text-white/50'
                      )}
                    >
                      {isComplete ? '✓' : index + 1}
                    </span>
                    <div className="text-sm font-semibold text-white/90">
                      {step.title}
                    </div>
                  </div>

                  <div className="text-xs text-white/60 line-clamp-2">
                    {step.description}
                  </div>

                  {isCurrent && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-medium text-cyan-200">
                      <span className="size-1.5 rounded-full bg-cyan-300 animate-pulse" />
                      Current Step
                    </div>
                  )}
                </div>
              </div>
            );

            return (
              <li key={step.id}>
                {canNavigate && !isCurrent ? (
                  <Link
                    href={linkHref}
                    className="block h-full transition-transform duration-200 hover:scale-[1.02]"
                  >
                    {stepContent}
                  </Link>
                ) : (
                  <div aria-current={isCurrent ? 'step' : undefined}>
                    {stepContent}
                  </div>
                )}
              </li>
            );
          })}
        </ol>

        {/* Mobile current step indicator */}
        <div className="mt-4 text-center sm:hidden">
          <p className="text-sm font-medium text-white/90">
            {steps[currentIndex]?.title}
          </p>
          <p className="text-xs text-white/60 mt-1">
            {steps[currentIndex]?.description}
          </p>
        </div>
      </div>

    </nav>
  );
}