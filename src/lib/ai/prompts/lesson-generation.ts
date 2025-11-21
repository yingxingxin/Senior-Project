/**
 * Lesson Generation Prompt Builder
 *
 * Constructs personalized prompts for AI lesson generation.
 * Combines persona, skill level, topic, and Tiptap format instructions.
 */

import type { AssistantPersona, SkillLevel, Difficulty } from '@/db/schema';
import { buildPersonaInstruction, PERSONA_CALLOUT_USAGE } from './persona-prompts';
import { TIPTAP_FORMAT_INSTRUCTIONS } from './tiptap-format';

interface LessonGenerationParams {
  // User context
  userId: number;
  assistantName: string;
  assistantGender: string;
  persona: AssistantPersona;
  skillLevel: SkillLevel;

  // Lesson parameters
  topic: string;
  difficulty?: Difficulty;
  context?: string;
  estimatedDurationMinutes?: number;
  languagePreference?: string;
  paradigmPreference?: string;
}

/**
 * Skill level adaptations
 */
const SKILL_LEVEL_INSTRUCTIONS: Record<SkillLevel, string> = {
  beginner: `## Teaching Level: Beginner

- **Explanation Depth**: Thorough - explain fundamental concepts in detail
- **Assumed Knowledge**: Minimal - don't assume prior knowledge
- **Vocabulary**: Simple - avoid jargon or define it clearly
- **Examples**: Multiple (3+) - show concepts from different angles
- **Pacing**: Slow and steady - break complex ideas into small steps
- **Analogies**: Use relatable, everyday comparisons
- **Prerequisites**: List what learner should know first (if any)`,

  intermediate: `## Teaching Level: Intermediate

- **Explanation Depth**: Moderate - build on assumed fundamentals
- **Assumed Knowledge**: Core concepts - learner knows basics
- **Vocabulary**: Standard - use technical terms with brief explanations
- **Examples**: Balanced (2-3) - mix theory with practice
- **Pacing**: Moderate - move efficiently through material
- **Focus**: Edge cases, nuances, best practices
- **Prerequisites**: Reference related concepts learner should know`,

  advanced: `## Teaching Level: Advanced

- **Explanation Depth**: Concise - focus on nuance and depth
- **Assumed Knowledge**: Strong foundation - learner is experienced
- **Vocabulary**: Technical - use precise terminology
- **Examples**: Targeted (1-2) - show complex scenarios
- **Pacing**: Fast - cover material efficiently
- **Focus**: Advanced patterns, optimization, trade-offs
- **Prerequisites**: Assume knowledge of fundamentals`,
};

/**
 * Difficulty adaptations (distinct from skill level)
 */
const DIFFICULTY_INSTRUCTIONS: Record<Difficulty, string> = {
  easy: `## Content Difficulty: Easy
- Choose straightforward examples
- Avoid edge cases initially
- Focus on "happy path" scenarios
- Keep exercises simple and guided`,

  standard: `## Content Difficulty: Standard
- Include common edge cases
- Balance theory and practice
- Exercises should challenge but not overwhelm
- Cover standard use cases thoroughly`,

  hard: `## Content Difficulty: Advanced
- Include complex scenarios and edge cases
- Explore trade-offs and alternatives
- Exercises should require critical thinking
- Cover advanced patterns and optimizations`,
};

/**
 * Build complete system prompt for lesson generation
 */
