import { db, assistants, achievements, lessons, lesson_sections, themes, levels, users, quizzes, quiz_questions, music_tracks, type NewAssistant, type NewUser } from './index';
import { ASSISTANT_FIXTURES } from '@/src/lib/constants';
import { BUILT_IN_THEMES } from '@/app/(app)/settings/_components/theme-editor/built-in-themes';
import { eq } from 'drizzle-orm';
import type { CalloutType } from '@/components/editor/extensions/callout';

/**
 * Generate Tiptap JSON for flip card content
 * Creates JSON directly to avoid DOM dependency in Node environment
 */
function generateFlipCardJson() {
  return {
    type: 'doc',
    content: [
      {
        type: 'flipCardGroup',
        attrs: { columns: 3 },
        content: [
          {
            type: 'flipCard',
            content: [
              {
                type: 'flipCardFront',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Computational Thinking' }] }],
              },
              {
                type: 'flipCardBack',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Break problems into steps and patterns—transferable to any field.' }] }],
              },
            ],
          },
          {
            type: 'flipCard',
            content: [
              {
                type: 'flipCardFront',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Career Opportunities' }] }],
              },
              {
                type: 'flipCardBack',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Programming skills open doors in every industry.' }] }],
              },
            ],
          },
          {
            type: 'flipCard',
            content: [
              {
                type: 'flipCardFront',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Automation' }] }],
              },
              {
                type: 'flipCardBack',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Automate repetitive tasks and build tools that save time.' }] }],
              },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Generate Tiptap JSON for reading content
 * Creates JSON directly to avoid DOM dependency in Node environment
 */
function generateReadingContentJson(title: string, body: string) {
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: title }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: body }],
      },
    ],
  };
}

/**
 * Generate Tiptap JSON for quiz question with multiple choice options
 * Creates JSON directly to avoid DOM dependency in Node environment
 */
function generateQuizQuestionJson() {
  return {
    type: 'doc',
    content: [
      {
        type: 'quizQuestion',
        attrs: {
          correctOptionId: 'b',
          explanation: 'Variables declared with let have block scope and can be reassigned.',
        },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Which keyword declares a block-scoped variable in JavaScript?' }],
          },
          {
            type: 'quizOption',
            attrs: { id: 'a' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'var' }] }],
          },
          {
            type: 'quizOption',
            attrs: { id: 'b' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'let' }] }],
          },
          {
            type: 'quizOption',
            attrs: { id: 'c' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'const' }] }],
          },
          {
            type: 'quizOption',
            attrs: { id: 'd' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'function' }] }],
          },
        ],
      },
    ],
  };
}

/**
 * Generate Tiptap JSON for drag-and-drop ordering exercise
 * Creates JSON directly to avoid DOM dependency in Node environment
 */
function generateDragOrderExerciseJson() {
  return {
    type: 'doc',
    content: [
      {
        type: 'dragOrderExercise',
        attrs: {
          instructions: 'Arrange these programming steps in the correct order:',
        },
        content: [
          {
            type: 'dragOrderItem',
            attrs: { correctPosition: 0 },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '1. Write the code' }] }],
          },
          {
            type: 'dragOrderItem',
            attrs: { correctPosition: 1 },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '2. Test the code' }] }],
          },
          {
            type: 'dragOrderItem',
            attrs: { correctPosition: 2 },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '3. Debug any errors' }] }],
          },
          {
            type: 'dragOrderItem',
            attrs: { correctPosition: 3 },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: '4. Deploy to production' }] }],
          },
        ],
      },
    ],
  };
}

/**
 * Generate Tiptap JSON for callout block
 * @param type - The callout type (tip, warning, note, info, success, error)
 * @param content - The content text for the callout
 *
 * Creates JSON directly to avoid DOM dependency in Node environment
 */
function generateCalloutJson(type: CalloutType, content: string) {
  return {
    type: 'doc',
    content: [
      {
        type: 'callout',
        attrs: { type },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: content }],
          },
        ],
      },
    ],
  };
}

