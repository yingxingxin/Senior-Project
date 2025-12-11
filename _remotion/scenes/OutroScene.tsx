import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import { mockAssistants, mockCTA } from "../lib/mock-data";

/**
 * OutroScene - Final CTA with logo and all three assistants
 *
 * Timeline (120 frames / 4 seconds):
 * - 0-30: Background fades to dark
 * - 30-60: Logo scales in with spring
 * - 60-90: All 3 assistant avatars fade in (row layout)
 * - 90-120: CTA button pulses
 */

export function OutroScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance animation
  const logoProgress = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 50, stiffness: 200 },
  });

  // Tagline entrance
  const taglineProgress = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 60, stiffness: 180 },
  });

  // Assistants entrance (staggered)
  const assistantProgress = (index: number) =>
    spring({
      frame: Math.max(0, frame - 45 - index * 8),
      fps,
      config: { damping: 60, stiffness: 200 },
    });

  // CTA button entrance
  const ctaProgress = spring({
    frame: Math.max(0, frame - 75),
    fps,
    config: { damping: 50, stiffness: 250 },
  });

  // Pulse animation for CTA button (starts at frame 90)
  const pulsePhase = frame >= 90 ? Math.sin((frame - 90) * 0.15) : 0;
  const pulseScale = 1 + pulsePhase * 0.03;
  const pulseGlow = 0.4 + pulsePhase * 0.2;

  return (
    <AbsoluteFill
      style={{
        background: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
      }}
    >
      {/* Logo */}
      <div
        style={{
          opacity: interpolate(logoProgress, [0, 1], [0, 1]),
          transform: `scale(${interpolate(logoProgress, [0, 1], [0.5, 1])})`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Logo Icon - Gradient Square */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            boxShadow: "0 20px 60px rgba(102, 126, 234, 0.5)",
          }}
        />

        {/* Brand Name */}
        <h1
          style={{
            color: "white",
            fontSize: 56,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Sprite.exe
        </h1>
      </div>

      {/* Tagline */}
      <p
        style={{
          color: "rgba(255, 255, 255, 0.7)",
          fontSize: 24,
          margin: 0,
          opacity: interpolate(taglineProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(taglineProgress, [0, 1], [20, 0])}px)`,
        }}
      >
        {mockCTA.headline}
      </p>

      {/* All Three Assistants */}
      <div
        style={{
          display: "flex",
          gap: 24,
          marginTop: 16,
        }}
      >
        {mockAssistants.map((assistant, index) => {
          const progress = assistantProgress(index);
          return (
            <div
              key={assistant.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                opacity: interpolate(progress, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 100,
                  borderRadius: 16,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "2px solid rgba(102, 126, 234, 0.3)",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                }}
              >
                <Img
                  src={assistant.avatarUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "bottom",
                  }}
                />
              </div>
              <span
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                {assistant.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <div
        style={{
          marginTop: 24,
          opacity: interpolate(ctaProgress, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(ctaProgress, [0, 1], [20, 0])}px) scale(${pulseScale})`,
        }}
      >
        <button
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: 16,
            padding: "18px 48px",
            color: "white",
            fontSize: 20,
            fontWeight: 600,
            boxShadow: `0 15px 40px rgba(102, 126, 234, ${pulseGlow})`,
            cursor: "pointer",
          }}
        >
          {mockCTA.button}
        </button>
        <p
          style={{
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: 14,
            textAlign: "center",
            marginTop: 12,
          }}
        >
          {mockCTA.subtext}
        </p>
      </div>
    </AbsoluteFill>
  );
}
