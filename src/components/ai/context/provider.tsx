'use client';

/**
 * AI Context Provider
 *
 * Manages the AI context state for the chat system:
 * - Lesson context (set by lesson pages)
 * - Quiz context (set by quiz pages)
 * - User-added quotes (from text selection)
 *
 * Usage:
 * 1. Wrap your app with <AIContextProvider>
 * 2. Use useAIContext() hook to access/modify context
 * 3. Pages can call setLesson() or setQuiz() to set context
 * 4. Text selection component calls addQuote()
 * 5. Chat component calls getContextForAPI() when sending messages
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import type {
  AICourseContext,
  AILessonContext,
  AIQuizContext,
  AIQuote,
  AIContextState,
  AIContextActions,
} from '@/src/lib/ai/chat';

type AIContextValue = AIContextState & AIContextActions;

const AIContext = createContext<AIContextValue | null>(null);

type AIContextProviderProps = {
  children: ReactNode;
};

export function AIContextProvider({ children }: AIContextProviderProps) {
  const [course, setCourseState] = useState<AICourseContext | null>(null);
  const [lesson, setLessonState] = useState<AILessonContext | null>(null);
  const [quiz, setQuizState] = useState<AIQuizContext | null>(null);
  const [quotes, setQuotes] = useState<AIQuote[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // Ref to store pending message for stable consumePendingMessage callback
  // Fixes race condition where callback dependency on pendingMessage caused
  // multiple effect runs with inconsistent state
  const pendingMessageRef = useRef<string | null>(null);

  // Course context management
  const setCourse = useCallback((newCourse: AICourseContext | null) => {
    setCourseState(newCourse);
  }, []);

  // Lesson context management
  const setLesson = useCallback((newLesson: AILessonContext | null) => {
    setLessonState(newLesson);
  }, []);

  // Quiz context management
  const setQuiz = useCallback((newQuiz: AIQuizContext | null) => {
    setQuizState(newQuiz);
  }, []);

  // Quote management
  const addQuote = useCallback((text: string, source: string) => {
    // Limit to 5 quotes max
    setQuotes((prev) => {
      const newQuote: AIQuote = {
        text: text.slice(0, 1000), // Truncate long selections
        source,
        addedAt: new Date(),
      };
      const updated = [...prev, newQuote];
      return updated.slice(-5); // Keep only last 5
    });
  }, []);

  const removeQuote = useCallback((index: number) => {
    setQuotes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearQuotes = useCallback(() => {
    setQuotes([]);
  }, []);

  // Get context formatted for API call
  const getContextForAPI = useCallback(() => {
    return {
      course: course || undefined,
      lesson: lesson || undefined,
      quiz: quiz || undefined,
      quotes,
    };
  }, [course, lesson, quiz, quotes]);

  // Chat control
  const openChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const setChatOpen = useCallback((open: boolean) => {
    setIsChatOpen(open);
  }, []);

  const sendMessageToChat = useCallback((message: string) => {
    pendingMessageRef.current = message;
    setPendingMessage(message);
    setIsChatOpen(true);
  }, []);

  const consumePendingMessage = useCallback(() => {
    const message = pendingMessageRef.current;
    pendingMessageRef.current = null;
    setPendingMessage(null);
    return message;
  }, []);

  const value = useMemo<AIContextValue>(
    () => ({
      // State
      course,
      lesson,
      quiz,
      quotes,
      isChatOpen,
      pendingMessage,
      // Actions
      setCourse,
      setLesson,
      setQuiz,
      addQuote,
      removeQuote,
      clearQuotes,
      getContextForAPI,
      openChat,
      closeChat,
      setChatOpen,
      sendMessageToChat,
      consumePendingMessage,
    }),
    [
      course,
      lesson,
      quiz,
      quotes,
      isChatOpen,
      pendingMessage,
      setCourse,
      setLesson,
      setQuiz,
      addQuote,
      removeQuote,
      clearQuotes,
      getContextForAPI,
      openChat,
      closeChat,
      setChatOpen,
      sendMessageToChat,
      consumePendingMessage,
    ]
  );

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

/**
 * Hook to access AI context
 * Must be used within AIContextProvider
 */
export function useAIContext(): AIContextValue {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within an AIContextProvider');
  }
  return context;
}

/**
 * Hook to check if we have any context set
 * Useful for showing/hiding context indicators
 */
export function useHasAIContext(): boolean {
  const { course, lesson, quiz, quotes } = useAIContext();
  return Boolean(course || lesson || quiz || quotes.length > 0);
}
