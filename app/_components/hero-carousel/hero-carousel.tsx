'use client'

import { Stack } from '@/components/ui/spacing'
import { Display, Body } from '@/components/ui/typography'
import { HeroCarouselProvider } from './hero-carousel-context'
import { HeroTabList } from './hero-tab-list'
import { HeroTabContent } from './hero-tab-content'
import { HERO_SLIDES, HERO_CONTENT } from '@/app/_lib/landing-data'
import { cn } from '@/lib/utils'

interface HeroCarouselProps {
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
  className?: string
}

/**
 * Main hero carousel component
 *
 * Combines headline, tab navigation, and content panels.
 * Auto-rotates every 6 seconds, pauses on hover/focus.
 *
 * Layout structure:
 * - Headline + subheadline (centered)
 * - Tab navigation (Nova | Atlas | Sage)
 * - Content panel (image + text, animated)
 */
export function HeroCarousel({
  isAuthenticated,
  hasCompletedOnboarding,
  className
}: HeroCarouselProps) {
  return (
    <HeroCarouselProvider totalSlides={HERO_SLIDES.length} autoAdvanceInterval={6000}>
      <section className={cn('py-12 md:py-20', className)}>
        <Stack gap="loose" className="items-center">
          {/* Headline */}
          <Stack gap="default" className="text-center max-w-4xl mx-auto">
            <Display level={1} className="text-4xl md:text-5xl lg:text-6xl">
              {HERO_CONTENT.headline}
            </Display>
            <Body variant="large" className="text-muted-foreground max-w-2xl mx-auto">
              {HERO_CONTENT.subheadline}
            </Body>
          </Stack>

          {/* Tab navigation */}
          <HeroTabList assistants={HERO_SLIDES} className="mt-4" />

          {/* Content panel */}
          <HeroTabContent
            assistants={HERO_SLIDES}
            isAuthenticated={isAuthenticated}
            hasCompletedOnboarding={hasCompletedOnboarding}
            className="w-full mt-8"
          />
        </Stack>
      </section>
    </HeroCarouselProvider>
  )
}
