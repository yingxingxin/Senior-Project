import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { posterOnboarding } from "../../lib/poster-mock-data";
import { Theme, LIGHT_THEME } from "../../lib/poster-theme";

/**
 * OnboardingGenderStill - Static poster screenshot of assistant selection
 *
 * Shows the assistant/gender selection step with:
 * - Assistant cards to choose from
 * - Visual preview of each option
 */

export function OnboardingGenderStill({ theme = LIGHT_THEME }: { theme?: Theme }) {
  const { gender } = posterOnboarding;

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
          padding: "60px 32px 32px",
          width: "100%",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1
            style={{
              color: theme.textPrimary,
              fontSize: 36,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            {gender.title}
          </h1>
          <p
            style={{
              color: theme.textSecondary,
              fontSize: 16,
            }}
          >
            {gender.subtitle}
          </p>
        </div>

        {/* Assistant Selection Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {gender.options.map((assistant, index) => (
            <div
              key={assistant.id}
              style={{
                background: index === 0 ? theme.accentBgSelected : theme.cardBg,
                borderRadius: 20,
                padding: 28,
                border:
                  index === 0
                    ? `2px solid ${theme.accentBorderSelected}`
                    : `1px solid ${theme.border}`,
                textAlign: "center",
                position: "relative",
                boxShadow: index === 0 ? theme.shadowStrong : theme.shadow,
              }}
            >
              {/* Selected indicator */}
              {index === 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    right: -12,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: theme.accentGradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.textOnAccent,
                    fontSize: 14,
                    fontWeight: 600,
                    boxShadow: theme.accentShadow,
                  }}
                >
                  ✓
                </div>
              )}

              {/* Avatar */}
              <div
                style={{
                  width: 140,
                  height: 180,
                  borderRadius: 20,
                  margin: "0 auto 20px",
                  background: theme.accentGradient,
                  overflow: "hidden",
                  boxShadow: theme.accentShadow,
                }}
              >
                <Img
                  src={assistant.avatarUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top",
                  }}
                />
              </div>

              {/* Name */}
              <div
                style={{
                  color: theme.textPrimary,
                  fontWeight: 600,
                  fontSize: 22,
                  marginBottom: 8,
                }}
              >
                {assistant.name}
              </div>

              {/* Tagline */}
              <div
                style={{
                  color: theme.accent,
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 12,
                }}
              >
                {assistant.tagline}
              </div>

              {/* Description */}
              <div
                style={{
                  color: theme.textSecondary,
                  fontSize: 14,
                  lineHeight: 1.5,
                }}
              >
                {assistant.description}
              </div>
            </div>
          ))}
        </div>

        {/* Continue Button */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <button
            style={{
              background: theme.accentGradient,
              border: "none",
              borderRadius: 14,
              padding: "16px 48px",
              color: theme.textOnAccent,
              fontSize: 17,
              fontWeight: 600,
              boxShadow: theme.accentShadow,
            }}
          >
            Continue with Nova →
          </button>
        </div>

        {/* Progress Indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 40,
          }}
        >
          {[0, 1, 2, 3].map((step) => (
            <div
              key={step}
              style={{
                width: step === 1 ? 32 : 8,
                height: 8,
                borderRadius: 4,
                background:
                  step <= 1
                    ? theme.accentGradient
                    : theme.progressInactive,
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}
