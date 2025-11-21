"use client";

import { useEffect } from "react";
import { Body, Heading, Muted } from "@/components/ui/typography";
import { TiptapViewer } from "@/components/editor/tiptap-viewer";
import type { Section } from "../section-renderer";

interface ReadingSectionProps {
  section: Section;
  onReadyStateChange?: (ready: boolean) => void;
}

/**
 * Reading section component
 * Renders rich content using Tiptap viewer with interactive support
 *
 * Content rendering strategy:
 * - Uses TiptapViewer for Tiptap JSON (bodyJson) - supports interactive nodes:
 *   * FlipCards: Click to flip, tracks viewed state
 *   * QuizQuestions: Answer selection with immediate feedback
 *   * DragOrderExercise: Drag-and-drop with validation
 * - TiptapViewer handles completion tracking for interactive content
 * - Fallback to plain text for legacy content (signals ready immediately)
 *
 * Architecture Decision:
 * - Replaced TiptapRenderer (SSR-only) with TiptapViewer (client-side hydration)
 * - TiptapViewer calls onReadyStateChange when user completes all interactions
 * - This enables reading sections to contain embedded interactive elements
 */
export function ReadingSection({ section, onReadyStateChange }: ReadingSectionProps) {
  // For legacy plain text content, signal ready immediately
  useEffect(() => {
    if (!section.bodyJson) {
      onReadyStateChange?.(true);
    }
  }, [section.bodyJson, onReadyStateChange]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Heading level={2}>{section.title}</Heading>
        {section.isCompleted && (
          <Muted variant="small" className="text-green-600">
            ✓ Completed
          </Muted>
        )}
      </div>

      {section.bodyJson ? (
        <TiptapViewer
          key={section.id}
          content={section.bodyJson}
          onReadyStateChange={onReadyStateChange}
        />
      ) : (
        <div className="space-y-4 leading-relaxed text-foreground whitespace-pre-wrap">
          <Body>{section.body}</Body>
        </div>
      )}
    </div>
  );
}
