import { ReadingSection } from "./sections/reading-section";
import type { JSONContent } from '@tiptap/core';

/**
 * Section interface
 * All sections now render as reading sections with Tiptap content
 * Interactive content (flip cards, quizzes, exercises) are Tiptap nodes within bodyJson
 */
export interface Section {
  id: number;
  slug: string;
  title: string;
  body: string; // Legacy markdown content (fallback)
  bodyJson?: JSONContent; // Tiptap JSON content with interactive nodes
  isCompleted?: boolean;
}

interface SectionRendererProps {
  section: Section;
  onReadyStateChange?: (ready: boolean) => void;
}

/**
 * Renders any section type using ReadingSection + TiptapViewer
 * TiptapViewer handles all interactive nodes:
 * - FlipCard nodes (replaces old WhyItMatters component)
 * - QuizQuestion nodes (replaces old QuizSection component)
 * - DragOrderExercise nodes (replaces old ExerciseSection component)
 */
export function SectionRenderer({ section, onReadyStateChange }: SectionRendererProps) {
  return <ReadingSection section={section} onReadyStateChange={onReadyStateChange} />;
}
