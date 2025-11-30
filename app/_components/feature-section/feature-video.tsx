'use client'

import { useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface FeatureVideoProps {
  src?: string
  poster?: string
  className?: string
}

/**
 * Video component with lazy loading and viewport-based play/pause
 *
 * Design decision: Using native HTML5 video instead of Remotion Player
 * for better performance. Videos are muted and loop by default for
 * seamless background playback.
 *
 * Performance:
 * - IntersectionObserver plays/pauses based on visibility
 * - preload="metadata" to minimize initial load
 * - Poster image shows while video loads
 *
 * Falls back to skeleton when no video source is provided.
 */
export function FeatureVideo({ src, poster, className }: FeatureVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay may be blocked, that's ok
          })
        } else {
          video.pause()
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [src])

  // Show skeleton placeholder if no video source
  if (!src || hasError) {
    return (
      <div
        className={cn(
          'aspect-video rounded-2xl bg-muted border border-border overflow-hidden',
          'flex items-center justify-center',
          className
        )}
      >
        <div className="text-center p-8">
          <Skeleton className="w-full h-full absolute inset-0" />
          <div className="relative z-10 text-muted-foreground text-sm">
            Video coming soon
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'aspect-video rounded-2xl overflow-hidden border border-border',
        'shadow-lg',
        className
      )}
    >
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
    </div>
  )
}
