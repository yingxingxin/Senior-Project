import React from "react";
import { AbsoluteFill } from "remotion";
import { posterOnboarding } from "../../lib/poster-mock-data";
import { Theme, LIGHT_THEME } from "../../lib/poster-theme";

/**
 * OnboardingPersonaStill - Static poster screenshot of persona selection
 *
 * Shows the teaching style selection step with:
 * - Persona cards (Encouraging, Structured, Thoughtful)
 * - Visual indicators for each style
 */

export function OnboardingPersonaStill({ theme = LIGHT_THEME }: { theme?: Theme }) {
  const { persona } = posterOnboarding;

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
            {persona.title}
          </h1>
          <p
            style={{
              color: theme.textSecondary,
              fontSize: 16,
            }}
          >
            {persona.subtitle}
          </p>
        </div>

        {/* Persona Selection Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {persona.options.map((option, index) => (
            <div
              key={option.id}
              style={{
                background: index === 0 ? theme.accentBgSelected : theme.cardBg,
                borderRadius: 20,
                padding: 32,
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

              {/* Icon */}
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 20,
                  margin: "0 auto 24px",
                  background: index === 0 ? theme.accentGradient : theme.cardBgHover,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 36,
                  border: index === 0 ? "none" : `1px solid ${theme.border}`,
                }}
              >
                {option.icon}
              </div>

              {/* Name */}
              <div
                style={{
                  color: theme.textPrimary,
                  fontWeight: 600,
                  fontSize: 22,
                  marginBottom: 12,
                }}
              >
                {option.name}
              </div>

              {/* Description */}
              <div
                style={{
                  color: theme.textSecondary,
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {option.description}
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
            Continue →
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
                width: step === 3 ? 32 : 8,
                height: 8,
                borderRadius: 4,
                background:
                  step <= 3
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
