"use client";

import { useEffect } from "react";
import { Body, Heading, Muted } from "@/components/ui/typography";
import { TiptapRenderer } from "@/components/editor/tiptap-renderer";
import type { Section } from "../section-renderer";

interface ReadingSectionProps {
  section: Section;
  onReadyStateChange?: (ready: boolean) => void;
}

/**
 * Reading section component
 * Renders rich content using Tiptap renderer
 * No required actions - signals readiness immediately
 *
 * Content rendering strategy:
 * - Tiptap JSON (body_json field from database)
 * - Fallback to plain text for legacy content
 */
export function ReadingSection({ section, onReadyStateChange }: ReadingSectionProps) {
  // Signal ready immediately - no required action for reading sections
  useEffect(() => {
    onReadyStateChange?.(true);
  }, [onReadyStateChange]);

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
        <TiptapRenderer content={section.bodyJson} />
      ) : (
        <div className="space-y-4 leading-relaxed text-foreground whitespace-pre-wrap">
          <Body>{section.body}</Body>
        </div>
      )}
    </div>
  );
}
