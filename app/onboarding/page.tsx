import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/src/lib/auth';
import { loadActiveUser, getNextAllowedStep } from '@/app/onboarding/_lib/guard';
import { getOnboardingStepHref } from '@/app/onboarding/_lib/steps';

export default async function OnboardingRootPage() {
  // Auth check
  const session = await auth.api.getSession({ headers: await headers() });
  const isDev = process.env.NODE_ENV === 'development';
  if (!session?.user?.id) {
    if (isDev) {
      redirect('/onboarding/gender');
    }
    redirect('/login?next=/onboarding');
  }

  // Load user and determine first allowed step
  const user = await loadActiveUser(Number(session.user.id));
  const nextStep = getNextAllowedStep(user);

  // Redirect to first allowed step
  redirect(getOnboardingStepHref(nextStep));
}
