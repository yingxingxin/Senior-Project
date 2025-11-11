"use client";

import { useState, useEffect } from "react";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import type { Section } from "../section-renderer";

interface ExerciseItem {
  id: string;
  label: string;
  correctPosition?: number;
}

interface ExerciseSectionProps {
  section: Section;
  onReadyStateChange?: (ready: boolean) => void;
}

/**
 * Exercise section component
 * Supports drag-and-drop ordering and other interactive exercises
 * Exercise type determined by section.metadata.exerciseType
 * Signals readiness to parent only when exercise is completed correctly
 */
export function ExerciseSection({ section, onReadyStateChange }: ExerciseSectionProps) {
  const exerciseType = section.metadata?.exerciseType || "drag-order";

  switch (exerciseType) {
    case "drag-order":
      return <DragOrderExercise section={section} onReadyStateChange={onReadyStateChange} />;
    default:
      return <DefaultExercise section={section} onReadyStateChange={onReadyStateChange} />;
  }
}

/**
 * Drag-and-drop ordering exercise
 * User reorders items in correct sequence
 * Signals readiness only when exercise is completed correctly
 */
function DragOrderExercise({ section, onReadyStateChange }: { section: Section; onReadyStateChange?: (ready: boolean) => void }) {
  // Default items if not in metadata
  const defaultItems: ExerciseItem[] = [
    { id: "1", label: "Boil water", correctPosition: 0 },
    { id: "2", label: "Add tea bag", correctPosition: 1 },
    { id: "3", label: "Steep for 3-5 minutes", correctPosition: 2 },
    { id: "4", label: "Add milk and sugar", correctPosition: 3 },
  ];

  const items = section.metadata?.items || defaultItems;
  const [orderedItems, setOrderedItems] = useState<ExerciseItem[]>(
    [...items].sort(() => Math.random() - 0.5)
  );
  const [draggedItem, setDraggedItem] = useState<ExerciseItem | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const isCorrectOrder = orderedItems.every(
    (item, index) => item.correctPosition === index
  );

  // Signal readiness only when exercise is completed correctly
  useEffect(() => {
    onReadyStateChange?.(isComplete);
  }, [isComplete, onReadyStateChange]);

  const handleDragStart = (item: ExerciseItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropItem: ExerciseItem) => {
    if (!draggedItem) return;

    const dragIndex = orderedItems.findIndex((i) => i.id === draggedItem.id);
    const dropIndex = orderedItems.findIndex((i) => i.id === dropItem.id);

    if (dragIndex === dropIndex) return;

    const newItems = [...orderedItems];
    [newItems[dragIndex], newItems[dropIndex]] = [
      newItems[dropIndex],
      newItems[dragIndex],
    ];

    setOrderedItems(newItems);
    setDraggedItem(null);
  };

  const handleCheck = () => {
    setShowFeedback(true);
    if (isCorrectOrder) {
      setIsComplete(true);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Heading level={2}>{section.title}</Heading>
        <Muted variant="small">Drag the items to arrange them in the correct order</Muted>
      </div>

      {/* Instructions */}
      {section.metadata?.instructions && (
        <Body className="italic text-muted-foreground">
          {section.metadata.instructions}
        </Body>
      )}

      {/* Drag-drop area */}
      <div className="space-y-2">
        {orderedItems.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={() => handleDragStart(item)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(item)}
            className="p-4 rounded-lg border-2 border-border bg-muted/50 cursor-move hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-sm font-semibold">{index + 1}</span>
              </div>
              <Body>{item.label}</Body>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div
          className={`p-4 rounded-lg ${
            isCorrectOrder
              ? "bg-green-500/10 border border-green-500/30"
              : "bg-red-500/10 border border-red-500/30"
          }`}
        >
          <Body className={isCorrectOrder ? "text-green-400" : "text-red-400"}>
            {isCorrectOrder
              ? "✓ Perfect! You arranged them in the correct order."
              : "✗ Not quite right. Try again!"}
          </Body>
        </div>
      )}

      {/* Check button */}
      {!isComplete && (
        <Button onClick={handleCheck} className="w-full">
          Check Order
        </Button>
      )}

      {isComplete && (
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
          <Body className="text-green-400 font-semibold">
            Exercise complete! Well done.
          </Body>
        </div>
      )}
    </div>
  );
}

/**
 * Default exercise component for unsupported types
 */
function DefaultExercise({ section, onReadyStateChange }: { section: Section; onReadyStateChange?: (ready: boolean) => void }) {
  // Signal ready immediately since there's no interactive component
  useEffect(() => {
    onReadyStateChange?.(true);
  }, [onReadyStateChange]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Heading level={2}>{section.title}</Heading>
      </div>

      <Body>
        {section.body || "This exercise type is not yet supported. Please come back soon!"}
      </Body>
    </div>
  );
}
