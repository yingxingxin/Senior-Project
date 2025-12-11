/**
 * Mock Data for Poster Still Compositions
 *
 * Realistic data to create polished poster screenshots
 * showing an engaged user with activity across all features.
 */

// ============ USER DATA ============

export const posterUser = {
  id: 1,
  name: "Alex Chen",
  email: "alex@example.com",
  image: "https://pub-a26093690f894023bad776cd3a80f3a8.r2.dev/anime.png",
  level: 7,
  points: 6250,
  streakDays: 12,
  skillLevel: "intermediate" as const,
  levelProgress: {
    level: 7,
    percent: 62,
    pointsToNext: 750,
    currentLevelXp: 1250,
    nextLevelXp: 2000,
  },
  badges: [
    { name: "Python Pioneer", icon: "🐍" },
    { name: "Week Warrior", icon: "🔥" },
    { name: "Quiz Master", icon: "🎯" },
  ],
};

// ============ ASSISTANT DATA ============

export const posterAssistant = {
  id: 1,
  name: "Nova",
  slug: "nova",
  persona: "kind" as const,
  gender: "feminine" as const,
  avatarUrl: "https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/nova-feminine-headshot.png",
  tagline: "Your enthusiastic learning companion",
  description: "Enthusiastic and encouraging, perfect for building confidence",
  greeting: "Good morning, Alex! Ready to continue your Python journey? I'm here to help!",
};

// All assistants for onboarding
export const posterAssistants = [
  {
    id: 1,
    name: "Nova",
    slug: "nova",
    gender: "feminine" as const,
    avatarUrl: "https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/nova-feminine-headshot.png",
    tagline: "Enthusiastic & Encouraging",
    description: "Perfect for beginners who want a supportive, cheerful companion",
  },
  {
    id: 2,
    name: "Atlas",
    slug: "atlas",
    gender: "masculine" as const,
    avatarUrl: "https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/atlas-masculine-headshot.png",
    tagline: "Structured & Strategic",
    description: "Ideal for systematic learners who appreciate clear roadmaps",
  },
  {
    id: 3,
    name: "Sage",
    slug: "sage",
    gender: "androgynous" as const,
    avatarUrl: "https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/sage-androgynous-headshot.png",
    tagline: "Calm & Thoughtful",
    description: "Best for deep thinkers who value patience and understanding",
  },
];

// ============ COURSES DATA ============

export const posterCourses = {
  curated: [
    {
      id: 1,
      slug: "python-fundamentals",
      title: "Python Fundamentals",
      description: "Master the basics of Python programming with hands-on exercises",
      icon: "🐍",
      difficulty: "beginner" as const,
      lessonsCount: 8,
      estimatedDurationSec: 14400, // 4 hours
      progress: 75,
    },
    {
      id: 2,
      slug: "web-development",
      title: "Web Development Essentials",
      description: "Build modern websites with HTML, CSS, and JavaScript",
      icon: "🌐",
      difficulty: "intermediate" as const,
      lessonsCount: 12,
      estimatedDurationSec: 21600, // 6 hours
      progress: 40,
    },
    {
      id: 3,
      slug: "data-structures",
      title: "Data Structures & Algorithms",
      description: "Essential computer science concepts every developer needs",
      icon: "🔗",
      difficulty: "advanced" as const,
      lessonsCount: 10,
      estimatedDurationSec: 28800, // 8 hours
      progress: 0,
    },
  ],
  userCreated: [
    {
      id: 101,
      slug: "react-patterns",
      title: "Advanced React Patterns",
      description: "Deep dive into hooks, context, and performance optimization",
      icon: "⚛️",
      difficulty: "advanced" as const,
      lessonsCount: 6,
      estimatedDurationSec: 10800, // 3 hours
      progress: 20,
      isAI: true,
    },
  ],
};

// ============ QUIZZES DATA ============

export const posterQuizzes = {
  javascript: {
    topic: "JavaScript",
    quizzes: [
      {
        id: 1,
        slug: "js-variables",
        title: "Variables & Data Types",
        description: "Test your knowledge of JavaScript fundamentals",
        skillLevel: "beginner" as const,
        questionsCount: 10,
        completed: true,
        bestScore: 92,
      },
      {
        id: 2,
        slug: "js-functions",
        title: "Functions & Scope",
        description: "Master JavaScript functions and closures",
        skillLevel: "beginner" as const,
        questionsCount: 8,
        completed: true,
        bestScore: 88,
      },
      {
        id: 3,
        slug: "js-async",
        title: "Async/Await & Promises",
        description: "Handle asynchronous operations like a pro",
        skillLevel: "intermediate" as const,
        questionsCount: 12,
        completed: false,
        bestScore: null,
      },
    ],
  },
  python: {
    topic: "Python",
    quizzes: [
      {
        id: 4,
        slug: "py-syntax",
        title: "Python Syntax Basics",
        description: "Foundation concepts of Python programming",
        skillLevel: "beginner" as const,
        questionsCount: 10,
        completed: true,
        bestScore: 95,
      },
      {
        id: 5,
        slug: "py-data-structures",
        title: "Lists, Dicts & Tuples",
        description: "Work with Python's built-in data structures",
        skillLevel: "beginner" as const,
        questionsCount: 8,
        completed: false,
        bestScore: null,
      },
    ],
  },
};

// ============ LEADERBOARD DATA ============

