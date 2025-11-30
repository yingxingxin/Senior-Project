/**
 * Landing page types
 *
 * These types are specific to the landing page and hero carousel.
 * Using separate types from database schemas to allow flexibility
 * in how content is presented.
 */

export interface AssistantSlide {
  id: 'nova' | 'atlas' | 'sage'
  name: string
  tagline: string
  description: string
  heroImageUrl: string
  avatarUrl: string
  persona: 'calm' | 'kind' | 'direct'
  videoSrc?: string
  posterSrc?: string
}

export interface FeatureData {
  id: string
  title: string
  description: string
  videoSrc?: string
  posterSrc?: string
  highlights: string[]
  imagePosition: 'left' | 'right'
}

export interface TestimonialData {
  id: string
  quote: string
  author: string
  role: string
  avatarUrl?: string
  metric?: {
    value: string
    label: string
  }
}
