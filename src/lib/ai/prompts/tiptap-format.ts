/**
 * Tiptap JSON Format Instructions
 *
 * Detailed specification of Tiptap JSON structure for AI to generate.
 * Includes all custom nodes and their expected format.
 */

export const TIPTAP_FORMAT_INSTRUCTIONS = `# Tiptap JSON Format Specification

You must generate lesson content as valid Tiptap JSON. Here's the structure:

## Document Root
\`\`\`json
{
  "type": "doc",
  "content": [/* array of block nodes */]
}
\`\`\`

## Available Node Types

### 1. Heading
\`\`\`json
{
  "type": "heading",
  "attrs": { "level": 1 },  // 1-6
  "content": [{ "type": "text", "text": "Heading Text" }]
}
\`\`\`

### 2. Paragraph
\`\`\`json
{
  "type": "paragraph",
  "content": [
    { "type": "text", "text": "Regular text" },
    { "type": "text", "text": "bold text", "marks": [{ "type": "bold" }] },
    { "type": "text", "text": "italic text", "marks": [{ "type": "italic" }] },
    { "type": "text", "text": "code", "marks": [{ "type": "code" }] }
  ]
}
\`\`\`

**Text Marks Available:**
- \`bold\`: Bold text
- \`italic\`: Italic text
- \`code\`: Inline code
- \`link\`: Hyperlink with \`attrs: { href: "url" }\`

### 3. Code Block Enhanced
\`\`\`json
{
  "type": "codeBlockEnhanced",
  "attrs": {
    "language": "javascript",  // or "python", "typescript", etc.
    "filename": "example.js",   // optional
    "showLineNumbers": true     // optional, default true
  },
  "content": [{ "type": "text", "text": "const x = 42;" }]
}
\`\`\`

**Supported Languages:**
javascript, typescript, python, java, cpp, rust, go, html, css, sql, bash, json

### 4. Callout (Alert Boxes)
\`\`\`json
{
  "type": "callout",
  "attrs": { "type": "tip" },  // tip, warning, note, info, success, error
  "content": [
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "Callout content here" }]
    }
  ]
}
\`\`\`

**Callout Types:**
- \`tip\`: Helpful suggestions (💡 lightbulb icon)
- \`warning\`: Important caveats (⚠️ warning triangle)
- \`note\`: Additional context (📝 note icon)
- \`info\`: Informational (ℹ️ info icon)
- \`success\`: Positive reinforcement (✓ check icon)
- \`error\`: Common mistakes (✗ X icon)

### 5. Bullet List
\`\`\`json
{
  "type": "bulletList",
  "content": [
    {
      "type": "listItem",
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "List item 1" }]
        }
      ]
    }
  ]
}
\`\`\`

### 6. Ordered List
\`\`\`json
{
  "type": "orderedList",
  "attrs": { "start": 1 },
  "content": [
    {
      "type": "listItem",
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Step 1" }]
        }
      ]
    }
  ]
}
\`\`\`

### 7. Quiz Question (Interactive)
\`\`\`json
{
  "type": "quizQuestion",
  "attrs": {
    "correctAnswer": "a",      // ID of correct option
    "explanation": "Explanation of why this is correct"
  },
  "content": [
    {
      "type": "paragraph",
      "content": [{ "type": "text", "text": "What is the question?" }]
    },
    {
      "type": "quizOption",
      "attrs": { "id": "a" },
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Option A text" }]
        }
      ]
    },
    {
      "type": "quizOption",
      "attrs": { "id": "b" },
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "Option B text" }]
        }
      ]
    }
  ]
}
\`\`\`

**Quiz Guidelines:**
- 2-4 options per question
- Use IDs: "a", "b", "c", "d"
- Always include explanation
- Make distractors plausible

### 8. Flip Card Group (Study Cards)
\`\`\`json
{
  "type": "flipCardGroup",
  "attrs": { "columns": 3 },  // 2, 3, or 4 columns
  "content": [
    {
      "type": "flipCard",
      "content": [
        {
          "type": "flipCardFront",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Term or Question" }]
            }
          ]
        },
        {
          "type": "flipCardBack",
          "content": [
            {
              "type": "paragraph",
              "content": [{ "type": "text", "text": "Definition or Answer" }]
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

**Use for:** Key terms, vocabulary, concept review

### 9. Drag Order Exercise
\`\`\`json
{
  "type": "dragOrderExercise",
  "attrs": {
    "instructions": "Arrange these steps in the correct order"
  },
  "content": [
    {
      "type": "dragOrderItem",
      "attrs": {
        "id": "item1",
        "correctPosition": 0  // 0-based index
      },
      "content": [
        {
          "type": "paragraph",
          "content": [{ "type": "text", "text": "First step" }]
        }
      ]
    }
  ]
}
\`\`\`

**Guidelines:**
- 4-6 items recommended
- Use correctPosition: 0, 1, 2, 3...
- Clear, concise item text

### 10. Horizontal Rule
\`\`\`json
{ "type": "horizontalRule" }
\`\`\`

## Content Structure Guidelines

1. **Start with a heading** (usually h1 for section title)
2. **Mix content types** for engagement
3. **Use code blocks** for all code examples
4. **Add callouts** for important points (frequency depends on persona)
5. **Include interactive elements** (quizzes, flip cards) for practice
6. **Break up long text** with lists, code blocks, callouts

## Example Lesson Section
\`\`\`json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Understanding Variables" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "Variables are containers for storing data values. In JavaScript, we use " },
        { "type": "text", "text": "let", "marks": [{ "type": "code" }] },
        { "type": "text", "text": ", " },
        { "type": "text", "text": "const", "marks": [{ "type": "code" }] },
        { "type": "text", "text": ", or " },
        { "type": "text", "text": "var", "marks": [{ "type": "code" }] },
        { "type": "text", "text": " to declare variables." }
      ]
    },
    {
      "type": "codeBlockEnhanced",
      "attrs": {
        "language": "javascript",
        "filename": "variables.js",
        "showLineNumbers": true
      },
      "content": [
        {
          "type": "text",
          "text": "let age = 25;\\nconst name = \\"John\\";\\nvar isStudent = true;"
        }
      ]
    },
    {
      "type": "callout",
      "attrs": { "type": "tip" },
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Use " },
            { "type": "text", "text": "const", "marks": [{ "type": "code" }] },
            { "type": "text", "text": " by default, and only use " },
            { "type": "text", "text": "let", "marks": [{ "type": "code" }] },
            { "type": "text", "text": " when you need to reassign the variable." }
          ]
        }
      ]
    }
  ]
}
\`\`\`

## CRITICAL RULES

1. **Always output valid JSON** - no syntax errors
2. **All text must be in text nodes** - never as direct strings
3. **Paragraphs are required** inside list items, callouts, quiz options
4. **Use \\n for newlines** in code blocks (not actual line breaks)
5. **Escape quotes** in JSON strings: \\" not "
6. **Include content arrays** even for single items
7. **attrs are required** for nodes that expect them

## Validation Checklist

Before outputting, verify:
- [ ] Root node is \`{ "type": "doc", "content": [...] }\`
- [ ] All nodes have required \`type\` field
- [ ] Text content uses \`{ "type": "text", "text": "..." }\`
- [ ] Code blocks use \\n for line breaks
- [ ] All JSON is properly escaped
- [ ] Interactive elements (quizzes, flip cards) are complete
`;
