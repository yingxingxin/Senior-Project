"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Stack } from "@/components/ui/spacing"
import { Display, Muted } from "@/components/ui/typography"
import { ASSISTANT_FIXTURES } from "@/src/lib/constants"

interface Slide {
  image: string
  heading: string
  description: string
}

const slides: Slide[] = ASSISTANT_FIXTURES.map((assistant) => ({
  image: assistant.hero_url,
  heading: `Meet ${assistant.name}`,
  description: assistant.tagline,
}))

export function AuthCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPaused])

  const handleDotClick = (index: number) => {
    setCurrentIndex(index)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background image */}
          <Image
            src={slides[currentIndex].image}
            alt={slides[currentIndex].heading}
            fill
            priority
            className="object-cover"
          />

          {/* Localized dark gradient for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/60 to-transparent" />

          {/* Text content overlay */}
          <div className="absolute inset-0 flex items-end p-8 lg:p-12">
            <Stack gap="tight" className="w-full max-w-2xl">
              <Display level={2} className="text-primary-foreground drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {slides[currentIndex].heading}
              </Display>
              <Muted className="text-primary-foreground/95 drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)] text-lg">
                {slides[currentIndex].description}
              </Muted>
            </Stack>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Arrow controls */}
      <button
        onClick={handlePrevious}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/40 backdrop-blur-sm hover:bg-background/60 text-primary-foreground border-2 border-primary-foreground/30 hover:border-primary-foreground/50 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
      >
        <ChevronLeft className="size-6" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/40 backdrop-blur-sm hover:bg-background/60 text-primary-foreground border-2 border-primary-foreground/30 hover:border-primary-foreground/50 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
      >
        <ChevronRight className="size-6" />
      </button>

      {/* Position indicators (dots) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-primary-foreground/40 hover:bg-primary-foreground/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
