/**
 * Tiptap JSON Schema Validation
 *
 * Zod schemas for validating AI-generated Tiptap JSON content.
 * Ensures generated content matches expected structure for rendering.
 */

import { z } from 'zod';

/**
 * Text Mark Schema
 */
const TextMarkSchema = z.object({
  type: z.enum(['bold', 'italic', 'code', 'link']),
  attrs: z
    .object({
      href: z.string().optional(),
      target: z.string().optional(),
    })
    .optional(),
});

/**
 * Text Node Schema
 */
const TextNodeSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  marks: z.array(TextMarkSchema).optional(),
});

/**
 * Base Node Schema (recursive definition for nested content)
 */
const BaseNodeSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    type: z.string(),
    attrs: z.record(z.any()).optional(),
    content: z.array(z.union([BaseNodeSchema, TextNodeSchema])).optional(),
  })
);

/**
 * Heading Node
 */
const HeadingNodeSchema = z.object({
  type: z.literal('heading'),
  attrs: z.object({
    level: z.number().min(1).max(6),
  }),
  content: z.array(TextNodeSchema).optional(),
});

/**
 * Paragraph Node
 */
const ParagraphNodeSchema = z.object({
  type: z.literal('paragraph'),
  attrs: z.record(z.any()).optional(),
  content: z.array(z.union([TextNodeSchema, BaseNodeSchema])).optional(),
});

/**
 * Code Block Enhanced Node
 */
const CodeBlockEnhancedNodeSchema = z.object({
  type: z.literal('codeBlockEnhanced'),
  attrs: z.object({
    language: z.string(),
    filename: z.string().optional(),
    showLineNumbers: z.boolean().optional(),
  }),
  content: z.array(TextNodeSchema).optional(),
});

/**
 * Callout Node
 */
const CalloutNodeSchema = z.object({
  type: z.literal('callout'),
  attrs: z.object({
    type: z.enum(['tip', 'warning', 'note', 'info', 'success', 'error']),
  }),
  content: z.array(BaseNodeSchema),
});

/**
 * List Item Node
 */
const ListItemNodeSchema = z.object({
  type: z.literal('listItem'),
  content: z.array(BaseNodeSchema),
});

/**
 * Bullet List Node
 */
const BulletListNodeSchema = z.object({
  type: z.literal('bulletList'),
  content: z.array(ListItemNodeSchema),
});

/**
 * Ordered List Node
 */
const OrderedListNodeSchema = z.object({
  type: z.literal('orderedList'),
  attrs: z
    .object({
      start: z.number().optional(),
    })
    .optional(),
  content: z.array(ListItemNodeSchema),
});

/**
 * Quiz Option Node
 */
const QuizOptionNodeSchema = z.object({
  type: z.literal('quizOption'),
  attrs: z.object({
    id: z.string(),
  }),
  content: z.array(BaseNodeSchema),
});

/**
 * Quiz Question Node
 */
const QuizQuestionNodeSchema = z.object({
  type: z.literal('quizQuestion'),
  attrs: z.object({
    correctAnswer: z.string(),
    explanation: z.string(),
  }),
  content: z.array(z.union([ParagraphNodeSchema, QuizOptionNodeSchema, BaseNodeSchema])),
});

/**
 * Flip Card Front/Back Nodes
 */
const FlipCardFrontNodeSchema = z.object({
  type: z.literal('flipCardFront'),
  content: z.array(BaseNodeSchema),
});

const FlipCardBackNodeSchema = z.object({
  type: z.literal('flipCardBack'),
  content: z.array(BaseNodeSchema),
});

/**
 * Flip Card Node
 */
const FlipCardNodeSchema = z.object({
  type: z.literal('flipCard'),
  content: z.tuple([FlipCardFrontNodeSchema, FlipCardBackNodeSchema]),
});

/**
 * Flip Card Group Node
 */
const FlipCardGroupNodeSchema = z.object({
  type: z.literal('flipCardGroup'),
  attrs: z.object({
    columns: z.number().min(2).max(4).optional(),
  }),
  content: z.array(FlipCardNodeSchema),
});

/**
 * Drag Order Item Node
 */
const DragOrderItemNodeSchema = z.object({
  type: z.literal('dragOrderItem'),
  attrs: z.object({
    id: z.string(),
    correctPosition: z.number(),
  }),
  content: z.array(BaseNodeSchema),
});

/**
 * Drag Order Exercise Node
 */
