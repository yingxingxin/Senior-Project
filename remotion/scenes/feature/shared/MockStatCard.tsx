import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CountUp } from "../../../components/Transitions";

/**
 * MockStatCard - XP/streak stat display for gamification
 *
 * Shows animated stats with icons and optional count-up animation.
 */

interface MockStatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
  countUp?: boolean;
  size?: "default" | "large";
}

export function MockStatCard({
  icon,
  label,
  value,
  suffix = "",
  prefix = "",
  delay = 0,
  countUp = true,
  size = "default",
}: MockStatCardProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pop-in animation
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 60, stiffness: 200, mass: 0.5 }, // Slightly more bounce for celebration
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.8, 1]);

  const isLarge = size === "large";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: isLarge ? 16 : 12,
        padding: isLarge ? "20px 24px" : "14px 18px",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: isLarge ? 32 : 24,
          lineHeight: 1,
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <div>
        <div
          style={{
            fontSize: isLarge ? 28 : 20,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "system-ui, sans-serif",
            display: "flex",
            alignItems: "baseline",
            gap: 4,
          }}
        >
          {prefix && <span>{prefix}</span>}
          {countUp ? (
            <CountUp from={0} to={value} delay={delay + 10} />
          ) : (
            <span>{value}</span>
          )}
          {suffix && (
            <span
              style={{
                fontSize: isLarge ? 16 : 14,
                fontWeight: 500,
                color: "rgba(255, 255, 255, 0.6)",
              }}
            >
              {suffix}
            </span>
          )}
        </div>
        <div
          style={{
            fontSize: isLarge ? 14 : 12,
            color: "rgba(255, 255, 255, 0.5)",
            marginTop: 2,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

/**
 * MockBadge - Achievement badge with glow effect
 */
interface MockBadgeProps {
  icon: string;
  name: string;
  delay?: number;
  showGlow?: boolean;
}

export function MockBadge({
  icon,
  name,
  delay = 0,
  showGlow = true,
}: MockBadgeProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Bouncy pop animation for celebration
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 40, stiffness: 200, mass: 0.5 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.5, 1]);

  // Glow pulse animation
  const glowOpacity = showGlow
    ? interpolate(
        Math.sin((frame - delay) * 0.1),
        [-1, 1],
        [0.3, 0.6]
      )
    : 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        padding: "24px 32px",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        border: "2px solid rgba(102, 126, 234, 0.3)",
        borderRadius: 16,
        opacity,
        transform: `scale(${scale})`,
        boxShadow: showGlow
          ? `0 0 30px rgba(102, 126, 234, ${glowOpacity})`
          : "none",
      }}
    >
      {/* Badge icon */}
      <div
        style={{
          fontSize: 48,
          lineHeight: 1,
        }}
      >
        {icon}
      </div>

      {/* Badge name */}
      <div
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        {name}
      </div>

      {/* Unlocked label */}
      <div
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "#22c55e",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Unlocked!
      </div>
    </div>
  );
}
