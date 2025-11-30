/**
 * Mock Data for Remotion Scenes
 *
 * Static data used for rendering demo video scenes.
 * This ensures consistent rendering without database dependencies.
 */

// Mock user data for dashboard
export const mockUser = {
  id: "demo-user-1",
  name: "Alex Chen",
  email: "alex@example.com",
  image: "https://pub-a26093690f894023bad776cd3a80f3a8.r2.dev/anime.png",
  level: 12,
  points: 2450,
  streakDays: 7,
  totalLessonsCompleted: 24,
  totalCoursesCompleted: 3,
};

// Available assistants with speech bubbles
export const mockAssistants = [
  {
    id: "nova",
    name: "Nova",
    description: "Enthusiastic and encouraging, perfect for beginners",
    personality: "kind",
    avatarUrl: "https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/nova-feminine-headshot.png",
    speechBubble: "Ready to learn something new today? Let's dive in!",
  },
  {
    id: "atlas",
    name: "Atlas",
    description: "Structured and methodical, great for systematic learning",
    personality: "direct",
    avatarUrl: "https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/atlas-masculine-headshot.png",
    speechBubble: "Let's approach this systematically. What's your goal for today?",
  },
  {
    id: "sage",
    name: "Sage",
    description: "Thoughtful and patient, ideal for deep understanding",
    personality: "calm",
    avatarUrl: "https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/sage-androgynous-headshot.png",
    speechBubble: "Take your time. Understanding comes from patience and curiosity.",
  },
];

// Mock courses for course scene
export const mockCourses = [
  {
    id: "python-fundamentals",
    title: "Python Fundamentals",
    description: "Master the basics of Python programming",
    icon: "🐍",
    lessonsCount: 12,
    duration: "4 hours",
    progress: 75,
    difficulty: "Beginner",
  },
  {
    id: "javascript-essentials",
    title: "JavaScript Essentials",
    description: "Learn modern JavaScript from scratch",
    icon: "⚡",
    lessonsCount: 15,
    duration: "5 hours",
    progress: 40,
    difficulty: "Beginner",
  },
  {
    id: "data-structures",
    title: "Data Structures",
    description: "Essential data structures every developer needs",
    icon: "🏗️",
    lessonsCount: 10,
    duration: "6 hours",
    progress: 0,
    difficulty: "Intermediate",
  },
  {
    id: "web-development",
    title: "Web Development Basics",
    description: "Build your first website with HTML, CSS & JS",
    icon: "🌐",
    lessonsCount: 18,
    duration: "8 hours",
    progress: 100,
    difficulty: "Beginner",
  },
];

// Mock lessons for a course
export const mockLessons = [
  { id: "1", title: "Introduction to Python", completed: true, duration: "15 min" },
  { id: "2", title: "Variables and Data Types", completed: true, duration: "20 min" },
  { id: "3", title: "Control Flow", completed: true, duration: "25 min" },
  { id: "4", title: "Functions", completed: false, duration: "30 min" },
  { id: "5", title: "Lists and Tuples", completed: false, duration: "25 min" },
  { id: "6", title: "Dictionaries", completed: false, duration: "20 min" },
];

// Mock quick actions for dashboard
export const mockQuickActions = [
  { id: "courses", label: "Browse Courses", icon: "📚" },
  { id: "quiz", label: "Quick Quiz", icon: "🎯" },
  { id: "ask", label: "Ask Nova", icon: "💬" },
  { id: "practice", label: "Practice", icon: "💻" },
];

// Theme options for customization scene
export const mockThemes = [
  { id: "default", name: "Default", primary: "#000000", accent: "#3b82f6" },
  { id: "ocean", name: "Ocean", primary: "#0f172a", accent: "#0ea5e9" },
  { id: "forest", name: "Forest", primary: "#14532d", accent: "#22c55e" },
  { id: "sunset", name: "Sunset", primary: "#451a03", accent: "#f97316" },
  { id: "galaxy", name: "Galaxy", primary: "#1e1b4b", accent: "#8b5cf6" },
];

