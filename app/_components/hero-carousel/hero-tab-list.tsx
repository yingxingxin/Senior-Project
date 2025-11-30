'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useHeroCarousel } from './hero-carousel-context'
import type { AssistantSlide } from '@/app/_lib/types'

interface HeroTabListProps {
  assistants: AssistantSlide[]
  className?: string
}

/**
 * Tab navigation for hero carousel
 *
 * Design decision: Using custom tab buttons instead of Radix Tabs
 * to have full control over the animated indicator with Framer Motion's
 * layoutId. Radix Tabs would require more workarounds for the sliding
 * underline animation.
 *
 * Accessibility: Using button role with aria-selected for tab semantics.
 */
export function HeroTabList({ assistants, className }: HeroTabListProps) {
  const { activeIndex, setActiveIndex, pause, resume } = useHeroCarousel()

  return (
    <nav
      role="tablist"
      aria-label="Choose an AI assistant"
      className={cn(
        'flex items-center justify-center gap-2 md:gap-4',
        className
      )}
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      {assistants.map((assistant, index) => (
        <button
          key={assistant.id}
          role="tab"
          aria-selected={activeIndex === index}
          aria-controls={`hero-panel-${assistant.id}`}
          onClick={() => setActiveIndex(index)}
          className={cn(
            'relative flex items-center gap-2 md:gap-3 px-4 py-3 md:px-6 md:py-4 rounded-xl transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            activeIndex === index
              ? 'text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          {/* Avatar */}
          <div className="relative h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden border-2 border-border">
            <Image
              src={assistant.avatarUrl}
              alt=""
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>

          {/* Name and tagline (hidden on mobile) */}
          <div className="hidden md:block text-left">
            <div className="font-semibold">{assistant.name}</div>
            <div className="text-xs text-muted-foreground">
              {assistant.tagline}
            </div>
          </div>

          {/* Mobile: just name */}
          <span className="md:hidden font-medium">{assistant.name}</span>

          {/* Animated underline indicator */}
          {activeIndex === index && (
            <motion.div
              layoutId="hero-tab-indicator"
              className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </nav>
  )
}
