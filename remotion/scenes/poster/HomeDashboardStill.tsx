import React from "react";
import { AbsoluteFill, Img } from "remotion";
import {
  posterUser,
  posterAssistant,
  posterCourses,
} from "../../lib/poster-mock-data";
import { Theme, LIGHT_THEME } from "../../lib/poster-theme";

/**
 * HomeDashboardStill - Static poster screenshot of home dashboard
 *
 * Shows an engaged user with:
 * - User profile card with level, points, streak
 * - Assistant hero with speech bubble
 * - Recommended course with progress
 */

export function HomeDashboardStill({ theme = LIGHT_THEME }: { theme?: Theme }) {
  const { curated } = posterCourses;
  const recommendedCourse = curated[0]; // Python Fundamentals with 75% progress

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
        {/* User Profile Section */}
        <UserProfileCard theme={theme} />

        {/* Main Content Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 24,
            marginTop: 32,
          }}
        >
          {/* Left Column - Assistant Hero */}
          <AssistantHeroCard theme={theme} />

          {/* Right Column - Recommended Course */}
          <RecommendedCourseCard course={recommendedCourse} theme={theme} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

function UserProfileCard({ theme }: { theme: Theme }) {
  const { name, level, points, streakDays, skillLevel, levelProgress, badges } =
    posterUser;

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
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 24,
        }}
      >
        {/* User Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: theme.accentGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.textOnAccent,
              fontWeight: 600,
              fontSize: 24,
              border: `2px solid ${theme.borderStrong}`,
              boxShadow: theme.accentShadow,
            }}
          >
            {name.charAt(0)}
          </div>
          <div>
            <div
              style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 24, marginBottom: 4 }}
            >
              {name}
            </div>
            <div
              style={{
                color: theme.accent,
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 2,
              }}
            >
              {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)} Level
            </div>
            <div style={{ color: theme.textSecondary, fontSize: 13 }}>
              Learning with {posterAssistant.name}
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div style={{ flex: 1, maxWidth: 400, minWidth: 250 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🏆</span>
              <span style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 15 }}>
                Level {level}
              </span>
            </div>
            <span style={{ color: theme.textSecondary, fontSize: 14 }}>
              {points.toLocaleString()} points
            </span>
          </div>
          <div
            style={{
              background: theme.cardBgHover,
              borderRadius: 8,
              height: 8,
              overflow: "hidden",
              border: `1px solid ${theme.borderSubtle}`,
            }}
          >
            <div
              style={{
                width: `${levelProgress.percent}%`,
                height: "100%",
                background: theme.accentGradient,
                borderRadius: 8,
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <span style={{ color: theme.textMuted, fontSize: 12 }}>
              {levelProgress.percent}% to Level {level + 1}
            </span>
            <span style={{ color: theme.textMuted, fontSize: 12 }}>
              {levelProgress.pointsToNext.toLocaleString()} pts needed
            </span>
          </div>
        </div>

        {/* Streak Card */}
        <div
          style={{
            background: theme.cardBgHover,
            borderRadius: 12,
            padding: "16px 24px",
            textAlign: "center",
            border: `1px solid ${theme.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 18, color: theme.streakColor }}>🔥</span>
            <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 28 }}>
              {streakDays}
            </span>
          </div>
          <span style={{ color: theme.textSecondary, fontSize: 12 }}>
            Day Streak
          </span>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {badges.map((badge, index) => (
            <div
              key={index}
              style={{
                background: theme.cardBgHover,
                borderRadius: 10,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 6,
                border: `1px solid ${theme.border}`,
              }}
            >
              <span style={{ fontSize: 18 }}>{badge.icon}</span>
              <span style={{ color: theme.textSecondary, fontSize: 13 }}>
                {badge.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssistantHeroCard({ theme }: { theme: Theme }) {
  const { name, avatarUrl, tagline, greeting, persona } = posterAssistant;

  const quickActions = [
    { label: "Courses", icon: "📚" },
    { label: "Quiz", icon: "✨" },
    { label: "Practice", icon: "⚔️" },
  ];

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
      <div style={{ display: "flex", gap: 24 }}>
        {/* Avatar Column */}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 100,
              height: 120,
              borderRadius: 16,
              background: theme.accentGradient,
              overflow: "hidden",
              border: `2px solid ${theme.borderStrong}`,
              boxShadow: theme.accentShadow,
            }}
          >
            <Img
              src={avatarUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top",
              }}
            />
          </div>
          {/* Persona badge - below avatar */}
          <div
            style={{
              background: theme.cardBg,
              border: `2px solid ${theme.borderStrong}`,
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 600,
              color: theme.accent,
              textTransform: "capitalize",
            }}
          >
            {persona}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {/* Assistant Info */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 18, marginBottom: 4 }}>
              {name}
            </div>
            <div
              style={{
                color: theme.textSecondary,
                fontSize: 14,
                fontStyle: "italic",
              }}
            >
              {tagline}
            </div>
          </div>

          {/* Speech Bubble */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <div
              style={{
                background: theme.cardBgHover,
                borderRadius: 12,
                padding: 16,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div style={{ color: theme.textPrimary, fontSize: 16, lineHeight: 1.5 }}>
                {greeting}
              </div>
            </div>
            {/* Speech bubble tail */}
            <div
              style={{
                position: "absolute",
                left: -6,
                top: 20,
                width: 12,
                height: 12,
                background: theme.cardBgHover,
                border: `1px solid ${theme.border}`,
                borderRight: "none",
                borderTop: "none",
                transform: "rotate(45deg)",
              }}
            />
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", gap: 12 }}>
            {quickActions.map((action, index) => (
              <button
                key={index}
                style={{
                  background: theme.cardBgHover,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 10,
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: theme.textPrimary,
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                <span style={{ fontSize: 16 }}>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendedCourseCard({
  course,
  theme,
}: {
  course: (typeof posterCourses)["curated"][0];
  theme: Theme;
}) {
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
        height: "fit-content",
        boxShadow: theme.shadow,
      }}
    >
      <div
        style={{
          color: theme.textSecondary,
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 16,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        Continue Learning
      </div>

      <div
        style={{
          background: theme.accentBgSelected,
          borderRadius: 12,
          padding: 20,
          border: `1px solid ${theme.accentBorder}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
          <span style={{ fontSize: 36 }}>{course.icon}</span>
          <div>
            <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 17 }}>
              {course.title}
            </div>
            <div style={{ color: theme.textSecondary, fontSize: 13 }}>
              {course.lessonsCount} lessons
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span style={{ color: theme.textSecondary, fontSize: 13 }}>
              Progress
            </span>
            <span style={{ color: theme.accent, fontSize: 13, fontWeight: 600 }}>
              {course.progress}%
            </span>
          </div>
          <div
            style={{
              background: theme.cardBgHover,
              borderRadius: 6,
              height: 8,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${course.progress}%`,
                height: "100%",
                background: theme.accentGradient,
                borderRadius: 6,
              }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <button
          style={{
            width: "100%",
            background: theme.accentGradient,
            border: "none",
            borderRadius: 10,
            padding: "14px 20px",
            color: theme.textOnAccent,
            fontSize: 15,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: theme.accentShadow,
          }}
        >
          Continue Course
          <span style={{ fontSize: 16 }}>→</span>
        </button>
      </div>

      {/* Difficulty Badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 16,
        }}
      >
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
        <span style={{ color: theme.textMuted, fontSize: 12 }}>
          {course.description}
        </span>
      </div>
    </div>
  );
}
