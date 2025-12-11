import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * MockProgressBar - Animated progress bar
 *
 * Shows progress filling up over time, used for course generation
 * and level progress in gamification.
 */

interface MockProgressBarProps {
  progress: number; // 0-100 target percentage
  delay?: number;
  duration?: number; // frames to reach target
  color?: string;
  showLabel?: boolean;
  height?: number;
}

export function MockProgressBar({
  progress,
  delay = 0,
  duration = 40,
  color = "#667eea",
  showLabel = false,
  height = 8,
}: MockProgressBarProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fade in the container
  const containerProgress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 120, stiffness: 200, mass: 0.5 },
  });

  const containerOpacity = interpolate(containerProgress, [0, 1], [0, 1]);

  // Animate the fill width
  const fillProgress = interpolate(
    frame,
    [delay + 10, delay + 10 + duration],
    [0, progress],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        width: "100%",
        opacity: containerOpacity,
      }}
    >
      {showLabel && (
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
          <span>Progress</span>
          <span>{Math.round(fillProgress)}%</span>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderRadius: height / 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${fillProgress}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color} 0%, ${adjustColor(color, 20)} 100%)`,
            borderRadius: height / 2,
            transition: "none",
          }}
        />
      </div>
    </div>
  );
}

// Helper to lighten a hex color
function adjustColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + percent);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + percent);
  const b = Math.min(255, (num & 0x0000ff) + percent);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
