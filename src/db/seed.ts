import { db, assistants, achievements, lessons, lesson_sections, themes, levels, users, accounts, quizzes, quiz_questions, quiz_options } from './index';
import { ASSISTANT_FIXTURES } from '@/src/lib/constants';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

type AssistantSeed = typeof assistants.$inferInsert;
type UserSeed = typeof users.$inferInsert;
type AccountSeed = typeof accounts.$inferInsert;

export async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Seed assistants from existing fixtures
    console.log("Creating assistants...");
    const seedAssistants = [];
    for (const option of ASSISTANT_FIXTURES) {
      const [assistant] = await db
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
        })
        .returning();
      seedAssistants.push(assistant);
    }

    // Seed test user that has finished onboarding
    console.log("Creating test user...");
    const testUser: UserSeed = {
      name: "Test User",
      email: "test@example.com",
      is_email_verified: true,
      email_verified_at: new Date(),
      assistant_id: seedAssistants[0]?.id, // Use the first assistant
      assistant_persona: 'calm',
      onboarding_completed_at: new Date(),
      onboarding_step: 'guided_intro', // Last step of onboarding
    };
    // TODO: create password for test user

    await db
      .insert(users)
      .values(testUser)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: testUser.name,
          is_email_verified: testUser.is_email_verified,
          email_verified_at: testUser.email_verified_at,
          assistant_id: testUser.assistant_id,
          assistant_persona: testUser.assistant_persona,
          onboarding_completed_at: testUser.onboarding_completed_at,
          onboarding_step: testUser.onboarding_step,
          skill_level: testUser.skill_level,
          updated_at: new Date(),
        },
      });

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

    // Seed Skill Assessment Quiz (for onboarding)
    console.log("Creating Skill Assessment quiz...");

    // First, check if the quiz already exists
    const existingSkillQuiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.topic, 'Skill Assessment'))
      .limit(1);

    if (existingSkillQuiz.length === 0) {
      // Create the skill assessment quiz
      const [skillQuiz] = await db.insert(quizzes).values({
        topic: 'Skill Assessment',
        difficulty: 'standard',
        time_limit_sec: 600,
        passing_pct: 60,
      }).returning();

      // Add questions and options for skill assessment
      const skillQuestions = [
        {
          text: 'What is the output of: print(len({"a": 1, "b": 2})) in Python?',
          options: [
            { text: '2', is_correct: true },
            { text: '1', is_correct: false },
            { text: '0', is_correct: false },
          ]
        },
        {
          text: 'Which data structure provides O(1) average-time lookup by key?',
          options: [
            { text: 'Hash map / dict', is_correct: true },
            { text: 'Array list', is_correct: false },
            { text: 'Linked list', is_correct: false },
          ]
        },
        {
          text: 'What does Big-O notation describe?',
          options: [
            { text: 'Upper bound on algorithm growth', is_correct: true },
            { text: 'Exact runtime in seconds', is_correct: false },
            { text: 'Memory address', is_correct: false },
          ]
        },
        {
          text: 'Which algorithm has O(n log n) average-case time?',
          options: [
            { text: 'Merge sort', is_correct: true },
            { text: 'Bubble sort', is_correct: false },
            { text: 'Selection sort', is_correct: false },
          ]
        },
        {
          text: 'What is a stable sorting algorithm?',
          options: [
            { text: 'One that preserves relative order of equal elements', is_correct: true },
            { text: 'One that is fastest in all cases', is_correct: false },
            { text: 'One that uses the least memory always', is_correct: false },
          ]
        }
      ];

      for (let i = 0; i < skillQuestions.length; i++) {
        const q = skillQuestions[i];
        const [question] = await db.insert(quiz_questions).values({
          quiz_id: skillQuiz.id,
          order_index: i + 1,
          text: q.text,
          points: 1,
        }).returning();

        for (let j = 0; j < q.options.length; j++) {
          const opt = q.options[j];
          await db.insert(quiz_options).values({
            question_id: question.id,
            order_index: j + 1,
            text: opt.text,
            is_correct: opt.is_correct,
          });
        }
      }
      console.log("  → Skill Assessment quiz created with 5 questions");
    } else {
      console.log("  → Skill Assessment quiz already exists, skipping");
    }

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