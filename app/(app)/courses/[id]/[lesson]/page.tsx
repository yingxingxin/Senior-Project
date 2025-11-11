import { notFound } from "next/navigation";
import { Heading, Body } from "@/components/ui/typography";
import { Stack } from "@/components/ui/spacing";
import { getLessonWithSections } from "@/src/db/queries/lessons";
import { LessonClient } from "./lesson-client";

interface LessonPageProps {
  params: Promise<{ id: string; lesson: string }>;
}

/**
 * Server component that fetches lesson data and renders the client component
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { id, lesson } = await params;

  // Fetch lesson and sections from database
  const rows = await getLessonWithSections.execute({ lessonSlug: lesson });

  if (!rows || rows.length === 0) {
    notFound();
  }

  // Parse lesson metadata
  const lessonMeta = {
    id: rows[0].id,
    slug: rows[0].slug,
    title: rows[0].title,
    description: rows[0].description || "",
  };

  // Parse and sort sections
  const sections = rows
    .filter((r) => r.sectionId)
    .map((r) => ({
      id: r.sectionId as number,
      slug: r.sectionSlug as string,
      title: r.sectionTitle as string,
      body: r.sectionBody as string,
      order: r.sectionOrder as number,
      type: detectSectionType(r.sectionSlug as string),
      metadata: parseMetadata(r.sectionSlug as string, r.sectionBody as string),
    }))
    .sort((a, b) => a.order - b.order);

  // Validate we have sections
  if (sections.length === 0) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Stack gap="default" className="text-center">
          <Heading level={2}>No sections found</Heading>
          <Body className="text-muted-foreground">
            This lesson doesn't have any content yet.
          </Body>
        </Stack>
      </div>
    );
  }

  return (
    <LessonClient
      courseId={id}
      lessonSlug={lesson}
      lessonMeta={lessonMeta}
      sections={sections}
    />
  );
}

/**
 * Detect section type from slug
 */
function detectSectionType(slug: string) {
  if (slug.includes("why-it-matters") || slug.includes("flip")) {
    return "flip-cards";
  }
  if (slug.includes("quiz") || slug.includes("question")) {
    return "quiz";
  }
  if (slug.includes("exercise") || slug.includes("activity")) {
    return "exercise";
  }
  return "reading";
}

/**
 * Parse metadata from section content
 */
function parseMetadata(slug: string, body: string) {
  const metadata: Record<string, any> = {};

  // Pre-configured metadata for known sections
  if (slug === "why-it-matters") {
    metadata.cards = [
      {
        front: "Computational Thinking",
        back: "Break problems into steps and patterns—transferable to any field.",
      },
      {
        front: "Career Opportunities",
        back: "Programming skills open doors in every industry.",
      },
      {
        front: "Automation",
        back: "Automate repetitive tasks and build tools that save time.",
      },
    ];
  }

  if (slug.includes("quiz")) {
    metadata.questions = [
      {
        id: "q1",
        question: "What is an algorithm?",
        options: [
          { id: "a", label: "A step-by-step procedure to solve a problem" },
          { id: "b", label: "A type of computer hardware" },
          { id: "c", label: "A programming language" },
          { id: "d", label: "A method of storing data" },
        ],
        correctOptionId: "a",
        explanation:
          "Correct! An algorithm is a sequence of steps designed to solve a specific problem.",
      },
    ];
  }

  if (slug.includes("drag") || slug.includes("order")) {
    metadata.exerciseType = "drag-order";
    metadata.items = [
      { id: "1", label: "Boil water", correctPosition: 0 },
      { id: "2", label: "Add tea bag", correctPosition: 1 },
      { id: "3", label: "Steep for 3-5 minutes", correctPosition: 2 },
      { id: "4", label: "Add milk and sugar", correctPosition: 3 },
    ];
  }

  return metadata;
}
