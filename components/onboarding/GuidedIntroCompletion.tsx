'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { completeOnboardingAction } from '@/app/onboarding/actions';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function GuidedIntroCompletion() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleComplete = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await completeOnboardingAction();
        router.push(result.redirectTo);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to finish onboarding');
      }
    });
  };

  return (
    <div className="space-y-5">
      {error ? (
        <Alert variant="destructive" className="border-red-400/40 bg-red-500/10 text-red-100">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <button
        type="button"
        onClick={handleComplete}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-500 px-6 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_18px_60px_rgba(56,189,248,0.4)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Finishing…' : 'Launch dashboard tour'}
        <span aria-hidden>→</span>
      </button>
    </div>
  );
}
