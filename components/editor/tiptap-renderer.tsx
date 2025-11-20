/**
 * Tiptap Server-Side Renderer
 *
 * Purpose: Render Tiptap JSON to static HTML on the server for optimal performance
 *
 * Features:
 * - Server-side rendering (SSR) using generateHTML from @tiptap/html
 * - Fast initial page load (no client-side hydration delay)
 * - SEO-friendly content
 * - Works without JavaScript enabled
 * - Zero client-side JavaScript required
 *
 * Usage:
 * ```tsx
 * import { TiptapRenderer } from '@/components/editor/tiptap-renderer'
 *
 * <TiptapRenderer content={section.body_json} />
 * ```
 *
 * Why SSR:
 * - Instant content display (no loading spinner)
 * - Better Core Web Vitals (LCP, CLS)
 * - Accessible to search engines
 * - Works for users with JS disabled
 * - Reduces client bundle size
 */

import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Callout } from './extensions/callout';
import { CodeBlockEnhanced } from './extensions/code-block-enhanced';
import { type JSONContent } from '@tiptap/core';
import { cn } from '@/lib/utils';

export interface TiptapRendererProps {
  /**
   * Tiptap JSON content to render
   */
  content: JSONContent;
  /**
   * Additional CSS classes to apply to the wrapper
   */
  className?: string;
}

/**
 * TiptapRenderer Component
 *
 * Renders Tiptap JSON to static HTML on the server.
 * Uses dangerouslySetInnerHTML since we control the content source (our database).
 *
 * All custom extensions must be registered here for proper rendering.
 */
export function TiptapRenderer({ content, className }: TiptapRendererProps) {
  // Generate static HTML from Tiptap JSON on the server
  // This runs during SSR, so there's no client-side overhead
  const html = generateHTML(content, [
    StarterKit.configure({
      // Disable the default code block since we use CodeBlockEnhanced
      codeBlock: false,
    }),
    Typography,
    Link.configure({
      openOnClick: false, // SSR context, no click handling
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
  ]);

  return (
    <div
      className={cn(
        // Prose styles for content typography
        'prose prose-slate dark:prose-invert max-w-none',
        // Design system integration
        'prose-headings:font-semibold',
        'prose-p:text-foreground',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-strong:text-foreground prose-strong:font-semibold',
        'prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
        'prose-pre:bg-muted prose-pre:border prose-pre:border-border',
        // List styles
        'prose-ul:text-foreground prose-ol:text-foreground',
        'prose-li:text-foreground',
        // Custom classes
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
