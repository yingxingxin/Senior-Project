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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16 }}>
      {cards.map((card, i) => (
        <button
          key={i}
          type="button"
          onClick={() => toggle(i)}
          aria-pressed={flipped[i]}
          style={{ perspective: '1000px', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <div
            style={{
              position: 'relative',
              transformStyle: 'preserve-3d',
              transition: 'transform 300ms ease',
              transform: flipped[i] ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: 16,
                backfaceVisibility: 'hidden',
                minHeight: 120,
              }}
            >
              <Body style={{ color: '#e8e8e8', fontWeight: 600 }}>{card.front}</Body>
              <Muted variant="small">Tap to flip</Muted>
            </div>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: 'rotateY(180deg)',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12,
                padding: 16,
                backfaceVisibility: 'hidden',
                minHeight: 120,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Body style={{ color: '#e8e8e8' }}>{card.back}</Body>
            </div>
          </div>
        </button>
      ))}

      {(allReviewed || isCompleted) && (
        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '16px 0' }}>
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


