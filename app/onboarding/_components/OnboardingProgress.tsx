import Link from 'next/link';

import type { OnboardingStep, OnboardingStepDefinition } from '@/app/onboarding/_lib/steps';
import { getOnboardingStepHref } from '@/app/onboarding/_lib/steps';
import { cn } from '@/src/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Caption, Muted, Heading } from '@/components/ui/typography';

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
            <Caption variant="uppercase" className="inline-flex items-center rounded-full border border-primary/30 bg-gradient-to-r from-primary/20 to-primary/10 px-4 py-1.5 text-primary shadow-[0_4px_20px_rgba(34,211,238,0.25)]">
              Personalize Sprite.exe
            </Caption>
            <Muted variant="small" as="span">
              Step <Heading level={6} as="span">{currentIndex + 1}</Heading> of {steps.length}
            </Muted>
          </div>

          {/* Current step title on desktop */}
          <div className="hidden sm:block">
            <Muted variant="small" as="p" className="font-medium text-foreground">
              {steps[currentIndex]?.title}
            </Muted>
          </div>
        </div>

        {/* Enhanced progress bar with shadcn Progress */}
        <div className="relative mb-6">
          <Progress
            value={completion * 100}
            className="h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:via-sky-300 [&>div]:to-violet-400 [&>div]:shadow-[0_0_20px_rgba(34,211,238,0.5)]"
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
                    : 'border-muted bg-muted/50'
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
                      : 'border-border bg-muted/20 opacity-60'
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
                          ? 'bg-gradient-to-br from-cyan-400 to-sky-400 text-primary-foreground shadow-[0_2px_10px_rgba(34,211,238,0.4)]'
                          : isComplete
                            ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {isComplete ? '✓' : index + 1}
                    </span>
                    <Heading level={6} as="div" className="text-sm">
                      {step.title}
                    </Heading>
                  </div>

                  <Muted variant="tiny" className="line-clamp-2">
                    {step.description}
                  </Muted>

                  {isCurrent && (
                    <Caption variant="default" className="mt-2 flex items-center gap-1 font-medium text-cyan-200">
                      <span className="size-1.5 rounded-full bg-cyan-300 animate-pulse" />
                      Current Step
                    </Caption>
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
          <Muted variant="small" as="p" className="font-medium text-foreground">
            {steps[currentIndex]?.title}
          </Muted>
          <Muted variant="tiny" as="p" className="mt-1">
            {steps[currentIndex]?.description}
          </Muted>
        </div>
      </div>

    </nav>
  );
}