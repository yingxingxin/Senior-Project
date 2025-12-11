import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

/**
 * ConfettiAnimation - Celebratory particle burst for achievement scenes
 *
 * Uses frame-based physics simulation for confetti particles with:
 * - Random initial positions and velocities
 * - Gravity effect
 * - Rotation animation
 * - Fade out at end
 */

interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  shape: "square" | "rectangle" | "circle";
}

interface ConfettiAnimationProps {
  /** Frame when confetti starts */
  startFrame?: number;
  /** Duration in frames */
  duration?: number;
  /** Number of particles */
  particleCount?: number;
}

// Confetti colors: purple, blue, gold to match brand
const CONFETTI_COLORS = [
  "#667eea", // Primary purple
  "#764ba2", // Darker purple
  "#ffd700", // Gold
  "#00d4ff", // Cyan
  "#22c55e", // Green
  "#f472b6", // Pink
];

export function ConfettiAnimation({
  startFrame = 0,
  duration = 90,
  particleCount = 50,
}: ConfettiAnimationProps) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Generate particles once using useMemo with stable seed
  const particles = useMemo((): ConfettiParticle[] => {
    const result: ConfettiParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      // Seeded random-like values based on index
      const seed1 = Math.sin(i * 12.9898) * 43758.5453;
      const seed2 = Math.sin(i * 78.233) * 43758.5453;
      const seed3 = Math.sin(i * 37.719) * 43758.5453;
      const seed4 = Math.sin(i * 93.989) * 43758.5453;

      const random1 = seed1 - Math.floor(seed1);
      const random2 = seed2 - Math.floor(seed2);
      const random3 = seed3 - Math.floor(seed3);
      const random4 = seed4 - Math.floor(seed4);

      result.push({
        id: i,
        // Start from center-ish area with spread
        x: width * 0.3 + random1 * width * 0.4,
        y: height * 0.4 + random2 * height * 0.1,
        // Random velocity - burst outward and up
        velocityX: (random3 - 0.5) * 25,
        velocityY: -10 - random4 * 15,
        rotation: random1 * 360,
        rotationSpeed: (random2 - 0.5) * 15,
        color: CONFETTI_COLORS[Math.floor(random3 * CONFETTI_COLORS.length)],
        size: 8 + random4 * 8,
        shape: (["square", "rectangle", "circle"] as const)[Math.floor(random1 * 3)],
      });
    }
    return result;
  }, [particleCount, width, height]);

  // Don't render before start or after duration
  const localFrame = frame - startFrame;
  if (localFrame < 0 || localFrame > duration) {
    return null;
  }

  // Gravity constant
  const gravity = 0.5;

  // Fade out in last 30 frames
  const fadeOut = interpolate(localFrame, [duration - 30, duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {particles.map((particle) => {
        // Physics simulation
        const timeInSeconds = localFrame / fps;
        const currentX = particle.x + particle.velocityX * localFrame;
        const currentY =
          particle.y +
          particle.velocityY * localFrame +
          0.5 * gravity * localFrame * localFrame;
        const currentRotation =
          particle.rotation + particle.rotationSpeed * localFrame;

        // Individual particle fade based on position (fade when below screen)
        const particleOpacity =
          currentY > height ? 0 : fadeOut * interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

        const shapeStyles: React.CSSProperties = {
          position: "absolute",
          left: currentX,
          top: currentY,
          width: particle.shape === "rectangle" ? particle.size * 0.5 : particle.size,
          height: particle.shape === "rectangle" ? particle.size * 1.5 : particle.size,
          backgroundColor: particle.color,
          borderRadius: particle.shape === "circle" ? "50%" : 2,
          transform: `rotate(${currentRotation}deg)`,
          opacity: particleOpacity,
          boxShadow: `0 0 ${particle.size}px ${particle.color}40`,
        };

        return <div key={particle.id} style={shapeStyles} />;
      })}
    </AbsoluteFill>
  );
}
