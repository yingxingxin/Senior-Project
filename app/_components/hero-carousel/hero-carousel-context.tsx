'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode
} from 'react'
import { useCarouselTimer } from './use-carousel-timer'

interface HeroCarouselContextValue {
  activeIndex: number
  setActiveIndex: (index: number) => void
  isPaused: boolean
  pause: () => void
  resume: () => void
  totalSlides: number
}

const HeroCarouselContext = createContext<HeroCarouselContextValue | null>(null)

interface HeroCarouselProviderProps {
  children: ReactNode
  totalSlides: number
  autoAdvanceInterval?: number
}

/**
 * Provider for hero carousel state
 *
 * Design decision: Using React Context instead of prop drilling
 * because tabs, content panels, and timer all need access to
 * shared state. Context keeps the API clean and allows components
 * to be composed flexibly.
 */
export function HeroCarouselProvider({
  children,
  totalSlides,
  autoAdvanceInterval = 6000
}: HeroCarouselProviderProps) {
  const [activeIndex, setActiveIndexState] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])

  // Memoize to prevent unnecessary re-renders in timer
  const handleAdvance = useCallback((nextIndex: number) => {
    setActiveIndexState(nextIndex)
  }, [])

  // Manual selection resets timer by updating currentIndex
  const setActiveIndex = useCallback((index: number) => {
    setActiveIndexState(index)
  }, [])

  useCarouselTimer({
    totalSlides,
    interval: autoAdvanceInterval,
    isPaused,
    onAdvance: handleAdvance,
    currentIndex: activeIndex
  })

  return (
    <HeroCarouselContext.Provider
      value={{
        activeIndex,
        setActiveIndex,
        isPaused,
        pause,
        resume,
        totalSlides
      }}
    >
      {children}
    </HeroCarouselContext.Provider>
  )
}

export function useHeroCarousel() {
  const ctx = useContext(HeroCarouselContext)
  if (!ctx) {
    throw new Error('useHeroCarousel must be used within HeroCarouselProvider')
  }
  return ctx
}
