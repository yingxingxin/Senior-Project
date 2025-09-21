import { redirect } from 'next/navigation';

import {
  getOnboardingRedirectTarget,
  requireActiveOnboardingUser,
} from '@/src/lib/onboarding/server';

export default async function OnboardingEntryPage() {
  const user = await requireActiveOnboardingUser();
  redirect(getOnboardingRedirectTarget(user));
}
