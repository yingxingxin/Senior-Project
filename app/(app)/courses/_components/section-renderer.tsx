import { ReadingSection } from "./sections/reading-section";
import { QuizSection } from "./sections/quiz-section";
import { ExerciseSection } from "./sections/exercise-section";
import { WhyItMatters } from "./why-it-matters";
import { Heading, Muted } from "@/components/ui/typography";

import type { JSONContent } from '@tiptap/core';

export interface Section {
  id: number;
  slug: string;
  title: string;
  body: string; // Legacy markdown content (for quiz, exercise, flip-cards)
  bodyJson?: JSONContent; // Tiptap JSON content (for reading sections)
  type?: "reading" | "flip-cards" | "quiz" | "exercise";
  metadata?: {
    description?: string;
    instructions?: string;
    cards?: Array<{ front: string; back: string }>;
    questions?: Array<{
      id: string;
      question: string;
      options: Array<{ id: string; label: string }>;
      correctOptionId: string;
      explanation: string;
    }>;
    exerciseType?: string;
    items?: Array<{ id: string; label: string; correctPosition: number }>;
  };
  isCompleted?: boolean;
}

interface SectionRendererProps {
  section: Section;
  onReadyStateChange?: (ready: boolean) => void;
}

/**
 * Detects section type and renders the appropriate component
 * Type detection hierarchy:
 * 1. Explicit type field from database
 * 2. Slug pattern matching (why-it-matters, quiz-*, exercise-*)
 * 3. Default to reading section
 */
export function SectionRenderer({ section, onReadyStateChange }: SectionRendererProps) {
  // Determine section type
  const sectionType = detectSectionType(section);

  // Render based on type
  switch (sectionType) {
    case "flip-cards":
      return <WhyItMattersSection section={section} onReadyStateChange={onReadyStateChange} />;

    case "quiz":
      return <QuizSection section={section} onReadyStateChange={onReadyStateChange} />;

    case "exercise":
      return <ExerciseSection section={section} onReadyStateChange={onReadyStateChange} />;

    case "reading":
    default:
      return <ReadingSection section={section} onReadyStateChange={onReadyStateChange} />;
  }
}

/**
 * Detect section type from explicit type field or slug pattern
 */
function detectSectionType(
  section: Section
): "reading" | "flip-cards" | "quiz" | "exercise" {
  // Explicit type field takes precedence
  if (section.type) {
    return section.type;
  }

  // Slug-based detection
  if (section.slug.includes("why-it-matters") || section.slug.includes("flip")) {
    return "flip-cards";
  }

  if (section.slug.includes("quiz") || section.slug.includes("question")) {
    return "quiz";
  }

  if (
    section.slug.includes("exercise") ||
    section.slug.includes("activity") ||
    section.slug.includes("drag")
  ) {
    return "exercise";
  }

  // Default to reading
  return "reading";
}

/**
 * Special handler for Why It Matters sections
 * Parses metadata for flip cards
 */
function WhyItMattersSection({ section, onReadyStateChange }: { section: Section; onReadyStateChange?: (ready: boolean) => void }) {
  // Parse cards from metadata or body
  const cards = section.metadata?.cards || parseFlipCards(section.body);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Heading level={2}>{section.title}</Heading>
        {section.metadata?.description && (
          <Muted variant="small">{section.metadata.description}</Muted>
        )}
      </div>

      <WhyItMatters
        cards={cards}
        submitFormId="dummy-form-id"
        isCompleted={section.isCompleted}
        onReadyStateChange={onReadyStateChange}
      />
    </div>
  );
}

/**
 * Parse flip cards from markdown format
 * Expected format in body:
 * - Front: text
 * - Back: text
 * ---
 * @param _body - Section body content (currently unused, returns hardcoded example data)
 */
function parseFlipCards(_body: string): Array<{ front: string; back: string }> {
  // For now, return a simple example
  // This should be enhanced based on actual markdown format
  return [
    {
      front: "Computational Thinking",
      back: "Breaking problems into steps a computer can solve",
    },
    {
      front: "Career Opportunities",
      back: "Programming skills lead to diverse tech careers",
    },
    {
      front: "Automation",
      back: "Write once, run many times - save time and effort",
    },
  ];
}
