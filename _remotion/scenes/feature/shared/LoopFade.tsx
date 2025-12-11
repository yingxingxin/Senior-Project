import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

/**
 * LoopFade - Fades to black at end of video for seamless looping
 *
 * Creates a smooth fade-out over the final frames (default 220-240)
 * so the video loops seamlessly back to the beginning.
 */

interface LoopFadeProps {
  startFrame?: number;
  endFrame?: number;
}

export function LoopFade({ startFrame = 220, endFrame = 240 }: LoopFadeProps) {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [startFrame, endFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < startFrame) return null;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        opacity,
        zIndex: 1000,
      }}
    />
  );
}
