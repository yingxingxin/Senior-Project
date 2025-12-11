import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { posterQuizzes, posterAssistant } from "../../lib/poster-mock-data";
import { Theme, LIGHT_THEME } from "../../lib/poster-theme";

/**
 * QuizzesStill - Static poster screenshot of quizzes page
 *
 * Shows quiz catalog with:
 * - Assistant host card
 * - Quizzes grouped by topic
 * - Completion status and best scores
 */

export function QuizzesStill({ theme = LIGHT_THEME }: { theme?: Theme }) {
  const { javascript, python } = posterQuizzes;

  return (
    <AbsoluteFill
      className={theme.className}
      style={{
        background: theme.background,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          padding: "24px 32px 32px",
          width: "100%",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 32, marginBottom: 8 }}>
            Quizzes
          </div>
          <div style={{ color: theme.textSecondary, fontSize: 15 }}>
            Practice and test your knowledge with topic-based quizzes. Each quiz is hosted by your assistant.
          </div>
        </div>

        {/* Assistant Host Card */}
        <div
          style={{
            background: theme.cardBg,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            padding: 24,
            marginBottom: 32,
            boxShadow: theme.shadow,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: theme.accentGradient,
                overflow: "hidden",
              }}
            >
              <Img
                src={posterAssistant.avatarUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 16 }}>
                Hosted by {posterAssistant.name}
              </div>
              <div style={{ color: theme.textSecondary, fontSize: 14 }}>
                {posterAssistant.tagline}
              </div>
            </div>
          </div>
        </div>

        {/* JavaScript Section */}
        <QuizSection topic={javascript.topic} quizzes={javascript.quizzes} theme={theme} />

        {/* Python Section */}
        <QuizSection topic={python.topic} quizzes={python.quizzes} theme={theme} />
      </div>
    </AbsoluteFill>
  );
}

interface QuizSectionProps {
  topic: string;
  quizzes: Array<{
    id: number;
    slug: string;
    title: string;
    description: string;
    skillLevel: "beginner" | "intermediate" | "advanced";
    questionsCount: number;
    completed: boolean;
    bestScore: number | null;
  }>;
  theme: Theme;
}

function QuizSection({ topic, quizzes, theme }: QuizSectionProps) {
  // Group by skill level
  const byLevel = quizzes.reduce(
    (acc, quiz) => {
      const level = quiz.skillLevel;
      if (!acc[level]) acc[level] = [];
      acc[level].push(quiz);
      return acc;
    },
    {} as Record<string, typeof quizzes>
  );

  const levelOrder = ["beginner", "intermediate", "advanced"] as const;
  const levelColors = {
    beginner: theme.success,
    intermediate: theme.warning,
    advanced: theme.error,
  };

  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 24, marginBottom: 20 }}>
        {topic}
      </div>

      {levelOrder.map((level) => {
        const levelQuizzes = byLevel[level];
        if (!levelQuizzes?.length) return null;

        return (
          <div key={level} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  color: theme.textPrimary,
                  fontWeight: 600,
                  fontSize: 18,
                  textTransform: "capitalize",
                }}
              >
                {level}
              </div>
              <span
                style={{
                  background: levelColors[level].bg,
                  color: levelColors[level].text,
                  padding: "4px 10px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {levelQuizzes.length} {levelQuizzes.length === 1 ? "quiz" : "quizzes"}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 16,
              }}
            >
              {levelQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} theme={theme} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function QuizCard({
  quiz,
  theme,
}: {
  quiz: {
    id: number;
    slug: string;
    title: string;
    description: string;
    skillLevel: "beginner" | "intermediate" | "advanced";
    questionsCount: number;
    completed: boolean;
    bestScore: number | null;
  };
  theme: Theme;
}) {
  const levelColors = {
    beginner: theme.success,
    intermediate: theme.warning,
    advanced: theme.error,
  };

  const colors = levelColors[quiz.skillLevel];

  return (
    <div
      style={{
        background: theme.cardBg,
        borderRadius: 16,
        border: `1px solid ${theme.border}`,
        padding: 20,
        boxShadow: theme.shadow,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 16 }}>{quiz.title}</div>
        {quiz.completed && (
          <span
            style={{
              background: theme.success.bg,
              color: theme.success.text,
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            ✓ Completed
          </span>
        )}
      </div>

      <div
        style={{
          color: theme.textSecondary,
          fontSize: 13,
          marginBottom: 12,
          lineHeight: 1.4,
        }}
      >
        {quiz.description}
      </div>

      {quiz.completed && quiz.bestScore !== null && (
        <div style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 12 }}>
          Best score: <span style={{ color: theme.accent, fontWeight: 600 }}>{quiz.bestScore}%</span>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <span
          style={{
            background: theme.cardBgHover,
            color: theme.textSecondary,
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 12,
            border: `1px solid ${theme.border}`,
          }}
        >
          {quiz.questionsCount} questions
        </span>
        <span
          style={{
            background: colors.bg,
            color: colors.text,
            padding: "4px 10px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            textTransform: "capitalize",
          }}
        >
          {quiz.skillLevel}
        </span>
      </div>

      <button
        style={{
          width: "100%",
          background: quiz.completed
            ? theme.cardBgHover
            : theme.accentGradient,
          border: quiz.completed ? `1px solid ${theme.border}` : "none",
          borderRadius: 10,
          padding: "12px 20px",
          color: quiz.completed ? theme.textPrimary : theme.textOnAccent,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: quiz.completed ? "none" : theme.accentShadow,
        }}
      >
        {quiz.completed ? "Retake Quiz" : "Start Quiz"}
      </button>
    </div>
  );
}