const DragOrderExerciseNodeSchema = z.object({
  type: z.literal('dragOrderExercise'),
  attrs: z.object({
    instructions: z.string(),
  }),
  content: z.array(DragOrderItemNodeSchema),
});

/**
 * Horizontal Rule Node
 */
const HorizontalRuleNodeSchema = z.object({
  type: z.literal('horizontalRule'),
});

/**
 * Combined Block Node Schema (all possible block-level nodes)
 */
export const BlockNodeSchema = z.union([
  HeadingNodeSchema,
  ParagraphNodeSchema,
  CodeBlockEnhancedNodeSchema,
  CalloutNodeSchema,
  BulletListNodeSchema,
  OrderedListNodeSchema,
  QuizQuestionNodeSchema,
  FlipCardGroupNodeSchema,
  DragOrderExerciseNodeSchema,
  HorizontalRuleNodeSchema,
  BaseNodeSchema, // Fallback for other valid Tiptap nodes
]);

/**
 * Tiptap Document Schema
 */
export const TiptapDocumentSchema = z.object({
  type: z.literal('doc'),
  content: z.array(BlockNodeSchema),
});

/**
 * Type inference from schema
 */
export type TiptapDocument = z.infer<typeof TiptapDocumentSchema>;
export type TiptapBlockNode = z.infer<typeof BlockNodeSchema>;
export type TiptapTextNode = z.infer<typeof TextNodeSchema>;

/**
 * Validate AI-generated Tiptap JSON
 *
 * @param json - JSON object to validate
 * @returns Validation result with typed data or error
 */
export function validateTiptapJSON(json: unknown): {
  success: boolean;
  data?: TiptapDocument;
  error?: z.ZodError;
} {
  const result = TiptapDocumentSchema.safeParse(json);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error };
}

/**
 * Sanitize and repair common AI generation mistakes
 *
 * Attempts to fix common issues before validation fails.
 */
export function sanitizeTiptapJSON(json: any): any {
  if (!json || typeof json !== 'object') {
    return json;
  }

  // Ensure root is doc type
  if (json.type !== 'doc') {
    return {
      type: 'doc',
      content: Array.isArray(json) ? json : [json],
    };
  }

  // Recursively sanitize content
  if (Array.isArray(json.content)) {
    json.content = json.content
      .filter((node: any) => node && typeof node === 'object')
      .map((node: any) => {
        // Fix missing type
        if (!node.type) {
          console.warn('Node missing type, skipping:', node);
          return null;
        }

        // Ensure text nodes have text field
        if (node.type === 'text' && typeof node.text !== 'string') {
          return null;
        }

        // Recursively sanitize nested content
        if (Array.isArray(node.content)) {
          node.content = sanitizeTiptapJSON({ type: 'doc', content: node.content }).content;
        }

        return node;
      })
      .filter(Boolean);
  }

  return json;
}

/**
 * Extract text content from Tiptap JSON (for search, preview, etc.)
 */
export function extractTextFromTiptap(doc: TiptapDocument): string {
  const extractFromNode = (node: any): string => {
    if (node.type === 'text') {
      return node.text || '';
    }

    if (Array.isArray(node.content)) {
      return node.content.map(extractFromNode).join('');
    }

    return '';
  };

  if (!doc || !doc.content) {
    return '';
  }

  return doc.content.map(extractFromNode).join('\n\n');
}

/**
 * Count words in Tiptap document
 */
export function countWordsInTiptap(doc: TiptapDocument): number {
  const text = extractTextFromTiptap(doc);
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Validate that document has required content for a lesson
 */
export function validateLessonContent(doc: TiptapDocument): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for content
  if (!doc.content || doc.content.length === 0) {
    errors.push('Lesson has no content');
  }

  // Check for at least one heading
  const hasHeading = doc.content.some((node: any) => node.type === 'heading');
  if (!hasHeading) {
    errors.push('Lesson should start with a heading');
  }

  // Check minimum word count (at least 100 words for a meaningful lesson)
  const wordCount = countWordsInTiptap(doc);
  if (wordCount < 100) {
    errors.push(`Lesson is too short (${wordCount} words, minimum 100)`);
  }

  // Check for at least one code example (if programming lesson)
  const hasCodeBlock = doc.content.some((node: any) => node.type === 'codeBlockEnhanced');
  // This is a soft requirement, so just log a warning
  if (!hasCodeBlock) {
    console.warn('Lesson has no code examples');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
