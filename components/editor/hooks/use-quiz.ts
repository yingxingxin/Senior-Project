/**
 * useQuiz Hook
 *
 * Manages quiz question interaction state and event handlers for TiptapViewer.
 * Tracks answered questions and handles answer selection with immediate feedback.
 *
 * @param editor - Tiptap editor instance (read-only mode)
 * @returns Interaction state with total quizzes, completed count, and completion status
 */

import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';

export interface InteractionState {
  total: number;
  completed: number;
  isComplete: boolean;
}

export function useQuiz(editor: Editor | null): InteractionState {
  const [quizAnswers, setQuizAnswers] = useState<Map<string, string>>(new Map());
  const [totalQuizzes, setTotalQuizzes] = useState(0);

  // Count quiz questions in the document
  useEffect(() => {
    if (!editor) return;

    let quizCount = 0;

    editor.state.doc.descendants((node) => {
      if (node.type.name === 'quizQuestion') {
        quizCount++;
      }
    });

    setTotalQuizzes(quizCount);
  }, [editor]);

  // Handle quiz answer selection
  useEffect(() => {
    if (!editor) return;

    const handleQuizClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Find the quiz option label (clicking anywhere on the label should work)
      const optionElement = target.closest('[data-quiz-option]');
      if (!optionElement) return;

      // Get the input within the label
      const optionInput = optionElement.querySelector('.quiz-option-input') as HTMLInputElement;
      if (!optionInput) return;

      const questionElement = optionElement.closest('[data-quiz-question]');
      if (!questionElement) return;

      const selectedId = optionElement.getAttribute('data-option-id');
      const correctId = questionElement.getAttribute('data-correct-option-id');
      const explanation = questionElement.getAttribute('data-explanation');

      // Enable the radio button
      optionInput.disabled = false;
      optionInput.checked = true;

      // Mark all options in this question as checked (disable further selection)
      const allOptions = questionElement.querySelectorAll('.quiz-option-input');
      allOptions.forEach((option) => {
        (option as HTMLInputElement).disabled = true;
      });

      // Apply feedback classes
      const allOptionElements = questionElement.querySelectorAll('[data-quiz-option]');
      allOptionElements.forEach((opt) => {
        const optId = opt.getAttribute('data-option-id');
        opt.classList.remove('correct', 'incorrect');

        if (optId === correctId) {
          opt.classList.add('correct');
        } else if (optId === selectedId) {
          opt.classList.add('incorrect');
        }
      });

      // Show explanation if exists
      if (explanation) {
        let explanationElement = questionElement.querySelector('.quiz-explanation');

        if (!explanationElement) {
          explanationElement = document.createElement('div');
          explanationElement.className = 'quiz-explanation';
          explanationElement.textContent = explanation;
          questionElement.appendChild(explanationElement);
        }
      }

      // Track answer
      const questionIndex = Array.from(
        document.querySelectorAll('[data-quiz-question]')
      ).indexOf(questionElement);

      if (questionIndex !== -1 && selectedId) {
        setQuizAnswers((prev) => {
          const newMap = new Map(prev);
          newMap.set(`quiz-${questionIndex}`, selectedId);
          return newMap;
        });
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleQuizClick);

    return () => {
      editorElement.removeEventListener('click', handleQuizClick);
    };
  }, [editor]);

  return {
    total: totalQuizzes,
    completed: quizAnswers.size,
    isComplete: totalQuizzes === 0 || quizAnswers.size >= totalQuizzes,
  };
}
