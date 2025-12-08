# AI Chat System Improvement Plan

## Current State Summary

The AI chat system has a solid foundation:
- **Context Provider**: Manages lesson, quiz, and quote context
- **System Prompt**: Built dynamically with persona, user skill level, and page context
- **Model**: OpenAI GPT-4o via OpenRouter (temp: 0.7, max tokens: 1000)
- **Persona System**: Calm, Kind, Direct teaching styles

### Current Gaps

| Area | Current State | Gap |
|------|---------------|-----|
| **Section Content** | Only section *title* passed | Full content NOT passed |
| **Course Hierarchy** | Not tracked | No parent course context |
| **User Progress** | Skill level only | No completion history |
| **Tools** | None | No code execution, generation, etc. |
| **Response Format** | Plain text | No structured responses |

---

## Improvement Areas

### 1. System Prompt Improvements

#### A. Add Full Section Content

**Problem**: AI only knows the section *name* ("Introduction to Lists") but not the actual content.

**Solution**: Pass `sectionContent` to the AI context.

**File**: `app/(app)/courses/[id]/[lesson]/lesson-client.tsx`

```typescript
// Current (lines ~82-90)
setLesson({
  id: lessonMeta.id,
  title: lessonMeta.title,
  topic: lessonMeta.slug,
  currentSection: currentSection?.title,
  // sectionContent is MISSING
});

// Improved
setLesson({
  id: lessonMeta.id,
  title: lessonMeta.title,
  topic: lessonMeta.slug,
  currentSection: currentSection?.title,
  sectionContent: currentSection?.content, // Add actual content
});
```

**Considerations**:
- Content may be large - consider truncating to ~2000 chars
- May need to serialize MDX/markdown appropriately

---

#### B. Add Course Hierarchy Context

**Problem**: AI doesn't know the broader learning path.

**New Context Type**:
```typescript
type AICourseContext = {
  id: number;
  title: string;           // "Programming Foundations"
  currentLessonIndex: number;  // 5 of 12
  totalLessons: number;
  previousLesson?: string; // "Variables and Data Types"
  nextLesson?: string;     // "Loops and Iteration"
};
```

**Prompt Addition**:
```
You are helping a student in the course "[Course Title]".
They are on lesson [N] of [Total] ("[Lesson Title]").
Previously they learned: [Previous Lesson].
Next they'll learn: [Next Lesson].
```

---

#### C. Add User Progress Context

**Problem**: AI doesn't know what the user has already mastered.

**New Context Type**:
```typescript
type AIProgressContext = {
  completedLessons: string[];    // ["Variables", "Functions"]
  quizScores: { [slug: string]: number }; // { "variables": 85 }
  strugglingTopics?: string[];   // Identified weak areas
  timeInCourse: number;          // Minutes spent
};
```

**Prompt Addition**:
```
This student has completed: [list of lessons].
Their quiz scores: Variables (85%), Functions (70%).
They may need extra help with: [struggling topics].
```

---

#### D. Improve Response Guidelines

**Current Issue**: System prompt restrictions are generic.

**Improved Guidelines** (add to `src/lib/ai/prompts/persona.ts`):

```typescript
const responseGuidelines = `
## Response Format Guidelines

1. **For Concept Questions**:
   - Start with a 1-sentence summary
   - Provide a simple example
   - Connect to what they're learning

2. **For "I don't understand" Questions**:
   - Ask a clarifying question first
   - Break down into smaller pieces
   - Use analogies appropriate to skill level

3. **For Code Help**:
   - Show minimal working examples
   - Explain each line
   - Point to related concepts in the lesson

4. **For Quiz Questions**:
   - NEVER give the answer directly
   - Guide through reasoning
   - Ask leading questions
   - After they answer: explain why right/wrong

## Programming-Only Enforcement

If asked about non-programming topics:
- ${persona === 'calm' ? 'Calmly acknowledge and redirect: "I appreciate your curiosity! Let\'s focus on the programming concept at hand..."' : ''}
- ${persona === 'kind' ? 'Warmly redirect: "Great question! But I\'m here to help with programming. Speaking of which..."' : ''}
- ${persona === 'direct' ? 'Redirect efficiently: "Let\'s stay on topic. Back to programming..."' : ''}
`;
```

---

### 2. Context Visibility Improvements

#### A. Make Section Content Visible

**Files to modify**:
1. `app/(app)/courses/[id]/[lesson]/lesson-client.tsx` - Pass content
2. `src/lib/ai/service.ts` - Include in system prompt
3. `components/ai-context-button.tsx` - Show preview in UI

**Implementation**:

```typescript
// In lesson-client.tsx - need to get section content
const getSectionContent = (section: Section): string => {
  // If MDX, serialize to plain text
  // Truncate to reasonable length (~2000 chars)
  return section.content?.substring(0, 2000) ?? '';
};

useEffect(() => {
  setLesson({
    id: lessonMeta.id,
    title: lessonMeta.title,
    topic: lessonMeta.slug,
    currentSection: currentSection?.title,
    sectionContent: currentSection ? getSectionContent(currentSection) : undefined,
  });
  return () => setLesson(null);
}, [lessonMeta, currentSection, setLesson]);
```

---

#### B. Add Context Preview to Chat

**Problem**: Users don't know what the AI "sees".

**Solution**: Expand `AIContextButton` to show more detail.

**File**: `components/ai-context-button.tsx`

