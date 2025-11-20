"use client";

import { useEffect } from "react";
import { Body, Heading, Muted } from "@/components/ui/typography";
import type { Section } from "../section-renderer";

interface ReadingSectionProps {
  section: Section;
  onReadyStateChange?: (ready: boolean) => void;
}

/**
 * Reading section component
 * Renders content from the section body
 * No required actions - signals readiness immediately
 * TODO: Add markdown parsing with remark/rehype for better formatting
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

      <div className="space-y-4 leading-relaxed text-foreground whitespace-pre-wrap">
        <Body>{section.body}</Body>
      </div>
    </div>
  );
}
