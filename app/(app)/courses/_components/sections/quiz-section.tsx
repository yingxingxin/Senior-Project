"use client";

import { useState, useEffect } from "react";
import { Heading, Body, Muted } from "@/components/ui/typography";
import type { Section } from "../section-renderer";

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{ id: string; label: string }>;
  correctOptionId: string;
  explanation?: string;
}

interface QuizSectionProps {
  section: Section;
  onReadyStateChange?: (ready: boolean) => void;
}

/**
 * Quiz section component
 * Renders a single quiz question with immediate feedback
 * Navigation between questions is handled by parent (lesson-client.tsx)
 * When answer is selected, signals readiness to parent via onReadyStateChange
 */
export function QuizSection({ section, onReadyStateChange }: QuizSectionProps) {
  // Default quiz if metadata not provided
  const defaultQuestions: QuizQuestion[] = [
    {
      id: "q1",
      question: "What is an algorithm?",
      options: [
        { id: "a", label: "A step-by-step procedure to solve a problem" },
        { id: "b", label: "A type of computer hardware" },
        { id: "c", label: "A programming language" },
        { id: "d", label: "A method of storing data" },
      ],
      correctOptionId: "a",
      explanation: "Correct! An algorithm is a sequence of steps designed to solve a specific problem.",
    },
  ];

  const questions = section.metadata?.questions || defaultQuestions;
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);

  // This component assumes it shows one question at a time
  // In a multi-question quiz, sections would be created for each question
  const question = questions[0];
  const selectedAnswer = selectedAnswers[question.id];
  const isCorrect = selectedAnswer === question.correctOptionId;

  // Signal readiness when answer is selected
  useEffect(() => {
    if (selectedAnswer) {
      // Auto-show feedback when answer is selected
      setShowFeedback(true);
      // Signal that section is ready to proceed
      onReadyStateChange?.(true);
    } else {
      onReadyStateChange?.(false);
    }
  }, [selectedAnswer, onReadyStateChange]);

  const handleSelectAnswer = (optionId: string) => {
    if (!showFeedback) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [question.id]: optionId,
      }));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="space-y-2">
        <Heading level={2}>{section.title}</Heading>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <Heading level={3}>{question.question}</Heading>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleSelectAnswer(option.id)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                selectedAnswer === option.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              } ${showFeedback ? "cursor-default" : "cursor-pointer"}`}
              disabled={showFeedback}
            >
              <Body className={selectedAnswer === option.id ? "font-semibold" : ""}>
                {option.label}
              </Body>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div
            className={`p-4 rounded-lg ${
              isCorrect ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"
            }`}
          >
            <Body className={isCorrect ? "text-green-400" : "text-red-400"}>
              {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
            </Body>
            {question.explanation && (
              <Muted variant="small" className="mt-2">
                {question.explanation}
              </Muted>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