export function buildLessonGenerationPrompt(params: LessonGenerationParams): string {
  const {
    assistantName,
    assistantGender,
    persona,
    skillLevel,
    topic,
    difficulty = 'standard',
    context,
    estimatedDurationMinutes,
    languagePreference,
    paradigmPreference,
  } = params;

  const personaInstruction = buildPersonaInstruction(persona, assistantName, assistantGender);
  const skillLevelInstruction = SKILL_LEVEL_INSTRUCTIONS[skillLevel];
  const difficultyInstruction = DIFFICULTY_INSTRUCTIONS[difficulty];
  const calloutUsage = PERSONA_CALLOUT_USAGE[persona];

  // Build optional context sections
  const languageContext = languagePreference
    ? `## Programming Language: ${languagePreference}
- Use ${languagePreference} for all code examples
- Follow ${languagePreference} conventions and idioms
- Reference ${languagePreference}-specific features when relevant`
    : '';

  const paradigmContext = paradigmPreference
    ? `## Programming Paradigm: ${paradigmPreference}
- Favor ${paradigmPreference} patterns and approaches
- Show examples that align with ${paradigmPreference} principles`
    : '';

  const userContext = context
    ? `## User Context
The user provided this context:
"${context}"

Use this to better understand what they're looking for.`
    : '';

  const durationGuideline = estimatedDurationMinutes
    ? `## Target Duration: ${estimatedDurationMinutes} minutes
- Aim for ${Math.floor(estimatedDurationMinutes / 5)}-${Math.floor(estimatedDurationMinutes / 3)} sections
- Keep content appropriately scoped for the time budget
- Don't try to cover everything - focus on key concepts`
    : '';

  return `${personaInstruction}

${skillLevelInstruction}

${difficultyInstruction}

${languageContext}

${paradigmContext}

${durationGuideline}

${userContext}

## Callout Usage for Your Persona
- **Preferred Types**: ${calloutUsage.preferred.join(', ')}
- **Frequency**: ${calloutUsage.frequency}
- **Style**: ${calloutUsage.style}

---

# Your Task: Create a Lesson on "${topic}"

Create a comprehensive, engaging lesson that teaches this topic. Structure your lesson with:

1. **Introduction Section**
   - Start with a ${persona === 'calm' ? 'clear heading' : persona === 'kind' ? 'welcoming heading' : 'direct heading'}
   - Brief overview of what will be learned
   - Why this topic matters (keep it ${persona === 'direct' ? 'brief' : persona === 'kind' ? 'encouraging' : 'insightful'})

2. **Core Content Sections** (3-6 sections depending on complexity)
   - Break the topic into logical chunks
   - Use headings (h2 or h3) for each section
   - Include:
     * Clear explanations
     * Code examples (use codeBlockEnhanced nodes)
     * Callouts for important points
     * Practical examples

3. **Interactive Elements** (choose 2-3 based on content)
   - Quiz questions (quizQuestion) - to check understanding
   - Flip cards (flipCardGroup) - for key terms/concepts
   - Drag order exercises (dragOrderExercise) - for sequential processes

4. **Summary/Next Steps Section**
   - Recap key points (${persona === 'kind' ? 'celebrate what they learned' : persona === 'direct' ? 'quick bullet list' : 'thoughtful summary'})
   - Suggest where to go next (optional)

## Content Quality Requirements

- **Accuracy**: All technical information must be correct
- **Completeness**: Cover the topic thoroughly for the skill level
- **Examples**: Every major concept needs a code example
- **Engagement**: Mix content types to maintain interest
- **Persona Consistency**: Maintain ${assistantName}'s ${persona} personality throughout

${TIPTAP_FORMAT_INSTRUCTIONS}

## Final Output Format

Output ONLY valid Tiptap JSON starting with:
\`\`\`json
{
  "type": "doc",
  "content": [
    // your lesson content here
  ]
}
\`\`\`

Do not include any text before or after the JSON. Just pure, valid JSON.`;
}

/**
 * Build prompt for regenerating a section with feedback
 */
export function buildSectionRegenerationPrompt(params: {
  existingContent: string;
  feedback: string;
  persona: AssistantPersona;
  skillLevel: SkillLevel;
}): string {
  const { existingContent, feedback, persona, skillLevel } = params;

  return `You previously generated this lesson section:

${existingContent}

The user provided this feedback:
"${feedback}"

Based on this feedback, regenerate the section to better meet their needs while:
1. Maintaining your ${persona} personality
2. Keeping the ${skillLevel} skill level appropriate
3. Addressing the specific feedback
4. Outputting valid Tiptap JSON

${TIPTAP_FORMAT_INSTRUCTIONS}

Output ONLY the regenerated Tiptap JSON, starting with { "type": "doc", "content": [...] }`;
}
