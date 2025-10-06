'use client';

import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/app/onboarding/_context/onboarding-context';
import {
  getOnboardingStepHref,
  isNewUser,
  calculateProgress,
  getStepTitle,
  getResumeStep,
} from '@/app/onboarding/_lib/steps';
import { Stack, Inline } from '@/components/ui/spacing';
import { Display, Body, Muted } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const ctx = useOnboarding();

  const userIsNew = isNewUser({
    currentStep: ctx.currentStep,
    assistantId: ctx.assistantId,
    assistantPersona: ctx.persona,
  });

  const hasProgress = !userIsNew;
  const progressPercent = hasProgress ? calculateProgress(ctx.currentStep) : 0;
  const currentStepTitle = hasProgress ? getStepTitle(ctx.currentStep) : null;
  const resumeStep = getResumeStep({
    currentStep: ctx.currentStep,
    assistantId: ctx.assistantId,
    assistantPersona: ctx.persona,
  });

  const handleGetStarted = () => {
    router.push(getOnboardingStepHref('gender'));
  };

  const handleResume = () => {
    router.push(getOnboardingStepHref(resumeStep));
  };

  const handleStartOver = async () => {
    if (confirm('Are you sure you want to start over? This will reset all your onboarding progress.')) {
      await ctx.reset();
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center">
      <Stack gap="loose" className="w-full max-w-3xl">
        <Stack gap="tight">
          <Display level={2}>Welcome to Sprite.exe</Display>
          <Body variant="large" className="text-muted-foreground">
            Personalize your assistant in a few guided steps so every session feels tailored to the way
            you learn best.
          </Body>
        </Stack>

        {userIsNew ? (
          <Button onClick={handleGetStarted} size="lg" className="w-fit">
            Begin setup
          </Button>
        ) : (
          <Stack gap="tight">
            <Muted>You&apos;re {progressPercent}% complete</Muted>
            <Inline gap="tight" className="w-full" align="center">
              <Button onClick={handleResume} size="lg" className="w-full sm:w-auto">
                Resume setup
              </Button>
              <Button onClick={handleStartOver} variant="outline" size="lg" className="w-full sm:w-auto">
                Start over
              </Button>
            </Inline>
          </Stack>
        )}
      </Stack>
    </div>
  );
}
