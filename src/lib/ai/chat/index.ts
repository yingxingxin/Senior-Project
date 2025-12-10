/**
 * Chat Module
 *
 * General AI chat functionality including:
 * - Context types and interfaces
 * - AI response generation service
 * - Text extraction and processing utilities
 */

// Types
export type {
  AIUserContext,
  AIAssistantContext,
  AICourseContext,
  AILessonContext,
  AIQuizContext,
  AIQuote,
  AIContext,
  AIChatMessage,
  AIRequest,
  AIResponse,
  AIContextState,
  AIContextActions,
} from './types';

// Service
export { generateAIResponse } from './service';

// Utilities
export { extractTextFromTiptap, truncateContent, prepareSectionContent } from './utils';
