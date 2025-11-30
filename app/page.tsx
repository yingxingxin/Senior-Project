/**
 * Landing Page
 *
 * GitHub-inspired homepage with tabbed hero carousel showcasing AI assistants.
 * Structure:
 * 1. Header with navigation
 * 2. Hero with assistant carousel (Nova | Atlas | Sage tabs)
 * 3. Feature sections with video placeholders (river layout)
 * 4. CTA section
 * 5. Footer
 *
 * Videos will be added once Remotion compositions are rendered.
 */

import { auth } from '@/src/lib/auth'
import { headers } from 'next/headers'
import { getUserWithOnboarding } from '@/src/db/queries'
import { Stack } from '@/components/ui/spacing'
import {
  HeroCarousel,
  FeatureSection,
  LandingHeader,
  LandingFooter,
  CTASection
} from '@/app/_components'
import { FEATURES } from '@/app/_lib/landing-data'

async function getAuthState() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session || !session.user) {
    return { isAuthenticated: false, user: null, hasCompletedOnboarding: false }
  }

  try {
    const [user] = await getUserWithOnboarding.execute({
      userId: Number(session.user.id)
    })

    return {
      isAuthenticated: true,
      user,
      hasCompletedOnboarding: !!user?.onboardingCompletedAt
    }
  } catch {
    return { isAuthenticated: false, user: null, hasCompletedOnboarding: false }
  }
}

export default async function LandingPage() {
  const { isAuthenticated, hasCompletedOnboarding } = await getAuthState()

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader isAuthenticated={isAuthenticated} />

      <main className="px-4 mx-auto max-w-7xl">
        {/* Hero with tabbed assistant carousel */}
        <HeroCarousel
          isAuthenticated={isAuthenticated}
          hasCompletedOnboarding={hasCompletedOnboarding}
        />

        {/* Feature sections with river layout */}
        <Stack gap="section" id="features">
          {FEATURES.map((feature) => (
            <FeatureSection key={feature.id} feature={feature} />
          ))}
        </Stack>

        {/* Final CTA */}
        <CTASection
          isAuthenticated={isAuthenticated}
          hasCompletedOnboarding={hasCompletedOnboarding}
        />
      </main>

      <LandingFooter />
    </div>
  )
}
