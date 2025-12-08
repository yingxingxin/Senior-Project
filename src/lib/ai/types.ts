/**
 * AI Context System Types
 *
 * Unified types for the AI context system that provides:
 * - Session-based user/assistant info (auto-populated)
 * - Page-specific context (lesson, quiz)
 * - User-added quotes (text selection)
 */

import type { AssistantPersona, SkillLevel } from '@/src/db/schema';

/**
 * User context - auto-populated from session
 */
export type AIUserContext = {
  id: number;
  name: string;
  skillLevel: SkillLevel;
};

/**
 * Assistant context - auto-populated from user's selected assistant
 */
export type AIAssistantContext = {
  id: number;
  name: string;
  persona: AssistantPersona;
  gender: 'feminine' | 'masculine' | 'androgynous';
};

/**
 * Lesson context - set by lesson pages
 */
export type AILessonContext = {
  id: number;
  title: string;
  topic: string;
  currentSection?: string;
  sectionContent?: string;
};

/**
 * Quiz context - set by quiz pages
 */
export type AIQuizContext = {
  id: number;
  title: string;
  question?: {
    id: number;
    prompt: string;
    options: string[];
    selectedIndex?: number;
    correctIndex?: number; // Only included after answer submitted
  };
};

/**
 * User-added quote from text selection
 */
export type AIQuote = {
  text: string;
  source: string; // e.g., "Python Loops lesson"
  addedAt: Date;
};

/**
 * Full AI context passed to the AI service
 */
export type AIContext = {
  // Auto-populated from session
  user: AIUserContext;
  assistant: AIAssistantContext;

  // Page-specific (set by pages via context provider)
  lesson?: AILessonContext;
  quiz?: AIQuizContext;

  // User-added quotes from text selection
  quotes: AIQuote[];
};

/**
 * Chat message format
 */
export type AIChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

/**
 * Request to the AI API
 */
export type AIRequest = {
  messages: AIChatMessage[];
  context: Omit<AIContext, 'user' | 'assistant'>; // User/assistant auto-populated server-side
};

/**
 * Response from the AI API
 */
export type AIResponse = {
  message: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
};

/**
 * Client-side context state (managed by AIContextProvider)
 */
export type AIContextState = {
  lesson: AILessonContext | null;
  quiz: AIQuizContext | null;
  quotes: AIQuote[];
  isChatOpen: boolean;
  pendingMessage: string | null; // Message to auto-send when chat opens
};

/**
 * Actions available from the AIContextProvider
 */
export type AIContextActions = {
  setLesson: (lesson: AILessonContext | null) => void;
  setQuiz: (quiz: AIQuizContext | null) => void;
  addQuote: (text: string, source: string) => void;
  removeQuote: (index: number) => void;
  clearQuotes: () => void;
  getContextForAPI: () => Omit<AIContext, 'user' | 'assistant'>;
  // Chat control
  openChat: () => void;
  closeChat: () => void;
  setChatOpen: (open: boolean) => void;
  sendMessageToChat: (message: string) => void; // Opens chat and queues message
  consumePendingMessage: () => string | null; // Returns and clears pending message
};
