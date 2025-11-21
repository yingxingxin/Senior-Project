'use client';

/**
 * TiptapViewer Component
 *
 * Client-side viewer for Tiptap content with interactive extensions.
 * Hydrates static HTML with:
 * - Flip card animations
 * - Quiz answer selection and feedback
 * - Drag-and-drop exercise validation
 *
 * Architecture Decision: Why interactivity lives in the viewer, not node views
 *
 * We manage interactive state (flip cards, quizzes, drag exercises) in the viewer
 * component rather than using React node views because:
 *
 * 1. **SSR-first**: Content is server-rendered as static HTML, then hydrated client-side.
 *    Node views would require mounting React components for every interactive node.
 *
 * 2. **Centralized completion tracking**: The lesson page needs to know when all
 *    interactions are complete to unlock navigation. Aggregating state from multiple
 *    node views would require complex context/event coordination.
 *
 * 3. **Bundle size**: Avoiding ReactNodeViewRenderer saves ~20-30kb for students
 *    on slow connections.
 *
 * 4. **Progressive enhancement**: Works without JS (static HTML), enhances with
 *    interactivity when JS loads.
 *
 * Trade-off: Less modular than node views, but simpler for our read-only use case.
 *
 * When to refactor: If we need an editable editor for authoring, or if interactive
 * types grow beyond 5-6, consider moving to React node views with shared context.
 *
 * See: docs/tiptap-course-migration.md for migration details
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import type { JSONContent } from '@tiptap/core';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';

// Import extensions
import { Callout } from './extensions/callout';
import { CodeBlockEnhanced } from './extensions/code-block-enhanced';
import {
  FlipCardGroup,
  FlipCard,
  FlipCardFront,
  FlipCardBack,
} from './extensions/flip-card';
import { QuizQuestion, QuizOption } from './extensions/quiz-question';
import { DragOrderExercise, DragOrderItem } from './extensions/drag-order-exercise';

// Import interaction hooks
import { useFlipCards } from './hooks/use-flip-cards';
import { useQuiz } from './hooks/use-quiz';
import { useDragOrder } from './hooks/use-drag-order';

interface TiptapViewerProps {
  content: JSONContent;
  className?: string;
  onReadyStateChange?: (isReady: boolean) => void;
}

export function TiptapViewer({
  content,
  className,
  onReadyStateChange,
}: TiptapViewerProps) {

  // Initialize editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Use CodeBlockEnhanced instead
      }),
      Typography,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-primary underline hover:no-underline',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg my-4 max-w-full h-auto',
        },
      }),
      Callout,
      CodeBlockEnhanced,
      FlipCardGroup,
      FlipCard,
      FlipCardFront,
      FlipCardBack,
      QuizQuestion,
      QuizOption,
      DragOrderExercise,
      DragOrderItem,
    ],
    content,
    editable: false, // Read-only viewer
    immediatelyRender: false, // Prevent SSR hydration mismatches
    editorProps: {
      attributes: {
        class: 'prose prose-slate dark:prose-invert max-w-none focus:outline-none',
      },
    },
  });

  // Initialize interaction hooks for each interactive element type
  const flipCards = useFlipCards(editor);
  const quizzes = useQuiz(editor);
  const dragOrder = useDragOrder(editor);

  // Check completion state and notify parent
  useEffect(() => {
    const hasInteractiveContent = flipCards.total > 0 || quizzes.total > 0 || dragOrder.total > 0;

    if (!hasInteractiveContent) {
      // No interactive content - immediately ready
      onReadyStateChange?.(true);
      return;
    }

    const allComplete = flipCards.isComplete && quizzes.isComplete && dragOrder.isComplete;
    onReadyStateChange?.(allComplete);
  }, [flipCards, quizzes, dragOrder, onReadyStateChange]);

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor} className={cn(className)} />;
}
