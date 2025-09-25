import { db, assistants, achievements, lessons, lesson_sections, themes, levels } from './index';
import { ASSISTANT_FIXTURES } from '../lib/onboarding/fixtures';

type AssistantSeed = typeof assistants.$inferInsert;

export async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Seed assistants from existing fixtures
    console.log("Creating assistants...");
    for (const option of ASSISTANT_FIXTURES) {
      await db
        .insert(assistants)
        .values(option as AssistantSeed)
        .onConflictDoUpdate({
          target: assistants.slug,
          set: {
            name: option.name,
            gender: option.gender,
            avatar_url: option.avatar_url,
            tagline: option.tagline,
            description: option.description,
            updated_at: new Date(),
          },
        });
    }

    // Seed achievements
    console.log("Creating achievements...");
    await db.insert(achievements).values([
      {
        code: "FIRST_LESSON",
        name: "First Steps",
        description: "Complete your first lesson",
        icon_url: "/icons/trophy.png",
        rarity: "common",
        points_reward: 10,
        is_active: true,
      },
      {
        code: "STREAK_3",
        name: "Streak Starter",
        description: "Maintain a 3-day streak",
        icon_url: "/icons/flame.png",
        rarity: "common",
        points_reward: 25,
        is_active: true,
      },
      {
        code: "FIRST_QUIZ",
        name: "Quiz Master",
        description: "Pass your first quiz",
        icon_url: "/icons/star.png",
        rarity: "common",
        points_reward: 15,
        is_active: true,
      },
      {
        code: "EXPLORER",
        name: "Explorer",
        description: "Try 3 different topics",
        icon_url: "/icons/award.png",
        rarity: "uncommon",
        points_reward: 30,
        is_active: true,
      },
      {
        code: "PERFECT_QUIZ",
        name: "Perfect Score",
        description: "Get 100% on any quiz",
        icon_url: "/icons/star.png",
        rarity: "uncommon",
        points_reward: 50,
        is_active: true,
      },
      {
        code: "STREAK_7",
        name: "Week Warrior",
        description: "Maintain a 7-day streak",
        icon_url: "/icons/flame.png",
        rarity: "rare",
        points_reward: 75,
        is_active: true,
      },
      {
        code: "LEVEL_5",
        name: "Rising Star",
        description: "Reach level 5",
        icon_url: "/icons/trophy.png",
        rarity: "rare",
        points_reward: 100,
        is_active: true,
      },
      {
        code: "STREAK_30",
        name: "Dedicated Learner",
        description: "Maintain a 30-day streak",
        icon_url: "/icons/flame.png",
        rarity: "epic",
        points_reward: 200,
        is_active: true,
      },
      {
        code: "LEVEL_10",
        name: "Master",
        description: "Reach level 10",
        icon_url: "/icons/trophy.png",
        rarity: "legendary",
        points_reward: 500,
        is_active: true,
      },
    ]).onConflictDoNothing();

    // Seed sample lessons
    console.log("Creating sample lessons...");
    const lessonIds = await db.insert(lessons).values([
      {
        slug: "intro-to-programming",
        title: "Introduction to Programming",
        description: "Learn the fundamentals of programming with hands-on examples",
        difficulty: "easy",
        estimated_duration_sec: 1800, // 30 minutes
      },
      {
        slug: "web-development-basics",
        title: "Web Development Basics",
        description: "Build your first website with HTML, CSS, and JavaScript",
        difficulty: "easy",
        estimated_duration_sec: 2700, // 45 minutes
      },
      {
        slug: "database-fundamentals",
        title: "Database Fundamentals",
        description: "Understanding databases, SQL, and data management",
        difficulty: "standard",
        estimated_duration_sec: 3600, // 60 minutes
      },
      {
        slug: "advanced-javascript",
        title: "Advanced JavaScript Concepts",
        description: "Deep dive into closures, prototypes, and async programming",
        difficulty: "hard",
        estimated_duration_sec: 5400, // 90 minutes
      },
      {
        slug: "react-essentials",
        title: "React Essentials",
        description: "Learn to build modern web applications with React",
        difficulty: "standard",
        estimated_duration_sec: 4200, // 70 minutes
      },
      {
        slug: "python-data-science",
        title: "Python for Data Science",
        description: "Data analysis and visualization with Python",
        difficulty: "standard",
        estimated_duration_sec: 4800, // 80 minutes
      },
    ]).onConflictDoNothing().returning();

    // Add lesson sections for the first lesson
    if (lessonIds.length > 0) {
      console.log("Creating lesson sections...");
      await db.insert(lesson_sections).values([
        {
          lesson_id: lessonIds[0].id,
          order_index: 0,
          slug: "what-is-programming",
          title: "What is Programming?",
          body_md: "# What is Programming?\n\nProgramming is the process of creating instructions for computers...",
        },
        {
          lesson_id: lessonIds[0].id,
          order_index: 1,
          slug: "your-first-program",
          title: "Your First Program",
          body_md: "# Your First Program\n\nLet's write your first line of code...",
        },
        {
          lesson_id: lessonIds[0].id,
          order_index: 2,
          slug: "variables-and-data",
          title: "Variables and Data",
          body_md: "# Variables and Data\n\nVariables are containers for storing data values...",
        },
      ]).onConflictDoNothing();
    }

    // Seed themes
    console.log("Creating themes...");
    await db.insert(themes).values([
      {
        slug: "light",
        name: "Light",
        radius: "0.5",
        font: "Inter",
        primary: "#0066cc",
        secondary: "#f5f5f5",
        accent: "#00a86b",
      },
      {
        slug: "dark",
        name: "Dark",
        radius: "0.5",
        font: "Inter",
        primary: "#3b82f6",
        secondary: "#1e1e1e",
        accent: "#10b981",
      },
      {
        slug: "midnight",
        name: "Midnight",
        radius: "0.75",
        font: "Inter",
        primary: "#8b5cf6",
        secondary: "#0f0f23",
        accent: "#f59e0b",
      },
    ]).onConflictDoNothing();

    // Seed levels
    console.log("Creating levels...");
    await db.insert(levels).values([
      { level: 1, xp_to_reach: 0, label: "Beginner" },
      { level: 2, xp_to_reach: 100, label: "Novice" },
      { level: 3, xp_to_reach: 250, label: "Apprentice" },
      { level: 4, xp_to_reach: 500, label: "Student" },
      { level: 5, xp_to_reach: 1000, label: "Practitioner" },
      { level: 6, xp_to_reach: 1750, label: "Skilled" },
      { level: 7, xp_to_reach: 2750, label: "Proficient" },
      { level: 8, xp_to_reach: 4000, label: "Advanced" },
      { level: 9, xp_to_reach: 5500, label: "Expert" },
      { level: 10, xp_to_reach: 7500, label: "Master" },
    ]).onConflictDoNothing();

    console.log("✅ Database seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run the seed function when called directly
if (require.main === module) {
  seed()
    .then(() => {
      console.log("🎉 Seed script finished");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seed script failed:", error);
      process.exit(1);
    });
}