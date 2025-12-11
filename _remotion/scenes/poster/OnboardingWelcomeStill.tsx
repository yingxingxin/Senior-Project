import React from "react";
import { AbsoluteFill } from "remotion";
import { posterOnboarding } from "../../lib/poster-mock-data";
import { Theme, LIGHT_THEME } from "../../lib/poster-theme";

/**
 * OnboardingWelcomeStill - Static poster screenshot of onboarding welcome
 *
 * Shows the first step of onboarding with:
 * - Welcome message
 * - Get started button
 */

export function OnboardingWelcomeStill({ theme = LIGHT_THEME }: { theme?: Theme }) {
  const { welcome } = posterOnboarding;

  return (
    <AbsoluteFill
      className={theme.className}
      style={{
        background: theme.background,
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          textAlign: "center",
          width: "100%",
          padding: "60px 32px 32px",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            margin: "0 auto 40px",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: theme.accentGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              boxShadow: theme.accentShadow,
            }}
          >
            🤖
          </div>
          <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 32 }}>Sprite.exe</span>
        </div>

        {/* Title */}
        <h1
          style={{
            color: theme.textPrimary,
            fontSize: 48,
            fontWeight: 700,
            marginBottom: 16,
            background: theme.headlineGradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {welcome.title}
        </h1>

        {/* Subtitle */}
        <p
          style={{
            color: theme.accent,
            fontSize: 20,
            fontWeight: 500,
            marginBottom: 16,
          }}
        >
          {welcome.subtitle}
        </p>

        {/* Description */}
        <p
          style={{
            color: theme.textSecondary,
            fontSize: 16,
            lineHeight: 1.6,
            marginBottom: 48,
          }}
        >
          {welcome.description}
        </p>

        {/* CTA Button */}
        <button
          style={{
            background: theme.accentGradient,
            border: "none",
            borderRadius: 14,
            padding: "18px 48px",
            color: theme.textOnAccent,
            fontSize: 18,
            fontWeight: 600,
            boxShadow: theme.accentShadow,
          }}
        >
          Get Started →
        </button>

        {/* Progress Indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            marginTop: 48,
          }}
        >
          {[0, 1, 2, 3].map((step) => (
            <div
              key={step}
              style={{
                width: step === 0 ? 32 : 8,
                height: 8,
                borderRadius: 4,
                background:
                  step === 0
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
