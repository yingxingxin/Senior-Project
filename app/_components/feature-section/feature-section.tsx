'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Stack, Grid } from '@/components/ui/spacing'
import { Heading, Body, Muted } from '@/components/ui/typography'
import { FeatureVideo } from './feature-video'
import { cn } from '@/lib/utils'
import type { FeatureData } from '@/app/_lib/types'

interface FeatureSectionProps {
  feature: FeatureData
  className?: string
}

/**
 * Animation variants for scroll-triggered reveal
 *
 * Elements fade in and slide up when they enter the viewport.
 * Using `once: true` so animation only plays on first scroll.
 */
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const }
  }
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
}

/**
 * Feature section with "river" layout
 *
 * Pattern adapted from GitHub's homepage:
 * - Alternating left/right layout for visual interest
 * - One side has video/visual content
 * - Other side has text with headline, description, and highlights
 *
 * Scroll-reveal animation triggers when section enters viewport.
 */
export function FeatureSection({ feature, className }: FeatureSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const isVideoLeft = feature.imagePosition === 'left'

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={sectionVariants}
      className={cn('py-16 md:py-24', className)}
    >
      <Grid
        cols={1}
        gap="loose"
        className={cn(
          'md:grid-cols-2 items-center',
          // Reverse grid order based on image position
          isVideoLeft ? '' : 'md:[&>*:first-child]:order-2'
        )}
      >
        {/* Video/Visual */}
        <FeatureVideo
          src={feature.videoSrc}
          poster={feature.posterSrc}
        />

        {/* Text content */}
        <Stack gap="default">
          <Stack gap="tight">
            <Heading level={2} className="text-3xl md:text-4xl">
              {feature.title}
            </Heading>
            <Body variant="large" className="text-muted-foreground">
              {feature.description}
            </Body>
          </Stack>

          {/* Feature highlights */}
          {feature.highlights.length > 0 && (
            <motion.ul
              variants={listVariants}
              className="space-y-3 mt-4"
            >
              {feature.highlights.map((highlight) => (
                <motion.li
                  key={highlight}
                  variants={itemVariants}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <Muted className="text-foreground">{highlight}</Muted>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </Stack>
      </Grid>
    </motion.section>
  )
}
