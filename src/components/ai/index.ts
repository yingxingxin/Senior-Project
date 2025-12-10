/**
 * AI Components
 *
 * All AI-related React components including chat, context, and UI elements.
 */

// Chat components
export {
  AIChatWindow,
  type AIChatWindowHandle,
  AIChatPopup,
  AIChatTrigger,
  AIChatFAB,
  FloatingAIChat,
} from './chat';

// Context components
export {
  AIContextProvider,
  useAIContext,
  useHasAIContext,
  AIContextButton,
  AIContextViewer,
} from './context';

// UI elements
export * from './elements';
