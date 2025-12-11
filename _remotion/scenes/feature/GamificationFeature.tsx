import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AppFrame } from "../../components/AppFrame";
import { ConfettiAnimation } from "../../components/ConfettiAnimation";
import { mockFeatureVideos } from "../../lib/mock-data";
import { LoopFade } from "./shared/LoopFade";
import { MockCard } from "./shared/MockCard";
import { MockProgressBar } from "./shared/MockProgressBar";
import { MockStatCard, MockBadge } from "./shared/MockStatCard";

/**
 * GamificationFeature - 8 second feature video
 *
 * Shows achievement celebration after completing a lesson.
 * Timeline:
 * - 0-15: AppFrame scales in
 * - 15-45: Achievement card scales in (bouncy)
 * - 30-60: Badge icon pops with glow
 * - 45-80: "+50 XP" CountUp animation
 * - 50-90: Confetti burst
 * - 70-100: Streak counter
 * - 90-140: Level progress bar fills
 * - 130-180: Badge unlocked animation
 * - 220-240: LoopFade out
 */

const { gamification } = mockFeatureVideos;

export function GamificationFeature() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AppFrame url="sprite.exe/achievements">
      <AbsoluteFill
        style={{
          backgroundColor: "#0a0a0a",
          padding: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Main celebration card */}
        <MockCard delay={15} variant="celebration" width={550} padding={40}>
          {/* Trophy/celebration header */}
          <CelebrationHeader delay={20} frame={frame} fps={fps} />

          {/* XP earned highlight */}
          <XpEarnedBanner delay={45} frame={frame} fps={fps} />

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 24,
              marginBottom: 24,
            }}
          >
            <MockStatCard
              icon="🔥"
              label="Day Streak"
              value={gamification.streak}
              suffix=" days"
              delay={70}
            />
            <MockStatCard
              icon="⭐"
              label="Total XP"
              value={gamification.totalXp}
              delay={85}
            />
          </div>

          {/* Level progress */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                fontSize: 14,
                color: "rgba(255, 255, 255, 0.6)",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              <span>Level Progress</span>
              <span>Level 12</span>
            </div>
            <MockProgressBar
              progress={gamification.levelProgress}
              delay={90}
              duration={50}
              color="#667eea"
            />
          </div>

          {/* Badge unlocked */}
          <BadgeUnlocked delay={130} frame={frame} fps={fps} />
        </MockCard>

        {/* Confetti celebration */}
        <ConfettiAnimation startFrame={50} duration={90} particleCount={60} />
      </AbsoluteFill>

      <LoopFade />
    </AppFrame>
  );
}

// Celebration header with trophy
function CelebrationHeader({
  delay,
  frame,
  fps,
}: {
  delay: number;
  frame: number;
  fps: number;
}) {
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 40, stiffness: 200, mass: 0.5 }, // Bouncy for celebration
  });

  const scale = interpolate(progress, [0, 1], [0.5, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        textAlign: "center",
        marginBottom: 24,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          fontSize: 56,
          lineHeight: 1,
          marginBottom: 12,
        }}
      >
        🏆
      </div>
      <h2
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: "#ffffff",
          margin: 0,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Lesson Complete!
      </h2>
    </div>
  );
}

// XP earned banner with animation
function XpEarnedBanner({
  delay,
  frame,
  fps,
}: {
  delay: number;
  frame: number;
  fps: number;
}) {
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 50, stiffness: 200, mass: 0.5 },
  });

  const scale = interpolate(progress, [0, 1], [0.8, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  // Pulse animation for glow
  const glowIntensity = interpolate(
    Math.sin((frame - delay) * 0.15),
    [-1, 1],
    [0.2, 0.4]
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 24px",
          background: "linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%)",
          border: "1px solid rgba(251, 191, 36, 0.3)",
          borderRadius: 12,
          boxShadow: `0 0 20px rgba(251, 191, 36, ${glowIntensity})`,
        }}
      >
        <span style={{ fontSize: 24 }}>✨</span>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: "#fbbf24",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          +{gamification.xpEarned} XP
        </span>
      </div>
    </div>
  );
}

// Badge unlocked section
function BadgeUnlocked({
  delay,
  frame,
  fps,
}: {
  delay: number;
  frame: number;
  fps: number;
}) {
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 40, stiffness: 200, mass: 0.5 },
  });

  const scale = interpolate(progress, [0, 1], [0.5, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: 20,
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        border: "1px solid rgba(102, 126, 234, 0.2)",
        borderRadius: 12,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 28 }}>{gamification.newBadge.icon}</span>
        <span
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#ffffff",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {gamification.newBadge.name}
        </span>
      </div>
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "#22c55e",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Badge Unlocked!
      </span>
    </div>
  );
}
