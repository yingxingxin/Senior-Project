import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { posterLanding, posterAssistants } from "../../lib/poster-mock-data";
import { Theme, LIGHT_THEME } from "../../lib/poster-theme";

/**
 * LandingStill - Static poster screenshot of landing page
 *
 * Shows the public landing page with:
 * - Hero section with headline
 * - Assistant carousel preview
 * - Feature highlights
 */

export function LandingStill({ theme = LIGHT_THEME }: { theme?: Theme }) {
  const { hero, features } = posterLanding;

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
          padding: "40px 32px 32px",
          width: "100%",
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 60,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: theme.accentGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                boxShadow: theme.accentShadow,
              }}
            >
              🤖
            </div>
            <span style={{ color: theme.textPrimary, fontWeight: 700, fontSize: 28 }}>Sprite.exe</span>
          </div>

          {/* Headline */}
          <h1
            style={{
              color: theme.textPrimary,
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: 24,
              maxWidth: 800,
              marginLeft: "auto",
              marginRight: "auto",
              background: theme.headlineGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {hero.headline}
          </h1>

          {/* Subheadline */}
          <p
            style={{
              color: theme.textSecondary,
              fontSize: 20,
              lineHeight: 1.6,
              maxWidth: 600,
              marginLeft: "auto",
              marginRight: "auto",
              marginBottom: 40,
            }}
          >
            {hero.subheadline}
          </p>

          {/* CTA Button */}
          <button
            style={{
              background: theme.accentGradient,
              border: "none",
              borderRadius: 14,
              padding: "18px 40px",
              color: theme.textOnAccent,
              fontSize: 18,
              fontWeight: 600,
              boxShadow: theme.accentShadow,
            }}
          >
            {hero.cta} →
          </button>
        </div>

        {/* Assistants Preview */}
        <div style={{ marginBottom: 60 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
            }}
          >
            {posterAssistants.map((assistant, index) => (
              <div
                key={assistant.id}
                style={{
                  background: index === 0 ? theme.accentBgSelected : theme.cardBg,
                  borderRadius: 20,
                  padding: 24,
                  border:
                    index === 0
                      ? `2px solid ${theme.accentBorder}`
                      : `1px solid ${theme.border}`,
                  width: 280,
                  textAlign: "center",
                  transform: index === 0 ? "scale(1.05)" : "scale(1)",
                  boxShadow: index === 0 ? theme.accentShadow : "none",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: 100,
                    height: 120,
                    borderRadius: 16,
                    margin: "0 auto 16px",
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
                <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 20, marginBottom: 4 }}>
                  {assistant.name}
                </div>

                {/* Tagline */}
                <div style={{ color: theme.accent, fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                  {assistant.tagline}
                </div>

                {/* Description */}
                <div style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 1.5 }}>
                  {assistant.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                background: theme.cardBg,
                borderRadius: 16,
                border: `1px solid ${theme.border}`,
                padding: 28,
                textAlign: "center",
                boxShadow: theme.shadow,
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 16 }}>{feature.icon}</div>
              <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 18, marginBottom: 8 }}>
                {feature.title}
              </div>
              <div style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 1.6 }}>
                {feature.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}
