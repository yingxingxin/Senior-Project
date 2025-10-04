'use client';

import { Fragment } from 'react';
import { Progress } from '@/components/ui/progress';
import { Caption, Muted, Body } from '@/components/ui/typography';
import { Stack, Inline } from '@/components/ui/spacing';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/src/lib/utils';
import { useOnboarding } from '@/app/onboarding/_context/onboarding-context';
import { ONBOARDING_STEPS, getStepIndex } from '@/app/onboarding/_lib/steps';
import { Check } from 'lucide-react';

export function OnboardingRail() {
  const { currentStep } = useOnboarding();
  const currentIndex = getStepIndex(currentStep);
  const progress = ((currentIndex + 1) / ONBOARDING_STEPS.length) * 100;

  return (
    <aside
      className="hidden shrink-0 border-border bg-gradient-to-b from-muted/30 to-muted/10 md:block md:basis-80 md:border-r lg:basis-96 xl:basis-[26rem]"
      aria-label="Onboarding progress"
    >
      <Stack className="h-full px-8 py-12 lg:px-12 lg:py-16">
        <div className="lg:sticky lg:top-12">
          <Stack gap="loose">
            <Stack gap="tight">
              <Caption variant="uppercase" className="text-primary">
                Sprite.exe
              </Caption>
              <Muted variant="small">Setup Your Assistant</Muted>
            </Stack>

            {/* Progress steps */}
            <Stack gap="default" className="w-full">
              {/* Progress header with prominent badge */}
              <Inline gap="default" align="center" justify="between">
                <Caption variant="uppercase" className="text-muted-foreground">
                  Your Progress
                </Caption>
                <Badge variant="secondary" className="text-xs font-semibold">
                  {Math.round(progress)}% Complete
                </Badge>
              </Inline>

              {/* Progress bar */}
              <Progress value={progress} className="h-2.5" />

              {/* Stepper list with connecting lines */}
              <Stack gap="loose" as="ol" className="relative pt-2" aria-label="Onboarding steps">
                {ONBOARDING_STEPS.map((step, i) => {
                  const isCurrent = i === currentIndex;
                  const isDone = i < currentIndex;
                  const isLast = i === ONBOARDING_STEPS.length - 1;

                  return (
                    <Fragment key={step.id}>
                      <Inline
                        gap="default"
                        align="start"
                        as="li"
                        aria-current={isCurrent ? 'step' : undefined}
                        className="relative"
                      >
                        {/* Step indicator container */}
                        <div className="relative flex shrink-0 items-center justify-center">
                          {/* Vertical connecting line */}
                          {!isLast && (
                            <div
                              className={cn(
                                'absolute left-1/2 top-8 -ml-px h-[calc(100%+1.5rem+8px)] w-0.5',
                                isDone
                                  ? 'bg-primary'
                                  : isCurrent
                                  ? 'bg-gradient-to-b from-primary via-border to-border'
                                  : 'bg-border'
                              )}
                              aria-hidden
                            />
                          )}

                          {/* Step indicator circle */}
                          <span
                            className={cn(
                              'relative z-10 inline-flex size-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                              isDone
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : isCurrent
                                ? 'bg-card text-foreground border-primary shadow-md ring-4 ring-primary/20'
                                : 'bg-muted border-border text-muted-foreground'
                            )}
                            aria-hidden
                          >
                            {isDone ? (
                              <Check className="size-4" strokeWidth={3} />
                            ) : (
                              i + 1
                            )}
                          </span>
                        </div>

                        {/* Step content */}
                        <div
                          className={cn(
                            'min-w-0 flex-1 pt-0.5',
                            isCurrent && 'bg-accent/30 -ml-2 pl-2 -my-1 py-1 pr-2 rounded-lg'
                          )}
                        >
                          <Body
                            variant="small"
                            className={cn(
                              'font-medium',
                              isCurrent
                                ? 'text-foreground'
                                : isDone
                                ? 'text-foreground/80'
                                : 'text-muted-foreground'
                            )}
                          >
                            {step.title}
                          </Body>
                          {isCurrent && (
                            <Muted variant="tiny" className="mt-0.5">
                              In progress
                            </Muted>
                          )}
                        </div>
                      </Inline>
                    </Fragment>
                  );
                })}
              </Stack>
            </Stack>

            <Muted variant="tiny" className="text-muted-foreground">
              We&apos;ll save your progress as you go.
            </Muted>
          </Stack>
        </div>
      </Stack>
    </aside>
  );
}
