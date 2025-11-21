/**
 * useFlipCards Hook
 *
 * Manages flip card interaction state and event handlers for TiptapViewer.
 * Tracks which cards have been flipped and handles click interactions.
 *
 * @param editor - Tiptap editor instance (read-only mode)
 * @returns Interaction state with total cards, completed count, and completion status
 */

import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/react';

export interface InteractionState {
  total: number;
  completed: number;
  isComplete: boolean;
}

export function useFlipCards(editor: Editor | null): InteractionState {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [totalFlipCards, setTotalFlipCards] = useState(0);

  // Count flip cards in the document
  useEffect(() => {
    if (!editor) return;

    let flipCardCount = 0;

    editor.state.doc.descendants((node) => {
      if (node.type.name === 'flipCard') {
        flipCardCount++;
      }
    });

    setTotalFlipCards(flipCardCount);
  }, [editor]);

  // Handle flip card click interactions
  useEffect(() => {
    if (!editor) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const flipCardElement = target.closest('[data-flip-card]');

      if (flipCardElement) {
        // Toggle flipped class
        flipCardElement.classList.toggle('flipped');

        // Track as viewed
        const cardIndex = Array.from(
          document.querySelectorAll('[data-flip-card]')
        ).indexOf(flipCardElement);

        if (cardIndex !== -1) {
          setFlippedCards((prev) => {
            const newSet = new Set(prev);
            newSet.add(cardIndex);
            return newSet;
          });
        }
      }
    };

    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleClick);

    return () => {
      editorElement.removeEventListener('click', handleClick);
    };
  }, [editor]);

  return {
    total: totalFlipCards,
    completed: flippedCards.size,
    isComplete: totalFlipCards === 0 || flippedCards.size >= totalFlipCards,
  };
}
