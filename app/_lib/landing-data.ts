/**
 * Static content for the landing page
 *
 * Centralizes all copy and content for easier maintenance.
 * Video sources will be added once Remotion videos are rendered.
 */

import { ASSISTANT_FIXTURES } from '@/src/lib/constants'
import type { AssistantSlide, FeatureData } from './types'

export const HERO_SLIDES: AssistantSlide[] = [
  {
    id: 'nova',
    name: 'Nova',
    tagline: 'Enthusiastic & Encouraging',
    description: 'Nova brings energy and positivity to every session. Perfect for learners who thrive with cheerful support and collaborative study sessions.',
    heroImageUrl: ASSISTANT_FIXTURES[0].hero_url,
    avatarUrl: ASSISTANT_FIXTURES[0].avatar_url,
    persona: 'kind',
    videoSrc: '/videos/nova-hero.mp4',
    posterSrc: '/videos/nova-hero-poster.jpg'
  },
  {
    id: 'atlas',
    name: 'Atlas',
    tagline: 'Structured & Strategic',
    description: 'Organized and methodical, Atlas excels at breaking down complex topics into clear, structured learning paths. Ideal for learners who prefer systematic approaches.',
    heroImageUrl: ASSISTANT_FIXTURES[1].hero_url,
    avatarUrl: ASSISTANT_FIXTURES[1].avatar_url,
    persona: 'direct',
    videoSrc: '/videos/atlas-hero.mp4',
    posterSrc: '/videos/atlas-hero-poster.jpg'
  },
  {
    id: 'sage',
    name: 'Sage',
    tagline: 'Calm & Thoughtful',
    description: 'Calm and reflective, Sage encourages deep thinking through thoughtful dialogue and open-ended questions. Best for learners who value contemplative discussions.',
    heroImageUrl: ASSISTANT_FIXTURES[2].hero_url,
    avatarUrl: ASSISTANT_FIXTURES[2].avatar_url,
    persona: 'calm',
    videoSrc: '/videos/sage-hero.mp4',
    posterSrc: '/videos/sage-hero-poster.jpg'
  }
]

export const FEATURES: FeatureData[] = [
  {
    id: 'course-creation',
    title: 'AI-Powered Course Generation',
    description: 'Tell us what you want to learn, and our AI creates a personalized course tailored to your skill level and learning goals.',
    videoSrc: '/videos/course-creation.mp4',
    highlights: [
      'Personalized learning paths',
      'Adaptive difficulty levels',
      'Real-time content generation'
    ],
    imagePosition: 'right'
  },
  {
    id: 'study-mode',
    title: 'Focus on Learning',
    description: 'Enter study mode for a distraction-free environment with real-time AI assistance. Ask questions, get code examples, and master concepts through conversation.',
    videoSrc: '/videos/study-mode.mp4',
    highlights: [
      'Distraction-free environment',
      'Real-time AI assistance',
      'Interactive code examples'
    ],
    imagePosition: 'left'
  },
  {
    id: 'gamification',
    title: 'Gamified Learning',
    description: 'Earn XP, maintain streaks, and unlock achievements as you learn. Stay motivated with a system designed to celebrate your progress.',
    videoSrc: '/videos/gamification.mp4',
    highlights: [
      'XP and level progression',
      'Achievement badges',
      'Daily streak tracking'
    ],
    imagePosition: 'right'
  }
]

export const HERO_CONTENT = {
  headline: 'Learn faster with an assistant that adapts to you',
  subheadline: 'Choose your AI companion and start your personalized learning journey. Sprite.exe pairs you with a personal AI partner to keep lessons engaging and help you stay accountable.',
  primaryCta: 'Start learning for free',
  secondaryCta: 'I already have an account'
}

export const CTA_CONTENT = {
  headline: 'Start your learning journey today',
  description: 'Launch your assistant, set a goal for this week, and start building a learning habit you can sustain.',
  primaryCta: 'Create your assistant',
  secondaryCta: 'Already using Sprite.exe?'
}
