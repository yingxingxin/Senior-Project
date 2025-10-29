"use client";

import { useState } from "react";
import { Body, Muted } from "@/components/ui/typography";

type Card = { front: string; back: string };

interface WhyItMattersProps {
  cards: Card[];
  submitFormId: string; // id of the server form to submit
  isCompleted?: boolean; // whether this section is already completed
}

export function WhyItMatters({ cards, submitFormId, isCompleted = false }: WhyItMattersProps) {
  const [flipped, setFlipped] = useState<boolean[]>(() => cards.map(() => false));

  const allReviewed = flipped.every(Boolean);
  const canSubmit = allReviewed && !isCompleted;

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

      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          form={submitFormId}
          type="submit"
          disabled={!canSubmit}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 16px', borderRadius: 8,
            background: isCompleted 
              ? 'rgba(16, 185, 129, 0.2)' 
              : canSubmit 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'rgba(255,255,255,0.08)',
            color: isCompleted 
              ? '#10b981' 
              : canSubmit 
                ? '#fff' 
                : '#a3a3a3', 
            border: isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : 'none', 
            fontWeight: 600,
            cursor: canSubmit ? 'pointer' : 'not-allowed'
          }}
          aria-disabled={!canSubmit}
        >
          {isCompleted 
            ? '✓ Already Completed (+10 XP)' 
            : allReviewed 
              ? 'Mark Reviewed (+10 XP)' 
              : 'Flip all cards to continue'}
        </button>
      </div>
    </div>
  );
}


