import React from "react";
import { interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

/**
 * CursorAnimation - Animated cursor for simulating user interactions
 *
 * Moves between positions and shows click animations.
 */

interface CursorPosition {
  x: number;
  y: number;
  frame: number;
  click?: boolean;
}

interface CursorAnimationProps {
  positions: CursorPosition[];
  visible?: boolean;
}

export function CursorAnimation({ positions, visible = true }: CursorAnimationProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!visible || positions.length === 0) {
    return null;
  }

  // Find current and next position based on frame
  let currentPos = positions[0];
  let nextPos = positions[0];
  let progress = 0;

  for (let i = 0; i < positions.length - 1; i++) {
    if (frame >= positions[i].frame && frame < positions[i + 1].frame) {
      currentPos = positions[i];
      nextPos = positions[i + 1];
      const duration = nextPos.frame - currentPos.frame;
      const elapsed = frame - currentPos.frame;
      progress = spring({
        frame: elapsed,
        fps,
        durationInFrames: duration,
        config: { damping: 50, stiffness: 100, mass: 0.5 },
      });
      break;
    } else if (frame >= positions[i + 1].frame) {
      currentPos = positions[i + 1];
      nextPos = positions[i + 1];
      progress = 1;
    }
  }

  const x = interpolate(progress, [0, 1], [currentPos.x, nextPos.x]);
  const y = interpolate(progress, [0, 1], [currentPos.y, nextPos.y]);

  // Check if we're at a click position
  const isClicking = positions.some(
    (pos) => pos.click && frame >= pos.frame && frame < pos.frame + 15
  );

  // Click animation scale
  const clickScale = isClicking
    ? spring({
        frame: frame % 15,
        fps,
        config: { damping: 20, stiffness: 300 },
      })
    : 0;

  const scale = 1 - clickScale * 0.2;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 9999,
        transform: `translate(-4px, -4px) scale(${scale})`,
      }}
    >
      {/* Cursor SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
        }}
      >
        <path
          d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.48 0 .72-.58.38-.92L6.35 2.76a.5.5 0 0 0-.85.45Z"
          fill="white"
          stroke="black"
          strokeWidth="1.5"
        />
      </svg>

      {/* Click ripple effect */}
      {isClicking && (
        <div
          style={{
            position: "absolute",
            left: 4,
            top: 4,
            width: 20 + clickScale * 40,
            height: 20 + clickScale * 40,
            borderRadius: "50%",
            border: "2px solid rgba(59, 130, 246, 0.5)",
            transform: "translate(-50%, -50%)",
            opacity: 1 - clickScale,
          }}
        />
      )}
    </div>
  );
}

// Helper to create cursor path
export function createCursorPath(
  waypoints: Array<{ x: number; y: number; click?: boolean }>,
  startFrame: number,
  framesBetween: number = 30
): CursorPosition[] {
  return waypoints.map((wp, index) => ({
    x: wp.x,
    y: wp.y,
    frame: startFrame + index * framesBetween,
    click: wp.click,
  }));
}
