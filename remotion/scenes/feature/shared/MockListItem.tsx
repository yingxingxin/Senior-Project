import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * MockListItem - Animated list item for lessons/sections
 *
 * Shows lesson items with status indicators (complete, in-progress, locked).
 * Animates in from left with stagger support.
 */

interface MockListItemProps {
  title: string;
  subtitle?: string;
  status?: "complete" | "in-progress" | "locked";
  delay?: number;
}

export function MockListItem({
  title,
  subtitle,
  status = "locked",
  delay = 0,
}: MockListItemProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide in from left animation
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 100, stiffness: 200, mass: 0.5 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateX = interpolate(progress, [0, 1], [-30, 0]);

  // Status-based styling
  const statusStyles: Record<string, { bg: string; border: string; iconColor: string }> = {
    complete: {
      bg: "rgba(34, 197, 94, 0.08)",
      border: "rgba(34, 197, 94, 0.2)",
      iconColor: "#22c55e",
    },
    "in-progress": {
      bg: "rgba(102, 126, 234, 0.08)",
      border: "rgba(102, 126, 234, 0.2)",
      iconColor: "#667eea",
    },
    locked: {
      bg: "rgba(255, 255, 255, 0.02)",
      border: "rgba(255, 255, 255, 0.05)",
      iconColor: "rgba(255, 255, 255, 0.3)",
    },
  };

  const currentStyle = statusStyles[status];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 20px",
        backgroundColor: currentStyle.bg,
        border: `1px solid ${currentStyle.border}`,
        borderRadius: 12,
        opacity,
        transform: `translateX(${translateX}px)`,
      }}
    >
      {/* Status Icon */}
      <div
        style={{
          width: 24,
          height: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusIcon status={status} color={currentStyle.iconColor} frame={frame} />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: status === "locked" ? "rgba(255, 255, 255, 0.5)" : "#ffffff",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 13,
              color: "rgba(255, 255, 255, 0.4)",
              marginTop: 4,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}

// Status icon component
function StatusIcon({
  status,
  color,
  frame,
}: {
  status: "complete" | "in-progress" | "locked";
  color: string;
  frame: number;
}) {
  if (status === "complete") {
    // Checkmark
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill={color} fillOpacity={0.2} />
        <path
          d="M9 12l2 2 4-4"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (status === "in-progress") {
    // Animated spinner
    const rotation = (frame * 4) % 360;
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" strokeOpacity={0.2} />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Locked
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="11" width="18" height="11" rx="2" stroke={color} strokeWidth="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth="2" />
    </svg>
  );
}
