import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import { CountUp } from "../components/Transitions";
import { ConfettiAnimation } from "../components/ConfettiAnimation";

/**
 * AchievementScene - Gamification reveal with confetti celebration
 *
 * Timeline (150 frames / 5 seconds):
 * - 0-15: Background dims
 * - 15-45: Achievement card scales in
 * - 30-60: "+50 XP" text animates + confetti burst
 * - 45-75: Badge pops in
 * - 75-150: Hold celebration with confetti
 *
 * Logo moved to OutroScene for better flow
 */

export function AchievementScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Achievement card entrance (bouncy)
  const cardProgress = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 40, stiffness: 300 },
  });

  // XP text animation
  const xpProgress = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 50, stiffness: 400 },
  });

  // Badge pop animation
  const badgeProgress = spring({
    frame: Math.max(0, frame - 45),
    fps,
    config: { damping: 30, stiffness: 400 },
  });

  // Stats row animation
  const statsProgress = spring({
    frame: Math.max(0, frame - 60),
    fps,
    config: { damping: 60, stiffness: 200 },
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
      }}
    >
      {/* Dimmed background effect */}
      <AbsoluteFill
        style={{
          background: "rgba(0, 0, 0, 0.6)",
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
        }}
      />

      {/* Confetti Animation - starts at badge pop */}
      <ConfettiAnimation startFrame={30} duration={120} particleCount={60} />

      {/* Achievement Card */}
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            opacity: interpolate(cardProgress, [0, 1], [0, 1]),
            transform: `scale(${interpolate(cardProgress, [0, 1], [0.5, 1])})`,
            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)",
            border: "2px solid rgba(102, 126, 234, 0.4)",
            borderRadius: 24,
            padding: 40,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            minWidth: 400,
            boxShadow: "0 25px 60px rgba(102, 126, 234, 0.3)",
          }}
        >
          {/* Badge Icon */}
          <div
            style={{
              opacity: interpolate(badgeProgress, [0, 1], [0, 1]),
              transform: `scale(${interpolate(badgeProgress, [0, 1], [0, 1.2])}) scale(${interpolate(badgeProgress, [0.5, 1], [1.2, 1], { extrapolateLeft: "clamp" })})`,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 30px rgba(102, 126, 234, 0.5)",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          {/* Title */}
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                color: "white",
                fontSize: 28,
                fontWeight: 700,
                margin: 0,
                marginBottom: 8,
              }}
            >
              Lesson Complete!
            </h2>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: 16,
                margin: 0,
              }}
            >
              Python Fundamentals - Functions
            </p>
          </div>

          {/* XP Reward */}
          <div
            style={{
              opacity: interpolate(xpProgress, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(xpProgress, [0, 1], [20, 0])}px)`,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 16,
              padding: "12px 32px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 24 }}>⭐</span>
            <span
              style={{
                color: "white",
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              +<CountUp from={0} to={50} delay={35} /> XP
            </span>
          </div>

          {/* Stats Row */}
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 8,
              opacity: interpolate(statsProgress, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(statsProgress, [0, 1], [15, 0])}px)`,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 12, marginBottom: 4 }}>
                Streak
              </div>
              <div style={{ color: "white", fontSize: 20, fontWeight: 600 }}>
                🔥 7 days
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 12, marginBottom: 4 }}>
                Total XP
              </div>
              <div style={{ color: "white", fontSize: 20, fontWeight: 600 }}>
                <CountUp from={2400} to={2450} delay={65} />
              </div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