/**
 * Generate Tiptap JSON for enhanced code block
 * @param language - Programming language for syntax highlighting
 * @param code - The code content
 * @param filename - Optional filename to display
 *
 * Note: Creates JSON directly instead of using Editor to avoid module resolution issues in Node
 */
function generateCodeBlockJson(language: string, code: string, filename?: string) {
  return {
    type: 'doc',
    content: [
      {
        type: 'codeBlock',
        attrs: {
          language,
          filename: filename || null,
          showLineNumbers: true,
        },
        content: [
          {
            type: 'text',
            text: code,
          },
        ],
      },
    ],
  };
}

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

    // Seed top-level courses
    console.log("Creating courses...");
    const courseValues = [
      {
        slug: "programming-foundations",
        title: "Programming Foundations",
        description: "Learn the fundamentals of programming from scratch. Perfect for beginners!",
        difficulty: "easy" as const,
        estimated_duration_sec: 14400, // 4 hours total
        icon: "💻",
        order_index: 1,
        is_published: true,
        parent_lesson_id: null,
      },
      {
        slug: "data-structures-algorithms",
        title: "Data Structures & Algorithms",
        description: "Master the core data structures and algorithmic thinking.",
        difficulty: "standard" as const,
        estimated_duration_sec: 28800, // 8 hours total
        icon: "🔗",
        order_index: 2,
        is_published: true,
        parent_lesson_id: null,
      },
      {
        slug: "oop-principles",
        title: "Object-Oriented Programming",
        description: "Learn OOP principles and best practices.",
        difficulty: "standard" as const,
        estimated_duration_sec: 21600, // 6 hours total
        icon: "🏗️",
        order_index: 3,
        is_published: true,
        parent_lesson_id: null,
      },
    ];

    const courses = [];
    for (const courseData of courseValues) {
      const [course] = await db.insert(lessons)
        .values(courseData)
        .onConflictDoUpdate({
          target: lessons.slug,
          set: {
            title: courseData.title,
            description: courseData.description,
            difficulty: courseData.difficulty,
            estimated_duration_sec: courseData.estimated_duration_sec,
            icon: courseData.icon,
            order_index: courseData.order_index,
            is_published: courseData.is_published,
            updated_at: new Date(),
          },
        })
        .returning();
      courses.push(course);
    }

    // Seed Programming Foundations topics (lessons within course)
    console.log("Creating Programming Foundations topics...");
    const programmingFoundationsTopics = courses.filter(c => c.slug === "programming-foundations");
    const programmingFoundationsCourseId = programmingFoundationsTopics[0]?.id;

    const programmingFoundationsLessons: typeof lessons.$inferSelect[] = [];
    if (programmingFoundationsCourseId) {
      const lessonValues = [
        {
          slug: "programming-foundations-0-showcase",
          title: "Interactive Features Demo",
          description: "Explore all the interactive learning features available in this course",
          difficulty: "easy" as const,
          estimated_duration_sec: 900, // 15 minutes
          parent_lesson_id: programmingFoundationsCourseId,
          order_index: 0,
          icon: "🎨",
          is_published: true,
        },
        {
          slug: "programming-foundations-1-introduction",
          title: "Introduction to Programming",
          description: "Learn what programming is and why it matters in today's world",
          difficulty: "easy" as const,
          estimated_duration_sec: 1800, // 30 minutes
          parent_lesson_id: programmingFoundationsCourseId,
          order_index: 1,
          icon: "📚",
          is_published: true,
        },
        {
          slug: "programming-foundations-2-variables",
          title: "Variables and Data Types",
          description: "Understand how to store and work with different types of data",
          difficulty: "easy" as const,
          estimated_duration_sec: 2400, // 40 minutes
          parent_lesson_id: programmingFoundationsCourseId,
          order_index: 2,
          icon: "📝",
          is_published: true,
        },
        {
          slug: "programming-foundations-3-control-structures",
          title: "Control Structures",
          description: "Learn to make decisions and repeat actions in your code",
          difficulty: "standard" as const,
          estimated_duration_sec: 3000, // 50 minutes
          parent_lesson_id: programmingFoundationsCourseId,
          order_index: 3,
          icon: "🔀",
          is_published: true,
        },
        {
          slug: "programming-foundations-4-functions",
          title: "Functions and Methods",
          description: "Organize your code into reusable blocks with functions",
          difficulty: "standard" as const,
          estimated_duration_sec: 3600, // 60 minutes
          parent_lesson_id: programmingFoundationsCourseId,
          order_index: 4,
          icon: "⚙️",
          is_published: true,
        },
        {
          slug: "programming-foundations-5-arrays",
          title: "Arrays and Lists",
          description: "Work with collections of data using arrays and lists",
          difficulty: "standard" as const,
          estimated_duration_sec: 2700, // 45 minutes
          parent_lesson_id: programmingFoundationsCourseId,
          order_index: 5,
          icon: "📊",
          is_published: true,
        },
      ];

      for (const lessonData of lessonValues) {
        const [lesson] = await db.insert(lessons)
          .values(lessonData)
          .onConflictDoUpdate({
            target: lessons.slug,
            set: {
              title: lessonData.title,
              description: lessonData.description,
              difficulty: lessonData.difficulty,
              estimated_duration_sec: lessonData.estimated_duration_sec,
              parent_lesson_id: lessonData.parent_lesson_id,
              order_index: lessonData.order_index,
              icon: lessonData.icon,
              is_published: lessonData.is_published,
              updated_at: new Date(),
            },
          })
          .returning();
        programmingFoundationsLessons.push(lesson);
      }
    }

    // Add lesson sections for Programming Foundations lessons
    if (programmingFoundationsLessons.length > 0) {
      console.log("Creating lesson sections for Programming Foundations...");
      const createWhyItMattersSection = (lessonId: number) => ({
        lesson_id: lessonId,
        order_index: -1,
        slug: "why-it-matters",
        title: "Why it matters",
        body_md: "", // Legacy field - content is in body_json
        body_json: generateFlipCardJson(),
      });

      // Lesson 0: Interactive Features Demo (Showcase)
      const lesson0Sections = [
        {
          lesson_id: programmingFoundationsLessons[0].id,
          order_index: 0,
          slug: "callouts-showcase",
          title: "Callouts - Highlight Important Information",
          body_md: "",
          body_json: {
            type: 'doc',
            content: [
              { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Different Callout Types' }] },
              { type: 'paragraph', content: [{ type: 'text', text: 'Callouts help draw attention to important information. Here are all the available types:' }] },
              generateCalloutJson('tip', '💡 Tips provide helpful suggestions and best practices.').content[0],
              generateCalloutJson('info', 'ℹ️ Info callouts provide additional context and background information.').content[0],
              generateCalloutJson('success', '✅ Success callouts highlight positive outcomes and achievements.').content[0],
              generateCalloutJson('warning', '⚠️ Warnings alert you to potential pitfalls and important caveats.').content[0],
              generateCalloutJson('error', '❌ Error callouts point out common mistakes to avoid.').content[0],
              generateCalloutJson('note', '📝 Notes provide supplementary information worth remembering.').content[0],
            ],
          },
        },
        {
          lesson_id: programmingFoundationsLessons[0].id,
          order_index: 1,
          slug: "code-blocks-showcase",
          title: "Code Blocks - Syntax Highlighted Examples",
          body_md: "",
          body_json: {
            type: 'doc',
            content: [
              { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Enhanced Code Blocks' }] },
              { type: 'paragraph', content: [{ type: 'text', text: 'Code blocks support syntax highlighting for multiple languages:' }] },
              { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'JavaScript Example' }] },
              generateCodeBlockJson('javascript', 'function greet(name) {\n  console.log(`Hello, ${name}!`);\n  return true;\n}\n\ngreet("World");', 'example.js').content[0],
              { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Python Example' }] },
              generateCodeBlockJson('python', 'def calculate_fibonacci(n):\n    if n <= 1:\n        return n\n    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)\n\nprint(calculate_fibonacci(10))', 'fibonacci.py').content[0],
              { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'SQL Example' }] },
              generateCodeBlockJson('sql', 'SELECT users.name, COUNT(orders.id) as order_count\nFROM users\nLEFT JOIN orders ON users.id = orders.user_id\nGROUP BY users.id\nHAVING order_count > 5\nORDER BY order_count DESC;', 'query.sql').content[0],
            ],
          },
        },
        {
          lesson_id: programmingFoundationsLessons[0].id,
          order_index: 2,
          slug: "quiz-showcase",
          title: "Quiz Questions - Test Your Knowledge",
          body_md: "",
          body_json: {
            type: 'doc',
            content: [
              { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Interactive Quiz' }] },
              { type: 'paragraph', content: [{ type: 'text', text: 'Test your understanding with interactive multiple-choice questions:' }] },
              generateQuizQuestionJson().content[0],
            ],
          },
        },
        {
          lesson_id: programmingFoundationsLessons[0].id,
          order_index: 3,
          slug: "drag-order-showcase",
          title: "Drag & Drop - Order Steps Correctly",
          body_md: "",
          body_json: {
            type: 'doc',
            content: [
              { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Interactive Ordering Exercise' }] },
              { type: 'paragraph', content: [{ type: 'text', text: 'Practice by arranging items in the correct order:' }] },
              generateDragOrderExerciseJson().content[0],
            ],
          },
        },
        {
          lesson_id: programmingFoundationsLessons[0].id,
          order_index: 4,
          slug: "flip-cards-showcase",
          title: "Flip Cards - Review Key Concepts",
          body_md: "",
          body_json: {
            type: 'doc',
            content: [
              { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Interactive Flash Cards' }] },
              { type: 'paragraph', content: [{ type: 'text', text: 'Click on cards to reveal the answer:' }] },
              generateFlipCardJson().content[0],
            ],
          },
        },
      ];

      for (const sectionData of lesson0Sections) {
        await db.insert(lesson_sections)
          .values(sectionData)
          .onConflictDoUpdate({
            target: [lesson_sections.lesson_id, lesson_sections.slug],
            set: {
              title: sectionData.title,
              order_index: sectionData.order_index,
              body_md: sectionData.body_md,
              body_json: sectionData.body_json,
            },
          });
      }

      // Lesson 1: Introduction to Programming
      const lesson1Sections = [
        createWhyItMattersSection(programmingFoundationsLessons[1].id),
        {
          lesson_id: programmingFoundationsLessons[1].id,
          order_index: 0,
          slug: "what-is-programming",
          title: "What is Programming?",
          body_md: "",
          body_json: generateReadingContentJson("What is Programming?", "Programming is the process of creating instructions for computers to follow."),
        },
        {
          lesson_id: programmingFoundationsLessons[1].id,
          order_index: 1,
          slug: "programming-languages",
          title: "Programming Languages",
          body_md: "",
          body_json: generateReadingContentJson("Programming Languages", "Just like human languages, programming languages have their own syntax and rules."),
        },
        {
          lesson_id: programmingFoundationsLessons[1].id,
          order_index: 2,
          slug: "your-first-program",
          title: "Your First Program",
          body_md: "",
          body_json: generateReadingContentJson("Your First Program", "Let's write your first line of code and see the magic happen!"),
        },
      ];

      for (const sectionData of lesson1Sections) {
        await db.insert(lesson_sections)
          .values(sectionData)
          .onConflictDoUpdate({
            target: [lesson_sections.lesson_id, lesson_sections.slug],
            set: {
              title: sectionData.title,
              order_index: sectionData.order_index,
              body_md: sectionData.body_md,
              body_json: sectionData.body_json,
            },
          });
      }

      // Lesson 2: Variables and Data Types
      const lesson2Sections = [
        createWhyItMattersSection(programmingFoundationsLessons[2].id),
        {
          lesson_id: programmingFoundationsLessons[2].id,
          order_index: 0,
          slug: "understanding-variables",
          title: "Understanding Variables",
          body_md: "",
          body_json: generateReadingContentJson("Understanding Variables", "Variables are containers that store data values."),
        },
        {
          lesson_id: programmingFoundationsLessons[2].id,
          order_index: 1,
          slug: "data-types",
          title: "Data Types",
          body_md: "",
          body_json: generateReadingContentJson("Data Types", "Different types of data: numbers, text, true/false values, and more."),
        },
        {
          lesson_id: programmingFoundationsLessons[2].id,
          order_index: 2,
          slug: "working-with-variables",
          title: "Working with Variables",
          body_md: "",
          body_json: generateReadingContentJson("Working with Variables", "Learn how to create, assign, and use variables in your programs."),
        },
      ];

      for (const sectionData of lesson2Sections) {
        await db.insert(lesson_sections)
          .values(sectionData)
          .onConflictDoUpdate({
            target: [lesson_sections.lesson_id, lesson_sections.slug],
            set: {
              title: sectionData.title,
              order_index: sectionData.order_index,
              body_md: sectionData.body_md,
              body_json: sectionData.body_json,
            },
          });
      }

      // Lesson 3: Control Structures
      const lesson3Sections = [
        createWhyItMattersSection(programmingFoundationsLessons[3].id),
        {
          lesson_id: programmingFoundationsLessons[3].id,
          order_index: 0,
          slug: "conditional-statements",
          title: "Conditional Statements",
          body_md: "",
          body_json: generateReadingContentJson("Conditional Statements", "Make decisions in your code with if, else, and switch statements."),
        },
        {
          lesson_id: programmingFoundationsLessons[3].id,
          order_index: 1,
          slug: "loops",
          title: "Loops",
          body_md: "",
          body_json: generateReadingContentJson("Loops", "Repeat actions efficiently with for and while loops."),
        },
        {
          lesson_id: programmingFoundationsLessons[3].id,
          order_index: 2,
          slug: "practical-examples",
          title: "Practical Examples",
          body_md: "",
          body_json: generateReadingContentJson("Practical Examples", "See control structures in action with real-world examples."),
        },
      ];

      for (const sectionData of lesson3Sections) {
        await db.insert(lesson_sections)
          .values(sectionData)
          .onConflictDoUpdate({
            target: [lesson_sections.lesson_id, lesson_sections.slug],
            set: {
              title: sectionData.title,
              order_index: sectionData.order_index,
              body_md: sectionData.body_md,
              body_json: sectionData.body_json,
            },
          });
      }

      // Lesson 4: Functions and Methods
      const lesson4Sections = [
        createWhyItMattersSection(programmingFoundationsLessons[4].id),
        {
          lesson_id: programmingFoundationsLessons[4].id,
          order_index: 0,
          slug: "what-are-functions",
          title: "What are Functions?",
          body_md: "",
          body_json: generateReadingContentJson("What are Functions?", "Functions are reusable blocks of code that perform specific tasks."),
        },
        {
          lesson_id: programmingFoundationsLessons[4].id,
          order_index: 1,
          slug: "creating-functions",
          title: "Creating Functions",
          body_md: "",
          body_json: generateReadingContentJson("Creating Functions", "Learn how to define and call your own functions."),
        },
        {
          lesson_id: programmingFoundationsLessons[4].id,
          order_index: 2,
          slug: "function-parameters",
          title: "Function Parameters",
          body_md: "",
          body_json: generateReadingContentJson("Function Parameters", "Pass data into functions and get results back."),
        },
      ];

      for (const sectionData of lesson4Sections) {
        await db.insert(lesson_sections)
          .values(sectionData)
          .onConflictDoUpdate({
            target: [lesson_sections.lesson_id, lesson_sections.slug],
            set: {
              title: sectionData.title,
              order_index: sectionData.order_index,
              body_md: sectionData.body_md,
              body_json: sectionData.body_json,
            },
          });
      }

      // Lesson 5: Arrays and Lists
      const lesson5Sections = [
        createWhyItMattersSection(programmingFoundationsLessons[5].id),
        {
          lesson_id: programmingFoundationsLessons[5].id,
          order_index: 0,
          slug: "introduction-to-arrays",
          title: "Introduction to Arrays",
          body_md: "",
          body_json: generateReadingContentJson("Introduction to Arrays", "Arrays let you store multiple values in a single variable."),
        },
        {
          lesson_id: programmingFoundationsLessons[5].id,
          order_index: 1,
          slug: "working-with-arrays",
          title: "Working with Arrays",
          body_md: "",
          body_json: generateReadingContentJson("Working with Arrays", "Add, remove, and access elements in arrays."),
        },
        {
          lesson_id: programmingFoundationsLessons[5].id,
          order_index: 2,
          slug: "array-methods",
          title: "Array Methods",
          body_md: "",
          body_json: generateReadingContentJson("Array Methods", "Use built-in methods to manipulate arrays efficiently."),
        },
      ];

      for (const sectionData of lesson5Sections) {
        await db.insert(lesson_sections)
          .values(sectionData)
          .onConflictDoUpdate({
            target: [lesson_sections.lesson_id, lesson_sections.slug],
            set: {
              title: sectionData.title,
              order_index: sectionData.order_index,
              body_md: sectionData.body_md,
              body_json: sectionData.body_json,
            },
          });
      }
    }

    // Seed built-in themes with unified format
    // Each theme contains both light and dark variants in a single record
    console.log("Creating built-in themes...");

    // Build unified theme records from BUILT_IN_THEMES (7 themes, not 14)
    // Each theme now has *_light and *_dark color fields
    const themeRecords = [];
    for (const theme of BUILT_IN_THEMES) {
      themeRecords.push({
        slug: theme.slug,
        name: theme.name,

        // Legacy color tokens (using light mode as default for backward compatibility)
        primary: theme.primary,
        secondary: theme.secondary,
        accent: theme.accent,
        base_bg: theme.base_bg,
        base_fg: theme.base_fg,
        card_bg: theme.card_bg,
        card_fg: theme.card_fg,
        popover_bg: theme.popover_bg,
        popover_fg: theme.popover_fg,
        muted_bg: theme.muted_bg,
        muted_fg: theme.muted_fg,
        destructive_bg: theme.destructive_bg,
        destructive_fg: theme.destructive_fg,

        // Light mode colors
        primary_light: theme.primary_light,
        secondary_light: theme.secondary_light,
        accent_light: theme.accent_light,
        base_bg_light: theme.base_bg_light,
        base_fg_light: theme.base_fg_light,
        card_bg_light: theme.card_bg_light,
        card_fg_light: theme.card_fg_light,
        popover_bg_light: theme.popover_bg_light,
        popover_fg_light: theme.popover_fg_light,
        muted_bg_light: theme.muted_bg_light,
        muted_fg_light: theme.muted_fg_light,
        destructive_bg_light: theme.destructive_bg_light,
        destructive_fg_light: theme.destructive_fg_light,

        // Dark mode colors
        primary_dark: theme.primary_dark,
        secondary_dark: theme.secondary_dark,
        accent_dark: theme.accent_dark,
        base_bg_dark: theme.base_bg_dark,
        base_fg_dark: theme.base_fg_dark,
        card_bg_dark: theme.card_bg_dark,
        card_fg_dark: theme.card_fg_dark,
        popover_bg_dark: theme.popover_bg_dark,
        popover_fg_dark: theme.popover_fg_dark,
        muted_bg_dark: theme.muted_bg_dark,
        muted_fg_dark: theme.muted_fg_dark,
        destructive_bg_dark: theme.destructive_bg_dark,
        destructive_fg_dark: theme.destructive_fg_dark,

        // Typography
        font: theme.font,
        font_sans: theme.font_sans,
        font_serif: theme.font_serif,
        font_mono: theme.font_mono,
        letter_spacing: theme.letter_spacing,

        // Layout & styling
        radius: theme.radius,
        hue_shift: theme.hue_shift,
        saturation_adjust: theme.saturation_adjust,
        lightness_adjust: theme.lightness_adjust,
        spacing_scale: theme.spacing_scale,
        shadow_strength: theme.shadow_strength,

        // Metadata - unified format
        is_built_in: true,
        supports_both_modes: true,
        user_id: null,
        parent_theme_id: null,
      });
    }

    // Insert with upsert to update existing themes
    for (const themeRecord of themeRecords) {
      await db.insert(themes)
        .values(themeRecord)
        .onConflictDoUpdate({
          target: themes.slug,
          set: {
            name: themeRecord.name,

            // Legacy fields
            primary: themeRecord.primary,
            secondary: themeRecord.secondary,
            accent: themeRecord.accent,
            base_bg: themeRecord.base_bg,
            base_fg: themeRecord.base_fg,
            card_bg: themeRecord.card_bg,
            card_fg: themeRecord.card_fg,
            popover_bg: themeRecord.popover_bg,
            popover_fg: themeRecord.popover_fg,
            muted_bg: themeRecord.muted_bg,
            muted_fg: themeRecord.muted_fg,
            destructive_bg: themeRecord.destructive_bg,
            destructive_fg: themeRecord.destructive_fg,

            // Light mode colors
            primary_light: themeRecord.primary_light,
            secondary_light: themeRecord.secondary_light,
            accent_light: themeRecord.accent_light,
            base_bg_light: themeRecord.base_bg_light,
            base_fg_light: themeRecord.base_fg_light,
            card_bg_light: themeRecord.card_bg_light,
            card_fg_light: themeRecord.card_fg_light,
            popover_bg_light: themeRecord.popover_bg_light,
            popover_fg_light: themeRecord.popover_fg_light,
            muted_bg_light: themeRecord.muted_bg_light,
            muted_fg_light: themeRecord.muted_fg_light,
            destructive_bg_light: themeRecord.destructive_bg_light,
            destructive_fg_light: themeRecord.destructive_fg_light,

            // Dark mode colors
            primary_dark: themeRecord.primary_dark,
            secondary_dark: themeRecord.secondary_dark,
            accent_dark: themeRecord.accent_dark,
            base_bg_dark: themeRecord.base_bg_dark,
            base_fg_dark: themeRecord.base_fg_dark,
            card_bg_dark: themeRecord.card_bg_dark,
            card_fg_dark: themeRecord.card_fg_dark,
            popover_bg_dark: themeRecord.popover_bg_dark,
            popover_fg_dark: themeRecord.popover_fg_dark,
            muted_bg_dark: themeRecord.muted_bg_dark,
            muted_fg_dark: themeRecord.muted_fg_dark,
            destructive_bg_dark: themeRecord.destructive_bg_dark,
            destructive_fg_dark: themeRecord.destructive_fg_dark,

            // Typography
            font: themeRecord.font,
            font_sans: themeRecord.font_sans,
            font_serif: themeRecord.font_serif,
            font_mono: themeRecord.font_mono,
            letter_spacing: themeRecord.letter_spacing,

            // Layout
            radius: themeRecord.radius,
            hue_shift: themeRecord.hue_shift,
            saturation_adjust: themeRecord.saturation_adjust,
            lightness_adjust: themeRecord.lightness_adjust,
            spacing_scale: themeRecord.spacing_scale,
            shadow_strength: themeRecord.shadow_strength,

            // Metadata
            is_built_in: true,
            supports_both_modes: true,
          },
        });
    }

    console.log(`✅ Created/updated ${themeRecords.length} built-in unified themes`);

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

    // Seed music tracks
    console.log("Creating music tracks...");
    await db.insert(music_tracks).values([
      {
          title: "Genshin Impact Theme Song",
          artist: "PenG Lexer",
          duration_sec: 147, // 2 minutes 27 seconds
          file_url: "/music/Genshin-Theme.mp3",
          volume: 0.7,
      },
      {
          title: "A New Day With Hope",
          artist: "Anipperoni (Remix)",
          duration_sec: 103, // 1 minute 43 seconds
          file_url: "/music/A-New-Day-With-Hope.mp3",
          volume: 0.7,
      },
      {
          title: "Crystal Snow (Piano Cover)",
          artist: "BTS",
          duration_sec: 426, // 7 minutes 6 seconds
          file_url: "/music/Crystal-Snow.mp3",
          volume: 0.7,
      },
      {
          title: "Flowing Flow",
          artist: "Foxtail Grass Studio",
          duration_sec: 248, // 4 minutes 8 seconds
          file_url: "/music/Flowing-Flow.mp3",
          volume: 0.7,
      },
      {
          title: "Unravel (Tokyo Ghoul OP)",
          artist: "Piano Cover by Animenz",
          duration_sec: 248, // 4 minutes 8 seconds
          file_url: "/music/Unravel.mp3",
          volume: 0.7,
      },
      {
          title: "Marble Soda",
          artist: "Shawn Wasabi",
          duration_sec: 161, // 2 minutes 1 seconds
          file_url: "/music/Marble-Soda.mp3",
          volume: 0.7,
      },
    ]).onConflictDoNothing();

    // Seed Skill Assessment Quiz (for onboarding)
    console.log("Creating Skill Assessment quiz...");

    // First, check if the quiz already exists
    const existingSkillQuiz = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.topic_slug, 'skill-assessment'))
      .limit(1);

    if (existingSkillQuiz.length === 0) {
      // Create the skill assessment quiz
      const [skillQuiz] = await db.insert(quizzes).values({
        slug: 'skill-assessment',
        title: 'Skill Assessment',
        description: 'Assess your programming skill level',
        topic_slug: 'skill-assessment',
        skill_level: 'intermediate',
        default_length: 5,
      }).returning();

      // Add questions and options for skill assessment
      // Note: All questions must have exactly 4 options (indices 0-3)
      const skillQuestions = [
        {
          text: 'What is the output of: print(len({"a": 1, "b": 2})) in Python?',
          options: [
            { text: '2', is_correct: true },
            { text: '1', is_correct: false },
            { text: '0', is_correct: false },
            { text: 'Error', is_correct: false },
          ]
        },
        {
          text: 'Which data structure provides O(1) average-time lookup by key?',
          options: [
            { text: 'Hash map / dict', is_correct: true },
            { text: 'Array list', is_correct: false },
            { text: 'Linked list', is_correct: false },
            { text: 'Binary tree', is_correct: false },
          ]
        },
        {
          text: 'What does Big-O notation describe?',
          options: [
            { text: 'Upper bound on algorithm growth', is_correct: true },
            { text: 'Exact runtime in seconds', is_correct: false },
            { text: 'Memory address', is_correct: false },
            { text: 'Code line count', is_correct: false },
          ]
        },
        {
          text: 'Which algorithm has O(n log n) average-case time?',
          options: [
            { text: 'Merge sort', is_correct: true },
            { text: 'Bubble sort', is_correct: false },
            { text: 'Selection sort', is_correct: false },
            { text: 'Insertion sort', is_correct: false },
          ]
        },
        {
          text: 'What is a stable sorting algorithm?',
          options: [
            { text: 'One that preserves relative order of equal elements', is_correct: true },
            { text: 'One that is fastest in all cases', is_correct: false },
            { text: 'One that uses the least memory always', is_correct: false },
            { text: 'One that never fails', is_correct: false },
          ]
        }
      ];

      for (let i = 0; i < skillQuestions.length; i++) {
        const q = skillQuestions[i];
        // Find the correct answer index
        const correctIndex = q.options.findIndex(opt => opt.is_correct);
        if (correctIndex === -1) {
          throw new Error(`Question ${i + 1} has no correct answer`);
        }
        // Convert options to array of strings
        const optionsArray = q.options.map(opt => opt.text);
        
        await db.insert(quiz_questions).values({
          quiz_id: skillQuiz.id,
          order_index: i + 1,
          prompt: q.text,
          options: optionsArray,
          correct_index: correctIndex,
        });
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
