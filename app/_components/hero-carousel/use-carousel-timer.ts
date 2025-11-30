'use client'

import { useEffect, useRef } from 'react'

interface UseCarouselTimerOptions {
  totalSlides: number
  interval: number
  isPaused: boolean
  onAdvance: (nextIndex: number) => void
  currentIndex: number
}

/**
 * Hook for auto-advancing carousel slides
 *
 * Design decision: Extracted from inline useEffect to be reusable
 * and testable. Resets timer when user manually selects a tab
 * to provide full interval before next auto-advance.
 */
export function useCarouselTimer({
  totalSlides,
  interval,
  isPaused,
  onAdvance,
  currentIndex
}: UseCarouselTimerOptions): void {
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Don't start timer if paused or only one slide
    if (isPaused || totalSlides <= 1) {
      return
    }

    intervalRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % totalSlides
      onAdvance(nextIndex)
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPaused, totalSlides, interval, currentIndex, onAdvance])
}
