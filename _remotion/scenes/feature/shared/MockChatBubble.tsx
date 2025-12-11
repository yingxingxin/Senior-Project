import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * MockChatBubble - Chat bubble for Study Mode feature video
 *
 * Simpler than HeroChatBubble - no typewriter effect, just fade-in.
 * Used to show a conversation in the Study Mode scene.
 */

interface MockChatBubbleProps {
  role: "assistant" | "user";
  children: React.ReactNode;
  avatarUrl?: string;
  delay?: number;
}

export function MockChatBubble({
  role,
  children,
  avatarUrl,
  delay = 0,
}: MockChatBubbleProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth fade-in animation
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 100, stiffness: 200, mass: 0.5 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [15, 0]);

  const isAssistant = role === "assistant";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isAssistant ? "row" : "row-reverse",
        alignItems: "flex-start",
        gap: 12,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      {/* Avatar (assistant only) */}
      {isAssistant && avatarUrl && (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
            border: "2px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <img
            src={avatarUrl}
            alt="Assistant"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      )}

      {/* Bubble */}
      <div
        style={{
          maxWidth: 400,
          padding: "14px 18px",
          borderRadius: 16,
          ...(isAssistant
            ? {
                background: "rgba(255, 255, 255, 0.08)",
                borderTopLeftRadius: 4,
              }
            : {
                background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
                borderTopRightRadius: 4,
              }),
        }}
      >
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.5,
            color: "#ffffff",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * MockCodeBlock - Styled code block for displaying code examples
 */
interface MockCodeBlockProps {
  children: React.ReactNode;
  delay?: number;
}

export function MockCodeBlock({ children, delay = 0 }: MockCodeBlockProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 100, stiffness: 200, mass: 0.5 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        marginTop: 12,
        padding: 16,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        borderRadius: 8,
        border: "1px solid rgba(255, 255, 255, 0.1)",
        opacity,
      }}
    >
      <pre
        style={{
          margin: 0,
          fontSize: 13,
          lineHeight: 1.6,
          fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace",
          color: "#e2e8f0",
          whiteSpace: "pre-wrap",
        }}
      >
        {children}
      </pre>
    </div>
  );
}
