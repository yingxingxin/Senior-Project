import { redirect } from 'next/navigation';

import {
  getOnboardingRedirectTarget,
  requireActiveOnboardingUser,
} from '@/app/onboarding/_lib/server';

export default async function OnboardingEntryPage() {
  const user = await requireActiveOnboardingUser();
  redirect(getOnboardingRedirectTarget(user));
}
