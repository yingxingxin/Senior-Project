import { db, assistants, achievements, lessons, lesson_sections, themes, levels, users, accounts, quizzes, quiz_questions, quiz_options, type NewAssistant, type NewUser, type NewAccount } from './index';
import { ASSISTANT_FIXTURES } from '@/src/lib/constants';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Seed assistants from existing fixtures
    console.log("Creating assistants...");
    const seedAssistants = [];
    for (const option of ASSISTANT_FIXTURES) {
      const [assistant] = await db
        .insert(assistants)
        .values(option as NewAssistant)
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
    const testUser: NewUser = {
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

    // Seed Programming Foundations course lessons
    console.log("Creating Programming Foundations course lessons...");
    const programmingFoundationsLessons = await db.insert(lessons).values([
      {
        slug: "programming-foundations-1-introduction",
        title: "Introduction to Programming",
        description: "Learn what programming is and why it matters in today's world",
        difficulty: "easy",
        estimated_duration_sec: 1800, // 30 minutes
        course_slug: "programming-foundations",
        order_index: 1,
        icon: "📚",
        is_published: true,
      },
      {
        slug: "programming-foundations-2-variables",
        title: "Variables and Data Types",
        description: "Understand how to store and work with different types of data",
        difficulty: "easy",
        estimated_duration_sec: 2400, // 40 minutes
        course_slug: "programming-foundations",
        order_index: 2,
        icon: "📝",
        is_published: true,
      },
      {
        slug: "programming-foundations-3-control-structures",
        title: "Control Structures",
        description: "Learn to make decisions and repeat actions in your code",
        difficulty: "standard",
        estimated_duration_sec: 3000, // 50 minutes
        course_slug: "programming-foundations",
        order_index: 3,
        icon: "🔀",
        is_published: true,
      },
      {
        slug: "programming-foundations-4-functions",
        title: "Functions and Methods",
        description: "Organize your code into reusable blocks with functions",
        difficulty: "standard",
        estimated_duration_sec: 3600, // 60 minutes
        course_slug: "programming-foundations",
        order_index: 4,
        icon: "⚙️",
        is_published: true,
      },
      {
        slug: "programming-foundations-5-arrays",
        title: "Arrays and Lists",
        description: "Work with collections of data using arrays and lists",
        difficulty: "standard",
        estimated_duration_sec: 2700, // 45 minutes
        course_slug: "programming-foundations",
        order_index: 5,
        icon: "📊",
        is_published: true,
      },
    ]).onConflictDoNothing().returning();

    // Add lesson sections for Programming Foundations lessons
    if (programmingFoundationsLessons.length > 0) {
      console.log("Creating lesson sections for Programming Foundations...");
      
      // Lesson 1: Introduction to Programming
      await db.insert(lesson_sections).values([
        {
          lesson_id: programmingFoundationsLessons[0].id,
          order_index: 0,
          slug: "what-is-programming",
          title: "What is Programming?",
          body_md: "# What is Programming?\n\nProgramming is the process of creating instructions for computers to follow. It's like writing a recipe, but for machines.",
        },
        {
          lesson_id: programmingFoundationsLessons[0].id,
          order_index: 1,
          slug: "programming-languages",
          title: "Programming Languages",
          body_md: "# Programming Languages\n\nJust like human languages, programming languages have their own syntax and rules. We'll explore the most popular ones.",
        },
        {
          lesson_id: programmingFoundationsLessons[0].id,
          order_index: 2,
          slug: "your-first-program",
          title: "Your First Program",
          body_md: "# Your First Program\n\nLet's write your first line of code and see the magic happen!",
        },
      ]).onConflictDoNothing();

      // Lesson 2: Variables and Data Types
      await db.insert(lesson_sections).values([
        {
          lesson_id: programmingFoundationsLessons[1].id,
          order_index: 0,
          slug: "understanding-variables",
          title: "Understanding Variables",
          body_md: "# Understanding Variables\n\nVariables are containers that store data values. Think of them as labeled boxes.",
        },
        {
          lesson_id: programmingFoundationsLessons[1].id,
          order_index: 1,
          slug: "data-types",
          title: "Data Types",
          body_md: "# Data Types\n\nDifferent types of data: numbers, text, true/false values, and more.",
        },
        {
          lesson_id: programmingFoundationsLessons[1].id,
          order_index: 2,
          slug: "working-with-variables",
          title: "Working with Variables",
          body_md: "# Working with Variables\n\nLearn how to create, assign, and use variables in your programs.",
        },
      ]).onConflictDoNothing();

      // Lesson 3: Control Structures
      await db.insert(lesson_sections).values([
        {
          lesson_id: programmingFoundationsLessons[2].id,
          order_index: 0,
          slug: "conditional-statements",
          title: "Conditional Statements",
          body_md: "# Conditional Statements\n\nMake decisions in your code with if, else, and switch statements.",
        },
        {
          lesson_id: programmingFoundationsLessons[2].id,
          order_index: 1,
          slug: "loops",
          title: "Loops",
          body_md: "# Loops\n\nRepeat actions efficiently with for and while loops.",
        },
        {
          lesson_id: programmingFoundationsLessons[2].id,
          order_index: 2,
          slug: "practical-examples",
          title: "Practical Examples",
          body_md: "# Practical Examples\n\nSee control structures in action with real-world examples.",
        },
      ]).onConflictDoNothing();

      // Lesson 4: Functions and Methods
      await db.insert(lesson_sections).values([
        {
          lesson_id: programmingFoundationsLessons[3].id,
          order_index: 0,
          slug: "what-are-functions",
          title: "What are Functions?",
          body_md: "# What are Functions?\n\nFunctions are reusable blocks of code that perform specific tasks.",
        },
        {
          lesson_id: programmingFoundationsLessons[3].id,
          order_index: 1,
          slug: "creating-functions",
          title: "Creating Functions",
          body_md: "# Creating Functions\n\nLearn how to define and call your own functions.",
        },
        {
          lesson_id: programmingFoundationsLessons[3].id,
          order_index: 2,
          slug: "function-parameters",
          title: "Function Parameters",
          body_md: "# Function Parameters\n\nPass data into functions and get results back.",
        },
      ]).onConflictDoNothing();

      // Lesson 5: Arrays and Lists
      await db.insert(lesson_sections).values([
        {
          lesson_id: programmingFoundationsLessons[4].id,
          order_index: 0,
          slug: "introduction-to-arrays",
          title: "Introduction to Arrays",
          body_md: "# Introduction to Arrays\n\nArrays let you store multiple values in a single variable.",
        },
        {
          lesson_id: programmingFoundationsLessons[4].id,
          order_index: 1,
          slug: "working-with-arrays",
          title: "Working with Arrays",
          body_md: "# Working with Arrays\n\nAdd, remove, and access elements in arrays.",
        },
        {
          lesson_id: programmingFoundationsLessons[4].id,
          order_index: 2,
          slug: "array-methods",
          title: "Array Methods",
          body_md: "# Array Methods\n\nUse built-in methods to manipulate arrays efficiently.",
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
