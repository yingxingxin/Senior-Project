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
import { loadActiveUser } from '@/app/onboarding/actions';
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
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/login?next=/onboarding');
  }

  const user = await loadActiveUser(Number(session.user.id));

  if (user.completedAt) {
    redirect('/home');
  }

  const bootstrap = {
    userId: user.id,
    userName: user.name,
    currentStep: user.currentStep || 'gender',
    assistantId: user.assistantId,
    assistantPersona: user.assistantPersona,
    skillLevel: user.skillLevel,
    completedAt: user.completedAt,
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
