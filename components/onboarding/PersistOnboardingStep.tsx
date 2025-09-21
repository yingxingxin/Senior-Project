'use client';

import { useEffect, useRef } from 'react';

import type { OnboardingStep } from '@/src/lib/onboarding/steps';
import { updateOnboardingStepAction } from '@/app/onboarding/actions';

interface PersistOnboardingStepProps {
  step: OnboardingStep;
}

export function PersistOnboardingStep({ step }: PersistOnboardingStepProps) {
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    void updateOnboardingStepAction(step);
  }, [step]);

  return null;
}
