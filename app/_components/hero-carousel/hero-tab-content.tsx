'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Stack, Inline } from '@/components/ui/spacing'
import { Heading, Body } from '@/components/ui/typography'
import { useHeroCarousel } from './hero-carousel-context'
import type { AssistantSlide } from '@/app/_lib/types'

interface HeroTabContentProps {
  assistants: AssistantSlide[]
  isAuthenticated: boolean
  hasCompletedOnboarding: boolean
  className?: string
}

/**
 * Animation variants for slide transitions
 *
 * Pattern borrowed from auth-carousel.tsx:
 * - Enter from right (x: 20)
 * - Exit to left (x: -20)
 * - Smooth fade throughout
 */
const contentVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

/**
 * HeroVideo - Video player with viewport-based play/pause
 *
 * Uses IntersectionObserver to play when visible and pause when hidden.
 * Respects prefers-reduced-motion by falling back to poster image.
 */
function HeroVideo({
  src,
  poster,
  fallbackImage,
  alt
}: {
  src: string
  poster?: string
  fallbackImage: string
  alt: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasError, setHasError] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // IntersectionObserver for play/pause based on visibility
  useEffect(() => {
    const video = videoRef.current
    if (!video || prefersReducedMotion) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay may be blocked, that's ok
          })
        } else {
          video.pause()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [src, prefersReducedMotion])

  // Fallback to static image if video fails or reduced motion preferred
  if (hasError || prefersReducedMotion) {
    return (
      <Image
        src={fallbackImage}
        alt={alt}
        fill
        priority
        className="object-contain p-4 md:p-8"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    )
  }

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      autoPlay
      loop
      muted
      playsInline
      poster={poster}
      preload="metadata"
      onError={() => setHasError(true)}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}

/**
 * Content panel for hero carousel
 *
 * Shows assistant video/image and description with animated transitions.
 * Layout: Video/Image on left, text on right (reversed on mobile).
 */
export function HeroTabContent({
  assistants,
  isAuthenticated,
  hasCompletedOnboarding,
  className
}: HeroTabContentProps) {
  const { activeIndex, pause, resume } = useHeroCarousel()
  const assistant = assistants[activeIndex]

  return (
    <div
      className={className}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={assistant.id}
          role="tabpanel"
          id={`hero-panel-${assistant.id}`}
          aria-labelledby={`hero-tab-${assistant.id}`}
          initial="enter"
          animate="center"
          exit="exit"
          variants={contentVariants}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="grid md:grid-cols-2 gap-8 md:gap-12 items-center"
        >
          {/* Assistant video or image */}
          <div className="relative aspect-video md:aspect-square rounded-2xl bg-gradient-to-br from-muted to-muted/50 border border-border overflow-hidden order-1 md:order-1">
            {assistant.videoSrc ? (
              <HeroVideo
                src={assistant.videoSrc}
                poster={assistant.posterSrc}
                fallbackImage={assistant.heroImageUrl}
                alt={`${assistant.name} - ${assistant.tagline}`}
              />
            ) : (
              <Image
                src={assistant.heroImageUrl}
                alt={`${assistant.name} - ${assistant.tagline}`}
                fill
                priority
                className="object-contain p-4 md:p-8"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
          </div>

          {/* Text content */}
          <Stack gap="loose" className="order-2 md:order-2">
            <Stack gap="default">
              <Heading level={2} className="text-3xl md:text-4xl lg:text-5xl">
                Meet {assistant.name}
              </Heading>
              <Body variant="large" className="text-muted-foreground">
                {assistant.description}
              </Body>
            </Stack>

            {/* CTA buttons */}
            <Inline gap="tight" align="center" wrap>
              {isAuthenticated ? (
                <Link href={hasCompletedOnboarding ? '/home' : '/onboarding'}>
                  <Button size="lg" className="gap-2">
                    {hasCompletedOnboarding ? 'Go to Dashboard' : 'Complete Setup'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="gap-2">
                      Start with {assistant.name}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="ghost">
                      Sign in
                    </Button>
                  </Link>
                </>
              )}
            </Inline>
          </Stack>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
