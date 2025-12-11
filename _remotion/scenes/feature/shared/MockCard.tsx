import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * MockCard - Elevated card container for UI mockups
 *
 * Professional card with subtle elevation, used as the main container
 * for feature content in each scene.
 */

interface MockCardProps {
  children: React.ReactNode;
  width?: number | string;
  padding?: number;
  delay?: number;
  variant?: "default" | "elevated" | "celebration";
}

export function MockCard({
  children,
  width = "100%",
  padding = 32,
  delay = 0,
  variant = "default",
}: MockCardProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth scale-in animation with higher damping (less bounce than hero)
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 120, stiffness: 200, mass: 0.5 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const scale = interpolate(progress, [0, 1], [0.95, 1]);

  // Variant styles
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: "rgba(255, 255, 255, 0.04)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      boxShadow: "0 4px 24px rgba(0, 0, 0, 0.4)",
    },
    elevated: {
      background: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
    },
    celebration: {
      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
      border: "2px solid rgba(102, 126, 234, 0.3)",
      boxShadow: "0 8px 32px rgba(102, 126, 234, 0.2)",
    },
  };

  return (
    <div
      style={{
        width,
        padding,
        borderRadius: 16,
        ...variantStyles[variant],
        opacity,
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
}
