'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Stack, Inline } from '@/components/ui/spacing'
import { Heading, Body } from '@/components/ui/typography'
import { CTA_CONTENT } from '@/app/_lib/landing-data'

interface CTASectionProps {
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
}

/**
 * Final call-to-action section
 *
 * High-contrast section with primary background to draw attention.
 * Shows different CTAs based on auth state.
 */
export function CTASection({
  isAuthenticated,
  hasCompletedOnboarding
}: CTASectionProps) {
  return (
    <section className="py-16 md:py-24 px-4 mx-auto max-w-7xl">
      <div className="rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 lg:p-16">
        <Stack gap="loose" className="max-w-3xl mx-auto text-center items-center">
          <Stack gap="default">
            <Heading level={2} className="text-3xl md:text-4xl lg:text-5xl">
              {CTA_CONTENT.headline}
            </Heading>
            <Body className="text-primary-foreground/90 text-lg">
              {CTA_CONTENT.description}
            </Body>
          </Stack>

          {isAuthenticated ? (
            <Link href={hasCompletedOnboarding ? '/home' : '/onboarding'}>
              <Button size="lg" variant="secondary" className="gap-2">
                {hasCompletedOnboarding ? 'Return to dashboard' : 'Finish onboarding'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Inline gap="default" align="center" wrap>
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="gap-2">
                  {CTA_CONTENT.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-primary-foreground underline underline-offset-4 hover:no-underline"
              >
                {CTA_CONTENT.secondaryCta}
              </Link>
            </Inline>
          )}
        </Stack>
      </div>
    </section>
  )
}
