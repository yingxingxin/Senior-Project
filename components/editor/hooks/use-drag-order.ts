/**
 * useDragOrder Hook
 *
 * Manages drag-and-drop ordering exercise interaction state and event handlers.
 * Handles item dragging, order persistence, validation, and completion tracking.
 *
 * @param editor - Tiptap editor instance (read-only mode)
 * @returns Interaction state with total exercises, completed count, and completion status
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Editor } from '@tiptap/react';

export interface InteractionState {
  total: number;
  completed: number;
  isComplete: boolean;
}

export function useDragOrder(editor: Editor | null): InteractionState {
  const [exerciseCompleted, setExerciseCompleted] = useState<Set<number>>(new Set());
  const [totalExercises, setTotalExercises] = useState(0);
  const [dragExerciseOrder, setDragExerciseOrder] = useState<Map<number, string[]>>(new Map());
  const draggingItemRef = useRef<HTMLElement | null>(null);

  // Count drag order exercises in the document
  useEffect(() => {
    if (!editor) return;

    let exerciseCount = 0;

    editor.state.doc.descendants((node) => {
      if (node.type.name === 'dragOrderExercise') {
        exerciseCount++;
      }
    });

    setTotalExercises(exerciseCount);
  }, [editor]);

  // Initialize and apply drag exercise order
  useEffect(() => {
    if (!editor) return;

    const editorElement = editor.view.dom;
    const exercises = editorElement.querySelectorAll('[data-drag-order-exercise]');

    exercises.forEach((exercise, exerciseIndex) => {
      const items = exercise.querySelectorAll('[data-drag-order-item]');

      // Initialize order if not already set
      if (!dragExerciseOrder.has(exerciseIndex)) {
        const initialOrder = Array.from(items).map((item) => {
          // Use data-correct-position as a unique ID
          return item.getAttribute('data-correct-position') || String(Array.from(items).indexOf(item));
        });

        setDragExerciseOrder((prev) => {
          const newMap = new Map(prev);
          newMap.set(exerciseIndex, initialOrder);
          return newMap;
        });
      } else {
        // Apply stored order to DOM
        const currentOrder = dragExerciseOrder.get(exerciseIndex);
        if (currentOrder) {
          const itemsContainer = exercise.querySelector('.drag-order-items');
          if (itemsContainer) {
            const itemsArray = Array.from(items);

            // Reorder DOM elements based on state
            currentOrder.forEach((itemId) => {
              const item = itemsArray.find(
                (el) => el.getAttribute('data-correct-position') === itemId
              );
              if (item) {
                itemsContainer.appendChild(item);
              }
            });
          }
        }
      }
    });
  }, [editor, dragExerciseOrder]);

  // Persist exercise order to state
  const persistExerciseOrder = useCallback((exerciseElement: Element) => {
    const items = Array.from(exerciseElement.querySelectorAll('[data-drag-order-item]'));
    if (items.length === 0) return;

    const newOrder = items.map((item, index) => {
      return item.getAttribute('data-correct-position') || String(index);
    });

    const allExercises = Array.from(document.querySelectorAll('[data-drag-order-exercise]'));
    const exerciseIndex = allExercises.indexOf(exerciseElement);

    if (exerciseIndex !== -1) {
      setDragExerciseOrder((prev) => {
        const currentOrder = prev.get(exerciseIndex);
        const isSameOrder =
          currentOrder &&
          currentOrder.length === newOrder.length &&
          currentOrder.every((id, idx) => id === newOrder[idx]);

        if (isSameOrder) {
          return prev;
        }

        const newMap = new Map(prev);
        newMap.set(exerciseIndex, newOrder);
        return newMap;
      });
    }
  }, []);

  // Drag event handlers
  const handleDragStart = useCallback((event: DragEvent) => {
    const target = event.target as HTMLElement;
    const itemElement = target.closest('[data-drag-order-item]') as HTMLElement | null;

    if (itemElement) {
      draggingItemRef.current = itemElement;
      event.dataTransfer!.effectAllowed = 'move';
      event.dataTransfer!.setData('text/plain', itemElement.getAttribute('data-correct-position') || '');
      itemElement.classList.add('dragging');
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEvent) => {
    const itemElement =
      draggingItemRef.current || (event.target as HTMLElement).closest('[data-drag-order-item]');

    if (itemElement) {
      itemElement.classList.remove('dragging');
      itemElement.classList.remove('drag-over');

      const exerciseElement = itemElement.closest('[data-drag-order-exercise]');
      if (exerciseElement) {
        persistExerciseOrder(exerciseElement);
      }
    }

    draggingItemRef.current = null;
  }, [persistExerciseOrder]);

  const handleDragEnter = useCallback((event: DragEvent) => {
    const target = event.target as HTMLElement;
    const itemElement = target.closest('[data-drag-order-item]');
    const dragging = draggingItemRef.current;

    if (itemElement && dragging && dragging !== itemElement) {
      itemElement.classList.add('drag-over');
    }
  }, []);

  const handleDragLeave = useCallback((event: DragEvent) => {
    const target = event.target as HTMLElement;
    const itemElement = target.closest('[data-drag-order-item]');

    if (itemElement) {
      itemElement.classList.remove('drag-over');
    }
  }, []);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    const target = event.target as HTMLElement;
    const itemElement = target.closest('[data-drag-order-item]');
    const dragging = draggingItemRef.current;

    if (itemElement && dragging && dragging !== itemElement) {
      const container = itemElement.parentElement;
      if (!container) return;

      const targetRect = itemElement.getBoundingClientRect();
      const shouldPlaceAfter = event.clientY > targetRect.top + targetRect.height / 2;

      if (shouldPlaceAfter) {
        container.insertBefore(dragging, itemElement.nextSibling);
      } else {
        container.insertBefore(dragging, itemElement);
      }

      itemElement.classList.add('drag-over');
    }
  }, []);

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const target = event.target as HTMLElement;
    const itemElement = target.closest('[data-drag-order-item]') as HTMLElement | null;
    const dragging = draggingItemRef.current;
    const exerciseElement =
      (itemElement || dragging)?.closest('[data-drag-order-exercise]') || null;

    if (exerciseElement) {
      exerciseElement
        .querySelectorAll('.drag-over')
        .forEach((el) => el.classList.remove('drag-over'));
    }

    if (dragging && itemElement && dragging !== itemElement) {
      const container = itemElement.parentElement;
      if (container) {
        const targetRect = itemElement.getBoundingClientRect();
        const shouldPlaceAfter = event.clientY > targetRect.top + targetRect.height / 2;

        if (shouldPlaceAfter) {
          container.insertBefore(dragging, itemElement.nextSibling);
        } else {
          container.insertBefore(dragging, itemElement);
        }
      }
    }

    if (exerciseElement) {
      persistExerciseOrder(exerciseElement);
    }

    if (dragging) {
      dragging.classList.remove('dragging');
    }

    draggingItemRef.current = null;
  }, [persistExerciseOrder]);

  // Check order validation
  const handleCheckOrder = useCallback((exerciseElement: Element) => {
    const items = Array.from(
      exerciseElement.querySelectorAll('[data-drag-order-item]')
    );

    let isCorrect = true;
    items.forEach((item, index) => {
      const correctPosition = parseInt(
        item.getAttribute('data-correct-position') || '0',
        10
      );
      item.classList.remove('correct', 'incorrect');

      if (correctPosition === index) {
        item.classList.add('correct');
      } else {
        item.classList.add('incorrect');
        isCorrect = false;
      }
    });

    // Show feedback
    let feedbackElement = exerciseElement.querySelector('.drag-order-feedback');
    if (!feedbackElement) {
      feedbackElement = document.createElement('div');
      feedbackElement.className = 'drag-order-feedback';
      exerciseElement.appendChild(feedbackElement);
    }

    if (isCorrect) {
      feedbackElement.textContent = '✓ Correct! Well done.';
      feedbackElement.classList.remove('incorrect');
      feedbackElement.classList.add('correct');

      // Track completion
      const exerciseIndex = Array.from(
        document.querySelectorAll('[data-drag-order-exercise]')
      ).indexOf(exerciseElement);

      if (exerciseIndex !== -1) {
        setExerciseCompleted((prev) => {
          const newSet = new Set(prev);
          newSet.add(exerciseIndex);
          return newSet;
        });
      }
    } else {
      feedbackElement.textContent = '✗ Not quite. Try again!';
      feedbackElement.classList.remove('correct');
      feedbackElement.classList.add('incorrect');
    }
  }, []);

  // Setup drag-and-drop event listeners
  useEffect(() => {
    if (!editor) return;

    const editorElement = editor.view.dom;
    const addListeners = (item: Element) => {
      const element = item as HTMLElement;
      if (element.dataset.dragInitialized === 'true') return;

      element.draggable = true;
      element.dataset.dragInitialized = 'true';
      element.addEventListener('dragstart', handleDragStart as EventListener);
      element.addEventListener('dragenter', handleDragEnter as EventListener);
      element.addEventListener('dragleave', handleDragLeave as EventListener);
      element.addEventListener('dragend', handleDragEnd as EventListener);
      element.addEventListener('dragover', handleDragOver as EventListener);
      element.addEventListener('drop', handleDrop as EventListener);
    };

    const removeListeners = (item: Element) => {
      const element = item as HTMLElement;
      element.removeEventListener('dragstart', handleDragStart as EventListener);
      element.removeEventListener('dragenter', handleDragEnter as EventListener);
      element.removeEventListener('dragleave', handleDragLeave as EventListener);
      element.removeEventListener('dragend', handleDragEnd as EventListener);
      element.removeEventListener('dragover', handleDragOver as EventListener);
      element.removeEventListener('drop', handleDrop as EventListener);
      delete element.dataset.dragInitialized;
    };

    const addCheckButtons = () => {
      const exercises = editorElement.querySelectorAll('[data-drag-order-exercise]');
      exercises.forEach((exercise) => {
        if (!exercise.querySelector('.drag-order-check-button')) {
          const checkButton = document.createElement('button');
          checkButton.className = 'drag-order-check-button';
          checkButton.textContent = 'Check Order';
          checkButton.addEventListener('click', () => handleCheckOrder(exercise));
          exercise.appendChild(checkButton);
        }
      });
    };

    const setupDragAndDrop = () => {
      const items = Array.from(editorElement.querySelectorAll('[data-drag-order-item]'));
      items.forEach(addListeners);
      addCheckButtons();
    };

    setupDragAndDrop();

    const observer = new MutationObserver(() => {
      setupDragAndDrop();
    });

    observer.observe(editorElement, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      const items = Array.from(editorElement.querySelectorAll('[data-drag-order-item]'));
      items.forEach(removeListeners);
    };
  }, [
    editor,
    handleDragStart,
    handleDragEnter,
    handleDragLeave,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    handleCheckOrder,
  ]);

  return {
    total: totalExercises,
    completed: exerciseCompleted.size,
    isComplete: totalExercises === 0 || exerciseCompleted.size >= totalExercises,
  };
}
