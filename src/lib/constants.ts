/**
 * This is basically a copy of the assistants table and the assistant_persona enum
 * 
 * TODO: If we keep assistants table in the database, these exports are not needed. It can be moved to seed file.
 */
export const ASSISTANT_FIXTURES = [
  {
    slug: 'nova-feminine',
    name: 'Nova',
    gender: 'feminine' as const,
    avatar_url: 'https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/nova-feminine-headshot.png',
    hero_url: 'https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/nova-feminine-full-body.png',
    tagline: 'Brilliant strategist with infectious enthusiasm.',
    description:
      'Breaks down complex problems into achievable wins, celebrating each milestone with genuine excitement.',
  },
  {
    slug: 'atlas-masculine',
    name: 'Atlas',
    gender: 'masculine' as const,
    avatar_url: 'https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/atlas-masculine-headshot.png',
    hero_url: 'https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/atlas-masculine-full-body.png',
    tagline: 'Steady mentor with years of wisdom.',
    description:
      'Draws from deep experience to guide you through challenges, knowing exactly when to push and when to pause.',
  },
  {
    slug: 'sage-androgynous',
    name: 'Sage',
    gender: 'androgynous' as const,
    avatar_url: 'https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/sage-androgynous-headshot.png',
    hero_url: 'https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/sage-androgynous-full-body.png',
    tagline: 'Intuitive guide who reads between the lines.',
    description:
      'Picks up on your learning style quickly, adapting explanations to match how you think best.',
  },
] as const;

export type AssistantFixture = (typeof ASSISTANT_FIXTURES)[number];

export interface PersonaOption {
  id: 'calm' | 'kind' | 'direct';
  title: string;
  subtitle: string;
  preview: string;
  highlights: ReadonlyArray<string>;
}

export const PERSONA_OPTIONS: ReadonlyArray<PersonaOption> = [
  {
    id: 'calm',
    title: 'Calm',
    subtitle: 'Grounded, focused, and reassuring.',
    preview:
      "Let's take it one step at a time. Here's the key idea again, with a steady pace so it really sticks.",
    highlights: [
      'Even tempo explanations',
      'Focus reminders without pressure',
      'Calls out the most important takeaway',
    ],
  },
  {
    id: 'kind',
    title: 'Kind',
    subtitle: 'Encouraging and expressive cheerleader.',
    preview:
      "You’re doing great! I’ll walk through it once more with a new example so it clicks, promise!",
    highlights: [
      'Warm, personable tone',
      'Celebrates progress often',
      'Offers alternative examples proactively',
    ],
  },
  {
    id: 'direct',
    title: 'Direct',
    subtitle: 'Straight-talking and efficient.',
    preview:
      "Here’s the critical piece you’re missing. Apply this rule and you’ll solve the rest quickly.",
    highlights: [
      'Succinct, no-frills guidance',
      'Pins down the root of the problem fast',
      'Keeps sessions tightly on-track',
    ],
  },
];

export type AssistantPersona = PersonaOption['id'];

// Course data structure
export interface Course {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'standard' | 'hard';
  estimatedDuration: string;
  lessonsCount: number;
  icon: string;
  color: string;
}

export const COURSES: ReadonlyArray<Course> = [
  {
    id: 'programming-foundations',
    title: 'Programming Foundations',
    description: 'Learn the fundamentals of programming from scratch. Perfect for beginners!',
    difficulty: 'easy',
    estimatedDuration: '8-12 weeks',
    lessonsCount: 24,
    icon: '💻',
    color: 'bg-blue-500',
  },
  {
    id: 'data-structures-algorithms',
    title: 'Data Structures & Algorithms',
    description: 'Master the core data structures and algorithmic thinking.',
    difficulty: 'standard',
    estimatedDuration: '10-14 weeks',
    lessonsCount: 32,
    icon: '🔗',
    color: 'bg-green-500',
  },
  {
    id: 'oop-principles',
    title: 'Object-Oriented Programming',
    description: 'Learn OOP principles and best practices.',
    difficulty: 'standard',
    estimatedDuration: '12-16 weeks',
    lessonsCount: 28,
    icon: '☕',
    color: 'bg-orange-500',
  },
] as const;

// Skill level to recommended course mapping
// These slugs must match the actual course slugs in the database
export const SKILL_LEVEL_RECOMMENDATIONS: Record<string, string> = {
  'beginner': 'programming-foundations',
  'intermediate': 'data-structures-algorithms',
  'advanced': 'oop-principles',
} as const;
