/**
 * Single Lesson Generator
 *
 * Generates content for ONE lesson's sections.
 * Used by parallel job workers to generate each lesson independently.
 */

import { generateText } from 'ai';
import { openrouter } from '@/src/lib/openrouter';
import type { Difficulty } from '@/src/db/schema';
import type { UserPersonalizationContext } from './personalization';
import { buildPersonaInstruction } from '../prompts';
import { parseMarkdownToTiptap } from '../tiptap';
import type { TiptapDocument } from '../tiptap';

export interface SectionSpec {
  title: string;
  slug: string;
  topics: string[];
}

export interface GenerateSingleLessonParams {
  topic: string;
  difficulty: Difficulty;
  lessonTitle: string;
  lessonSlug: string;
  lessonDescription: string;
  sections: SectionSpec[];
  userContext: UserPersonalizationContext;
}

export interface GeneratedSection {
  slug: string;
  title: string;
  document: TiptapDocument;
}

export interface SingleLessonResult {
  lessonSlug: string;
  lessonTitle: string;
  lessonDescription: string;
  sections: GeneratedSection[];
}

/**
 * Generate content for a single lesson's sections
 *
 * Takes a lesson specification (title, description, section structure)
 * and generates the actual content for each section.
 */
export async function generateSingleLesson(
  params: GenerateSingleLessonParams
): Promise<SingleLessonResult> {
  const {
    topic,
    difficulty,
    lessonTitle,
    lessonSlug,
    lessonDescription,
    sections,
    userContext,
  } = params;

  const personaInstruction = buildPersonaInstruction(
    userContext.assistantPersona,
    userContext.assistantName,
    userContext.assistantGender
  );

  const difficultyGuidance = {
    easy: 'Provide thorough, step-by-step explanations. Assume no prior knowledge. Use simple language and many examples.',
    standard: 'Balance explanation with practice. Assume basic understanding. Include some advanced concepts.',
    hard: 'Be concise and technical. Assume strong foundation. Focus on advanced patterns and edge cases.',
  }[difficulty];

  // Build section specification for the prompt
  const sectionsSpec = sections.map((s, i) =>
    `${i + 1}. **${s.title}** (slug: ${s.slug})\n   Topics: ${s.topics.join(', ')}`
  ).join('\n');

  const systemPrompt = `You are an expert programming instructor creating lesson content.

${personaInstruction}

LESSON REQUIREMENTS:
- Course Topic: ${topic}
- Lesson Title: ${lessonTitle}
- Lesson Description: ${lessonDescription}
- Skill Level: ${difficulty}
- Approach: ${difficultyGuidance}

You need to create content for ${sections.length} sections in this lesson.

SECTIONS TO CREATE:
${sectionsSpec}

OUTPUT FORMAT:
Return a JSON object with a "sections" array. Each section must have:
- slug: The section slug (must match the slug provided)
- title: The section title
- content: The section content in EXTENDED MARKDOWN format

EXTENDED MARKDOWN FORMAT:
- Standard Markdown: # headings, **bold**, *italic*, \`code\`, lists, code blocks with \`\`\`language
- Callouts: Use :::tip, :::warning, :::note, :::info followed by content and ending with :::
- Flip Cards: Use ???Front text\\nBack text??? (consecutive cards are grouped)
- Quizzes: Use [quiz: Question | Option A | Option B* | Option C | Option D]\\nExplanation (* marks correct)

CONTENT REQUIREMENTS:
- Each section should be 300-500 words
- Include code examples where appropriate
- Use at least 2-3 interactive elements per section (callouts, quizzes, flip cards)
- Match the ${difficulty} difficulty level throughout
- Make content engaging and practical

Example section content:
\`\`\`markdown
## Introduction to useState

React's useState hook is fundamental to state management in functional components.

:::tip
Always initialize state with the correct type to avoid runtime errors!
:::

???What is useState?
A React Hook that lets you add state to functional components.
???

???When to use useState?
When you need to track data that changes over time in your component.
???

Here's a basic example:

\`\`\`javascript
const [count, setCount] = useState(0);
\`\`\`

[quiz: What does useState return? | A single value | An array with two elements* | An object | A function]
useState returns an array containing the current state value and a function to update it.
\`\`\`

Respond ONLY with valid JSON in this exact format:
{
  "sections": [
    { "slug": "section-slug", "title": "Section Title", "content": "markdown content here" }
  ]
}`;

  console.log(`[SingleLessonGenerator] Generating content for "${lessonTitle}" with ${sections.length} sections`);

  const result = await generateText({
    model: openrouter('x-ai/grok-4.1-fast'),
    prompt: systemPrompt,
    temperature: 0.7,
    maxOutputTokens: 16000, // Allow enough tokens for all sections
  });

  // Parse the JSON response
  let parsedResponse: { sections: Array<{ slug: string; title: string; content: string }> };

  try {
    // Extract JSON from response (handle possible markdown code blocks)
    let jsonText = result.text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    }
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    parsedResponse = JSON.parse(jsonText);
  } catch (parseError) {
    console.error('[SingleLessonGenerator] Failed to parse AI response:', result.text.substring(0, 500));
    throw new Error(`Failed to parse AI response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
  }

  // Convert markdown content to Tiptap JSON for each section
  const generatedSections: GeneratedSection[] = parsedResponse.sections.map((section) => {
    try {
      const document = parseMarkdownToTiptap(section.content) as TiptapDocument;
      return {
        slug: section.slug,
        title: section.title,
        document,
      };
    } catch (parseError) {
      console.error(`[SingleLessonGenerator] Failed to parse section "${section.slug}":`, parseError);
      // Return a minimal valid document if parsing fails
      return {
        slug: section.slug,
        title: section.title,
        document: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: section.content }],
            },
          ],
        },
      };
    }
  });

  console.log(`[SingleLessonGenerator] Generated ${generatedSections.length} sections for "${lessonTitle}"`);

  return {
    lessonSlug,
    lessonTitle,
    lessonDescription,
    sections: generatedSections,
  };
}
