import React from "react";
import { AbsoluteFill } from "remotion";
import { posterCourses, formatDuration } from "../../lib/poster-mock-data";
import { Theme, LIGHT_THEME } from "../../lib/poster-theme";

/**
 * CoursesStill - Static poster screenshot of courses page
 *
 * Shows course catalog with:
 * - Curated courses with progress
 * - AI-generated course section
 * - Create Your Own CTA
 */

export function CoursesStill({ theme = LIGHT_THEME }: { theme?: Theme }) {
  const { curated, userCreated } = posterCourses;

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
          <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 28, marginBottom: 8 }}>
            Courses
          </div>
          <div style={{ color: theme.textSecondary, fontSize: 16 }}>
            Choose from our curated courses or create your own personalized learning path.
          </div>
        </div>

        {/* Curated Courses Section */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 20, marginBottom: 16 }}>
            Curated Courses
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {curated.map((course) => (
              <CourseCard key={course.id} course={course} theme={theme} />
            ))}
          </div>
        </div>

        {/* AI Courses Section */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>✨</span>
            <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 20 }}>
              Your AI Courses
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {/* Create Your Own CTA */}
            <div
              style={{
                background: theme.cardBgSubtle,
                borderRadius: 16,
                border: `2px dashed ${theme.borderStrong}`,
                padding: 24,
                minHeight: 280,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: theme.cardBgHover,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  color: theme.textSecondary,
                }}
              >
                +
              </div>
              <div style={{ color: theme.textSecondary, fontWeight: 600, fontSize: 16 }}>
                Create Your Own
              </div>
              <div style={{ color: theme.textMuted, fontSize: 14 }}>
                Generate a personalized course with AI
              </div>
            </div>

            {/* User's AI Courses */}
            {userCreated.map((course) => (
              <CourseCard key={course.id} course={course} theme={theme} isAI />
            ))}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

interface CourseCardProps {
  course: {
    id: number;
    slug: string;
    title: string;
    description: string;
    icon: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    lessonsCount: number;
    estimatedDurationSec: number;
    progress?: number;
    isAI?: boolean;
  };
  theme: Theme;
  isAI?: boolean;
}

function CourseCard({ course, theme, isAI }: CourseCardProps) {
  const difficultyColors = {
    beginner: theme.success,
    intermediate: theme.warning,
    advanced: theme.error,
  };

  const colors = difficultyColors[course.difficulty];

  return (
    <div
      style={{
        background: theme.cardBg,
        borderRadius: 16,
        border: `1px solid ${theme.border}`,
        padding: 24,
        boxShadow: theme.shadow,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: theme.accentGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            border: `2px solid ${theme.borderStrong}`,
            boxShadow: theme.accentShadow,
          }}
        >
          {course.icon || (isAI ? "✨" : "📚")}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {isAI && (
            <span
              style={{
                background: theme.accentBgSubtle,
                color: theme.accent,
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span style={{ fontSize: 11 }}>✨</span> AI
            </span>
          )}
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
            {course.difficulty}
          </span>
        </div>
      </div>

      <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 17, marginBottom: 8 }}>
        {course.title}
      </div>
      <div
        style={{
          color: theme.textSecondary,
          fontSize: 14,
          marginBottom: 16,
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {course.description}
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
          color: theme.textSecondary,
          fontSize: 13,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span>📚</span>
          <span>{course.lessonsCount} lessons</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span>⏱️</span>
          <span>{formatDuration(course.estimatedDurationSec)}</span>
        </div>
      </div>

      {/* Progress (if exists) */}
      {course.progress !== undefined && course.progress > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ color: theme.textSecondary, fontSize: 12 }}>
              Progress
            </span>
            <span style={{ color: theme.accent, fontSize: 12, fontWeight: 600 }}>
              {course.progress}%
            </span>
          </div>
          <div
            style={{
              background: theme.cardBgHover,
              borderRadius: 4,
              height: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${course.progress}%`,
                height: "100%",
                background: theme.accentGradient,
              }}
            />
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button
        style={{
          width: "100%",
          background: theme.accentGradient,
          border: "none",
          borderRadius: 10,
          padding: "12px 20px",
          color: theme.textOnAccent,
          fontSize: 14,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          boxShadow: theme.accentShadow,
        }}
      >
        {course.progress && course.progress > 0 ? "Continue" : "Start Course"}
        <span>→</span>
      </button>
    </div>
  );
}
