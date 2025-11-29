import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";

/**
 * AppFrame - Browser Chrome Wrapper
 *
 * Wraps scene content in a macOS-style browser window for a professional look.
 * Includes:
 * - Traffic light buttons (close, minimize, maximize)
 * - URL bar with optional URL display
 * - Content area with rounded corners and shadow
 */

interface AppFrameProps {
  children: React.ReactNode;
  url?: string;
  showUrlBar?: boolean;
  animateIn?: boolean;
  className?: string;
}

export function AppFrame({
  children,
  url = "sprite.exe",
  showUrlBar = true,
  animateIn = true,
  className = "",
}: AppFrameProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation
  const scaleProgress = animateIn
    ? spring({
        frame,
        fps,
        config: { damping: 100, stiffness: 200, mass: 0.5 },
      })
    : 1;

  const opacity = animateIn ? interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }) : 1;

  const scale = interpolate(scaleProgress, [0, 1], [0.95, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        padding: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className={className}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          opacity,
          transform: `scale(${scale})`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Browser Chrome Header */}
        <div
          style={{
            background: "linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Traffic Light Buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <TrafficLight color="#ff5f57" />
            <TrafficLight color="#febc2e" />
            <TrafficLight color="#28c840" />
          </div>

          {/* URL Bar */}
          {showUrlBar && (
            <div
              style={{
                flex: 1,
                maxWidth: 500,
                margin: "0 auto",
                background: "#1a1a1a",
                borderRadius: 6,
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {/* Lock Icon */}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span
                style={{
                  color: "#888",
                  fontSize: 13,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {url}
              </span>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// Traffic light button component
function TrafficLight({ color }: { color: string }) {
  return (
    <div
      style={{
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: color,
        boxShadow: `inset 0 -1px 1px rgba(0,0,0,0.2), 0 1px 1px rgba(255,255,255,0.1)`,
      }}
    />
  );
}