export const posterLeaderboard = {
  exercise: "FizzBuzz Challenge",
  language: "All Languages",
  entries: [
    { rank: 1, name: "Sarah Kim", email: "sarah@example.com", lang: "JavaScript", timeMs: 12340 },
    { rank: 2, name: "Alex Chen", email: "alex@example.com", lang: "TypeScript", timeMs: 15210, isCurrentUser: true },
    { rank: 3, name: "Marcus Johnson", email: "marcus@example.com", lang: "Python", timeMs: 18560 },
    { rank: 4, name: "Emma Wilson", email: "emma@example.com", lang: "JavaScript", timeMs: 19430 },
    { rank: 5, name: "David Park", email: "david@example.com", lang: "TypeScript", timeMs: 21890 },
    { rank: 6, name: "Lisa Chen", email: "lisa@example.com", lang: "Python", timeMs: 23120 },
    { rank: 7, name: "James Rodriguez", email: "james@example.com", lang: "Java", timeMs: 24560 },
    { rank: 8, name: "Anna Smith", email: "anna@example.com", lang: "JavaScript", timeMs: 26780 },
  ],
};

// ============ FRIENDS DATA ============

export const posterFriends = {
  pendingRequests: [
    {
      id: 1,
      requesterId: 101,
      requesterHandle: "jstevens",
      requesterDisplayName: "Jake Stevens",
      requesterAvatarUrl: null,
      createdAt: new Date("2024-12-01"),
    },
    {
      id: 2,
      requesterId: 102,
      requesterHandle: "mrodriguez",
      requesterDisplayName: "Maria Rodriguez",
      requesterAvatarUrl: null,
      createdAt: new Date("2024-11-28"),
    },
  ],
  friends: [
    {
      userId: 201,
      handle: "sarahchen",
      displayName: "Sarah Chen",
      tagline: "Learning TypeScript and React",
      avatarUrl: null,
    },
    {
      userId: 202,
      handle: "davidpark",
      displayName: "David Park",
      tagline: "JavaScript enthusiast • Coffee lover",
      avatarUrl: null,
    },
    {
      userId: 203,
      handle: "jmartinez",
      displayName: "Jessica Martinez",
      tagline: "Full-stack developer | AI learner",
      avatarUrl: null,
    },
    {
      userId: 204,
      handle: "athompson",
      displayName: "Alex Thompson",
      tagline: null,
      avatarUrl: null,
    },
  ],
};

// ============ STUDY CHAT DATA ============

export const posterStudyChat = {
  lessonTitle: "Python Functions",
  messages: [
    {
      id: 1,
      role: "user" as const,
      text: "Can you explain how recursion works?",
    },
    {
      id: 2,
      role: "assistant" as const,
      text: "Of course! Recursion is when a function calls itself to solve smaller instances of the same problem. Here's a classic example with factorials:",
    },
    {
      id: 3,
      role: "assistant" as const,
      text: null,
      code: `def factorial(n):
    # Base case: stop when n is 0 or 1
    if n <= 1:
        return 1
    # Recursive case: n * factorial of (n-1)
    return n * factorial(n - 1)

# Example: factorial(5) = 5 * 4 * 3 * 2 * 1 = 120
print(factorial(5))  # Output: 120`,
    },
    {
      id: 4,
      role: "user" as const,
      text: "That makes sense! So the base case is what stops it from running forever?",
    },
    {
      id: 5,
      role: "assistant" as const,
      text: "Exactly! Without a base case, you'd get infinite recursion. The base case is like the exit door. Every recursive call should move closer to that exit.",
    },
  ],
};

// ============ LANDING PAGE DATA ============

export const posterLanding = {
  hero: {
    headline: "Learn to Code with Your AI Companion",
    subheadline: "Personalized lessons, instant feedback, and a friend who adapts to your learning style",
    cta: "Get Started Free",
  },
  features: [
    {
      title: "AI-Powered Courses",
      description: "Generate custom courses tailored to your goals",
      icon: "✨",
    },
    {
      title: "Interactive Study Mode",
      description: "Chat with your AI tutor while you learn",
      icon: "💬",
    },
    {
      title: "Track Your Progress",
      description: "Earn XP, maintain streaks, unlock achievements",
      icon: "🏆",
    },
  ],
};

// ============ ONBOARDING DATA ============

export const posterOnboarding = {
  welcome: {
    title: "Welcome to Sprite",
    subtitle: "Your personalized AI learning companion",
    description: "Let's set up your learning experience in just a few steps",
  },
  gender: {
    title: "Choose Your Companion",
    subtitle: "Select the assistant that feels right for you",
    options: posterAssistants,
  },
  persona: {
    title: "Choose Your Teaching Style",
    subtitle: "How would you like your assistant to communicate?",
    options: [
      {
        id: "kind",
        name: "Encouraging",
        description: "Supportive and celebratory, great for building confidence",
        icon: "💖",
      },
      {
        id: "direct",
        name: "Structured",
        description: "Clear and systematic, perfect for goal-oriented learners",
        icon: "📋",
      },
      {
        id: "calm",
        name: "Thoughtful",
        description: "Patient and reflective, ideal for deep understanding",
        icon: "🧘",
      },
    ],
  },
};

// ============ HELPER FUNCTIONS ============

/**
 * Format milliseconds to mm:ss.ms format
 */
export function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
}

/**
 * Format seconds to human-readable duration
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Get initials from name for avatar fallback
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
