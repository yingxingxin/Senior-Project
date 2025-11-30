import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MessageTypeWriter } from "../../../components/Transitions";

interface HeroChatBubbleProps {
  role: "assistant" | "user";
  text: string;
  avatarUrl?: string;
  delay: number;
  typingSpeed?: number;
}

/**
 * HeroChatBubble - Animated chat message bubble for hero scenes
 *
 * Features:
 * - Spring-based slide-in animation
 * - MessageTypeWriter for text reveal
 * - Avatar display for assistant messages
 * - User messages align right with gradient background
 */
export function HeroChatBubble({
  role,
  text,
  avatarUrl,
  delay,
  typingSpeed = 1.2,
}: HeroChatBubbleProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide-in animation
  const slideProgress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  const opacity = interpolate(slideProgress, [0, 1], [0, 1]);
  const translateY = interpolate(slideProgress, [0, 1], [20, 0]);

  const isAssistant = role === "assistant";

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
        justifyContent: isAssistant ? "flex-start" : "flex-end",
      }}
    >
      {/* Avatar (assistant only) */}
      {isAssistant && avatarUrl && (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: "rgba(255, 255, 255, 0.1)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Img
            src={avatarUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}

      {/* Message bubble */}
      <div
        style={{
          background: isAssistant
            ? "rgba(255, 255, 255, 0.12)"
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 18,
          borderTopLeftRadius: isAssistant ? 4 : 18,
          borderTopRightRadius: isAssistant ? 18 : 4,
          padding: 18,
          minWidth: 400, // Prevents layout shift during typing animation
          maxWidth: 480,
        }}
      >
        <p style={{ color: "white", fontSize: 16, lineHeight: 1.6, margin: 0 }}>
          <MessageTypeWriter
            text={text}
            delay={delay + 5} // Start typing slightly after slide-in
            speed={typingSpeed}
          />
        </p>
      </div>
    </div>
  );
}
