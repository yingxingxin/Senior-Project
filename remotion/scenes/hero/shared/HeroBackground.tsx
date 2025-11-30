import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface HeroBackgroundProps {
  colors: readonly string[];
  baseAngle?: number;
  particleStyle: "sparkle" | "grid" | "float";
  children: React.ReactNode;
}

/**
 * HeroBackground - Animated gradient background with particles
 *
 * Features:
 * - Animated gradient rotation
 * - Three particle styles: sparkle, grid, float
 * - Fade-to-black at end for seamless loop
 */
export function HeroBackground({
  colors,
  baseAngle = 135,
  particleStyle,
  children,
}: HeroBackgroundProps) {
  const frame = useCurrentFrame();

  // Animated gradient angle (subtle rotation for visual interest)
  const gradientPhase = (frame / 150) % 1;
  const angle = baseAngle + gradientPhase * 20;

  // Build gradient string from colors array
  const gradient = `linear-gradient(${angle}deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2] || colors[0]} 100%)`;

  return (
    <AbsoluteFill style={{ background: gradient }}>
      {/* Particle layer based on style */}
      <ParticleLayer style={particleStyle} frame={frame} />

      {/* Content */}
      {children}

      {/* Loop fade out (frames 220-240) */}
      <LoopFade frame={frame} />
    </AbsoluteFill>
  );
}

/**
 * ParticleLayer - Different particle effects for each assistant
 */
function ParticleLayer({ style, frame }: { style: "sparkle" | "grid" | "float"; frame: number }) {
  if (style === "sparkle") {
    return <SparkleParticles frame={frame} />;
  }
  if (style === "grid") {
    return <GridParticles frame={frame} />;
  }
  return <FloatParticles frame={frame} />;
}

/**
 * SparkleParticles - Twinkling stars for Nova (enthusiastic)
 */
function SparkleParticles({ frame }: { frame: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.4 }}>
      {Array.from({ length: 25 }).map((_, i) => {
        const x = (i * 97) % 100;
        const y = (i * 73) % 100;
        const size = 2 + (i % 4);
        const twinkle = Math.sin((frame + i * 10) / 12) * 0.5 + 0.5;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: "white",
              opacity: twinkle,
              boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, ${twinkle * 0.5})`,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * GridParticles - Subtle grid dots for Atlas (structured)
 */
function GridParticles({ frame }: { frame: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.15 }}>
      {Array.from({ length: 30 }).map((_, i) => {
        const col = i % 6;
        const row = Math.floor(i / 6);
        const x = 10 + col * 16;
        const y = 10 + row * 20;
        const pulse = Math.sin((frame + i * 5) / 30) * 0.3 + 0.7;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "white",
              opacity: pulse,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * FloatParticles - Slow drifting motes for Sage (thoughtful)
 */
function FloatParticles({ frame }: { frame: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.25 }}>
      {Array.from({ length: 15 }).map((_, i) => {
        const baseX = (i * 67) % 100;
        const baseY = (i * 43) % 100;
        const size = 3 + (i % 3);
        // Slow floating motion
        const floatX = Math.sin((frame + i * 20) / 60) * 3;
        const floatY = Math.cos((frame + i * 15) / 80) * 2;
        const fade = Math.sin((frame + i * 30) / 100) * 0.3 + 0.7;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `calc(${baseX}% + ${floatX}px)`,
              top: `calc(${baseY}% + ${floatY}px)`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.8)",
              opacity: fade,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * LoopFade - Fade to black at end for seamless video loop
 */
function LoopFade({ frame }: { frame: number }) {
  // Fade to black in last 20 frames for smooth loop
  const fadeOpacity = interpolate(frame, [220, 240], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        opacity: fadeOpacity,
        pointerEvents: "none",
      }}
    />
  );
}
