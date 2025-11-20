"use client";

import { useState, useEffect } from "react";
import { Body, Muted } from "@/components/ui/typography";

type Card = { front: string; back: string };

interface WhyItMattersProps {
  cards: Card[];
  submitFormId?: string; // id of the server form to submit (deprecated - kept for backwards compatibility)
  isCompleted?: boolean; // whether this section is already completed
  onReadyStateChange?: (ready: boolean) => void; // signal readiness to parent
}

export function WhyItMatters({ cards, isCompleted = false, onReadyStateChange }: WhyItMattersProps) {
  const [flipped, setFlipped] = useState<boolean[]>(() => cards.map(() => false));

  const allReviewed = flipped.every(Boolean);

  // Signal readiness when all cards are flipped
  useEffect(() => {
    onReadyStateChange?.(allReviewed || isCompleted);
  }, [allReviewed, isCompleted, onReadyStateChange]);

  const toggle = (idx: number) => {
    if (!isCompleted) {
      setFlipped((prev) => prev.map((v, i) => (i === idx ? !v : v)));
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <button
          key={i}
          type="button"
          onClick={() => toggle(i)}
          aria-pressed={flipped[i]}
          className="bg-transparent border-none p-0 cursor-pointer"
          style={{ perspective: '1000px' }}
        >
          <div
            className="relative transition-transform duration-300"
            style={{
              transformStyle: 'preserve-3d',
              transform: flipped[i] ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            <div
              className="bg-card/60 border border-border rounded-xl p-4 min-h-[120px]"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <Body className="text-foreground font-semibold">{card.front}</Body>
              <Muted variant="small">Tap to flip</Muted>
            </div>
            <div
              className="absolute inset-0 bg-card/60 border border-border rounded-xl p-4 min-h-[120px] flex items-center"
              style={{
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden'
              }}
            >
              <Body className="text-foreground">{card.back}</Body>
            </div>
          </div>
        </button>
      ))}

      {(allReviewed || isCompleted) && (
        <div className="col-span-full text-center py-4">
          <Muted>
            {isCompleted
              ? '✓ Already Completed (+10 XP)'
              : '✓ All cards reviewed! Ready to continue'}
          </Muted>
        </div>
      )}
    </div>
  );
}


