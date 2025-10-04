/**
 * app/onboarding/layout.tsx
 *
 * Creates a consistent layout for the onboarding pages
 */
import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { auth } from '@/src/lib/auth';
import { OnboardingProvider } from '@/app/onboarding/_context/onboarding-context';
import { loadActiveUser } from '@/app/onboarding/_lib/guard';
import { Stack } from '@/components/ui/spacing';
import { OnboardingRail } from '@/app/onboarding/_components/onboarding-sidebar';
import { cn } from '@/src/lib/utils';

export const metadata = {
  title: 'Onboarding - Sprite.exe',
};

type Props = {
  children: ReactNode;
};

export default async function OnboardingLayout({ children }: Props) {
  console.log('[ONBOARDING LAYOUT] Starting...');

  // 1. Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    console.log('[ONBOARDING LAYOUT] No session, redirecting to login');
    redirect('/login?next=/onboarding');
  }

  const userId = Number(session.user.id);
  console.log('[ONBOARDING LAYOUT] User ID:', userId);

  // 2. Load user data
  const user = await loadActiveUser(userId);
  console.log('[ONBOARDING LAYOUT] User data:', {
    currentStep: user.currentStep,
    assistantId: user.assistantId,
    assistantPersona: user.assistantPersona,
    completedAt: user.completedAt,
  });

  // 3. Check if onboarding is already completed
  if (user.completedAt) {
    console.log('[ONBOARDING LAYOUT] Onboarding completed, redirecting to /home');
    redirect('/home');
  }

  // 4. Prepare bootstrap data for provider
  // Note: Step validation and access control is handled in the page component
  const bootstrap = {
    currentStep: user.currentStep || 'gender',
    assistantId: user.assistantId,
    assistantPersona: user.assistantPersona,
    skillLevel: user.skillLevel,
  };

  return (
    <OnboardingProvider bootstrap={bootstrap}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen flex-col md:flex-row">
          <OnboardingRail />

          <main className="flex-1">
            <div
              className={cn(
                'mx-auto w-full px-6 py-10 sm:px-8 sm:py-14 lg:px-12',
                'max-w-5xl'
              )}
            >
              <Stack gap="loose">
                {children}
              </Stack>
            </div>
          </main>
        </div>
      </div>
    </OnboardingProvider>
  );
}