// Wallpaper options for study mode
export const mockWallpapers = [
  { id: "gradient-blue", name: "Blue Gradient", type: "gradient" },
  { id: "gradient-purple", name: "Purple Gradient", type: "gradient" },
  { id: "lofi-room", name: "Lofi Room", type: "video" },
  { id: "rain-window", name: "Rainy Window", type: "video" },
];

// Dashboard scene data
export const mockDashboard = {
  greeting: "Welcome back! Ready to continue your Python journey?",
  user: {
    name: "Alex",
    level: 5,
    xp: 2450,
    streak: 7,
    skillLevel: "intermediate",
  },
  recommendedCourse: {
    title: "Python Functions",
    progress: 60,
    nextLesson: "Return Values",
  },
  quickActions: [
    { label: "Continue Course", icon: "▶️" },
    { label: "Take Quiz", icon: "🧠" },
    { label: "Practice", icon: "💻" },
  ],
};

// CTA data for outro scene
export const mockCTA = {
  headline: "Your AI Learning Companion",
  button: "Get Started Free",
  subtext: "No credit card required",
};

// Hero scene chat scripts for landing page carousel
export const mockHeroChats = {
  nova: {
    messages: [
      {
        role: "assistant" as const,
        text: "Ready to learn something amazing today? Let's dive in!",
      },
      {
        role: "user" as const,
        text: "I want to learn Python basics",
      },
      {
        role: "assistant" as const,
        text: "Perfect choice! Python is beginner-friendly. Let's start with variables!",
      },
    ],
    gradient: {
      colors: ["#667eea", "#ec4899", "#8b5cf6"],
      angle: 135,
    },
    particleStyle: "sparkle" as const,
  },
  atlas: {
    messages: [
      {
        role: "assistant" as const,
        text: "Let's approach this systematically. What's your learning goal?",
      },
      {
        role: "user" as const,
        text: "I need to understand data structures",
      },
      {
        role: "assistant" as const,
        text: "We'll cover arrays, then linked lists, then trees. Step by step.",
      },
    ],
    gradient: {
      colors: ["#1e3a5f", "#0d9488", "#164e63"],
      angle: 135,
    },
    particleStyle: "grid" as const,
  },
  sage: {
    messages: [
      {
        role: "assistant" as const,
        text: "Take your time. What would you like to explore today?",
      },
      {
        role: "user" as const,
        text: "I'm struggling with recursion",
      },
      {
        role: "assistant" as const,
        text: "Recursion is like looking into a mirror reflecting a mirror. Let's explore together.",
      },
    ],
    gradient: {
      colors: ["#14532d", "#d97706", "#365314"],
      angle: 135,
    },
    particleStyle: "float" as const,
  },
} as const;

export type HeroChatData = typeof mockHeroChats[keyof typeof mockHeroChats];

// Feature video data for landing page feature sections
export const mockFeatureVideos = {
  courseCreation: {
    courseTitle: "Python Fundamentals",
    courseIcon: "🐍",
    lessons: [
      { title: "Introduction to Python", duration: "10 min", status: "complete" as const },
      { title: "Variables & Data Types", duration: "15 min", status: "complete" as const },
      { title: "Control Flow", duration: "20 min", status: "in-progress" as const },
      { title: "Functions", duration: "25 min", status: "locked" as const },
      { title: "Lists & Dictionaries", duration: "20 min", status: "locked" as const },
    ],
  },
  studyMode: {
    lessonTitle: "Python Functions",
    messages: [
      {
        role: "assistant" as const,
        text: "Let's learn about functions! They help organize reusable code.",
      },
      {
        role: "user" as const,
        text: "How do I define a function with parameters?",
      },
      {
        role: "assistant" as const,
        text: "Great question! Here's how you define a function:",
        hasCode: true,
      },
    ],
    codeExample: `def greet(name):
    return f"Hello, {name}!"

# Try it out
greet("Alex")  # Returns "Hello, Alex!"`,
  },
  gamification: {
    xpEarned: 50,
    totalXp: 2450,
    xpToNextLevel: 3000,
    streak: 7,
    levelProgress: 82,
    newBadge: {
      name: "Python Pioneer",
      icon: "🐍",
      description: "Complete your first Python lesson",
    },
  },
} as const;

export type FeatureVideoData = typeof mockFeatureVideos;
