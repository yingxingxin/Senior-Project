'use client';

import { createContext, use, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { OnboardingStep, SkillLevel, AssistantPersona } from '@/src/db/schema';

import {
  selectAssistantGenderAction,
  selectAssistantPersonaAction,
  submitSkillQuizAnswers,
  completeOnboardingAction,
  resetOnboardingAction,
} from '@/app/onboarding/_lib/actions';

export type OnboardingBootstrap = {
  userId: number;
  userName: string;
  currentStep: OnboardingStep;
  assistantId: number | null;
  assistantPersona: AssistantPersona | null;
  skillLevel: SkillLevel;
  completedAt: Date | null;
};

type OnboardingContext = {
  // User data
  userId: number;
  userName: string;
  completedAt: Date | null;

  // State
  pending: boolean;
  error: string | null;
  currentStep: OnboardingStep;
  assistantId: number | null;
  persona: AssistantPersona | null;
  skillLevel: SkillLevel;

  // Actions
  setError: (msg: string | null) => void;
  selectAssistant: (id: number) => Promise<void>;
  selectPersona: (p: AssistantPersona) => Promise<void>;
  submitQuiz: (answers: Array<{ questionId: number; selectedIndex: number }>) => Promise<void>;
  complete: () => Promise<void>;
  reset: () => Promise<void>;
};

const Ctx = createContext<OnboardingContext | null>(null);

export function useOnboarding() {
  const ctx = use(Ctx);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}

export function OnboardingProvider({
  children,
  bootstrap,
}: {
  children: React.ReactNode;
  bootstrap: OnboardingBootstrap;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [assistantId, setAssistantId] = useState<number | null>(bootstrap.assistantId);
  const [persona, setPersona] = useState<AssistantPersona | null>(bootstrap.assistantPersona);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(bootstrap.skillLevel);

  function withTransition<T>(fn: () => Promise<T>): Promise<T> {
    setError(null);
    return new Promise<T>((resolve, reject) => {
      startTransition(async () => {
        try {
          const out = await fn();
          resolve(out);
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'Something went wrong';
          setError(message);
          reject(e);
        }
      });
    });
  }

  const value = useMemo<OnboardingContext>(
    () => ({
      userId: bootstrap.userId,
      userName: bootstrap.userName,
      completedAt: bootstrap.completedAt,
      pending,
      error,
      currentStep: bootstrap.currentStep,
      assistantId,
      persona,
      skillLevel,
      setError,
      async selectAssistant(id) {
        await withTransition(async () => {
          const res = await selectAssistantGenderAction(id);
          setAssistantId(id);
          router.push(res.nextHref);
        });
      },
      async selectPersona(p) {
        await withTransition(async () => {
          const res = await selectAssistantPersonaAction(p);
          setPersona(p);
          router.push(res.nextHref);
        });
      },
      async submitQuiz(answers) {
        console.log('[OnboardingContext] submitQuiz called with:', answers);
        await withTransition(async () => {
          try {
            console.log('[OnboardingContext] Calling submitSkillQuizAnswers server action...');
            const r = await submitSkillQuizAnswers({ answers });
            console.log('[OnboardingContext] Server action result:', r);
            setSkillLevel(r.level);
            console.log('[OnboardingContext] Navigating to:', r.next);
            router.push(r.next);
          } catch (err) {
            console.error('[OnboardingContext] submitQuiz error:', err);
            throw err; // Re-throw to let form handle it
          }
        });
      },
      async complete() {
        await withTransition(async () => {
          const r = await completeOnboardingAction();
          router.push(r.redirectTo);
        });
      },
      async reset() {
        await withTransition(async () => {
          const r = await resetOnboardingAction();
          router.push(r.redirectTo);
        });
      },
    }),
    [pending, error, assistantId, persona, skillLevel, router, bootstrap.currentStep, bootstrap.userId, bootstrap.userName, bootstrap.completedAt]
  );

  return <Ctx value={value}>{children}</Ctx>;
}