Add a "What I know" section:
```tsx
<HoverCardContent>
  <div className="space-y-2">
    <p className="font-medium">What I can see:</p>
    {context.lesson && (
      <div className="text-sm">
        <span className="text-muted-foreground">Lesson:</span> {context.lesson.title}
        {context.lesson.sectionContent && (
          <p className="text-xs text-muted-foreground mt-1">
            (Section content: {context.lesson.sectionContent.length} chars)
          </p>
        )}
      </div>
    )}
    {/* ... quiz, quotes ... */}
  </div>
</HoverCardContent>
```

---

### 3. AI Tools / Capabilities

#### A. Code Example Generation Tool

**Concept**: AI can generate runnable code examples.

**Implementation Options**:

1. **Structured Output** (Recommended for v1):
   ```typescript
   // Add to API response
   type AIResponse = {
     message: string;
     codeExamples?: {
       language: string;
       code: string;
       explanation: string;
     }[];
   };
   ```

2. **True Tool Calling** (v2):
   - Use OpenAI function calling
   - AI decides when to generate code vs explain
   - Requires API changes

**Prompt Addition for v1**:
```
When providing code examples, format them as:
\`\`\`[language]
// Your code here
\`\`\`
Then explain what each part does.
```

---

#### B. Quiz Hint Tool

**Concept**: Provide structured hints without giving away answers.

**Implementation**:
```typescript
const quizHintSystem = `
When helping with quiz questions, use this progression:
1. First hint: Rephrase the question
2. Second hint: Point to relevant concept
3. Third hint: Eliminate one wrong answer
4. Final hint: Give strong clue without direct answer

Track hint level in conversation and progress accordingly.
`;
```

---

#### C. Concept Lookup Tool (Future)

**Concept**: AI can reference a knowledge base of programming concepts.

**Implementation** (requires additional infrastructure):
- Build a vector database of programming concepts
- AI can query: "What did we cover about arrays?"
- Returns relevant lesson excerpts

---

### 4. Response Quality Improvements

#### A. Add Skill-Level Adaptation Examples

**File**: `src/lib/ai/prompts/persona.ts`

```typescript
const skillLevelExamples = {
  beginner: `
    For beginners:
    - Use simple analogies (lists are like shopping lists)
    - Avoid jargon, or define it immediately
    - Show one concept at a time
    - Celebrate small wins
  `,
  intermediate: `
    For intermediate learners:
    - Use technical terms with brief reminders
    - Show practical applications
    - Connect to concepts they know
    - Challenge them slightly
  `,
  advanced: `
    For advanced learners:
    - Use precise technical language
    - Discuss trade-offs and alternatives
    - Point to edge cases
    - Encourage deeper exploration
  `
};
```

---

#### B. Add Conversation Memory Context

**Problem**: AI doesn't remember what was discussed earlier in session.

**Current**: Messages are sent but no summary of past topics.

**Improvement**: Add conversation summary to context:
```typescript
type AIConversationContext = {
  topicsDiscussed: string[];      // ["arrays", "indexing"]
  questionsAsked: number;
  clarificationsNeeded: string[]; // Topics needing review
};
```

---

## Implementation Priority

### Phase 1: Quick Wins (Low effort, High impact)
1. [ ] Pass `sectionContent` to AI context
2. [ ] Improve system prompt response guidelines
3. [ ] Add skill-level specific examples to prompt

### Phase 2: Context Enhancements (Medium effort)
4. [ ] Add course hierarchy context
5. [ ] Improve context visibility in UI
6. [ ] Add quiz hint progression system

### Phase 3: Advanced Features (Higher effort)
7. [ ] Add user progress context
8. [ ] Implement structured code examples
9. [ ] Add conversation memory/summary

### Phase 4: Future Considerations
10. [ ] Tool calling for code generation
11. [ ] Concept lookup from knowledge base
12. [ ] Streaming responses

---

## Specific File Changes Required

### To Pass Section Content:

1. **`app/(app)/courses/[id]/[lesson]/lesson-client.tsx`**
   - Modify `setLesson()` call to include `sectionContent`

2. **`src/lib/ai/types.ts`**
   - Verify `AILessonContext` has `sectionContent?: string`

3. **`src/lib/ai/service.ts`**
   - Update `buildLessonContextSection()` to use content

### To Improve System Prompt:

1. **`src/lib/ai/prompts/persona.ts`**
   - Add skill-level specific teaching examples
   - Add response format guidelines
   - Improve off-topic handling

2. **`src/lib/ai/service.ts`**
   - Update `buildSystemPrompt()` with new sections

### To Add Course Context:

1. **`src/lib/ai/types.ts`**
   - Add `AICourseContext` type

2. **`components/ai-context-provider.tsx`**
   - Add `course` to context state
   - Add `setCourse()` action

3. **`app/(app)/courses/[id]/[lesson]/lesson-client.tsx`**
   - Call `setCourse()` with course info

---

## Questions to Consider

1. **Content Size**: How much section content is too much? (Token limits)
2. **Privacy**: Should AI see user's quiz answers before submission?
3. **Persistence**: Should conversation history persist across sessions?
4. **Analytics**: Should we track what questions students ask most?
5. **Fallback**: What happens if OpenRouter API is down?

---

## Success Metrics

- **Relevance**: Are AI responses more contextually relevant?
- **Helpfulness**: Do students report better understanding?
- **Engagement**: Do students use the AI chat more?
- **Accuracy**: Does AI stay on-topic better?
