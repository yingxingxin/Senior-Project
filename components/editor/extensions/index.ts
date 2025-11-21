/**
 * Tiptap Custom Extensions
 *
 * All custom Tiptap extensions for the course content system.
 * These extensions enable rich content formatting and interactive elements.
 */

// Content formatting extensions
export { Callout, type CalloutOptions, type CalloutType } from './callout';
export { CodeBlockEnhanced, type CodeBlockEnhancedOptions } from './code-block-enhanced';

// Interactive content extensions
export {
  FlipCardGroup,
  FlipCard,
  FlipCardFront,
  FlipCardBack,
  type FlipCardGroupOptions,
  type FlipCardOptions,
  type FlipCardFrontOptions,
  type FlipCardBackOptions,
} from './flip-card';

export {
  QuizQuestion,
  QuizOption,
  type QuizQuestionOptions,
  type QuizOptionOptions,
} from './quiz-question';

export {
  DragOrderExercise,
  DragOrderItem,
  type DragOrderExerciseOptions,
  type DragOrderItemOptions,
} from './drag-order-exercise';
