import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { AppFrame } from "../components/AppFrame";
import { FadeIn, MessageTypeWriter, CodeTypeWriter } from "../components/Transitions";
import { CursorAnimation, createCursorPath } from "../components/CursorAnimation";
import { mockAssistants } from "../lib/mock-data";

/**
 * StudyModeScene - Immersive study environment (optimized for 10 seconds / 300 frames)
 *
 * Timeline:
 * - 0-30: Scene fade in
 * - 15-70: First assistant message types out
 * - 70-130: User message slides in + types
 * - 130-200: Second assistant message with code types
 * - 200-270: Code types character-by-character
 * - 240-280: Cursor moves to input
 * - 280-300: Scene transition
 */

export function StudyModeScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animated gradient
  const gradientPhase = (frame / 100) % 1;

  // Chat messages animation - faster timing
  const message1Progress = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  const message2Progress = spring({
    frame: Math.max(0, frame - 70),
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  const message3Progress = spring({
    frame: Math.max(0, frame - 130),
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  // Cursor positions - move to input area
  const cursorPositions = createCursorPath(
    [
      { x: 960, y: 600 },           // Start in chat area
      { x: 450, y: 750 },           // Move to input field
    ],
    240,   // Start at frame 240
    30     // 30 frames between positions
  );

  return (
    <AppFrame url="sprite.exe/study">
      <AbsoluteFill
        className="dark"
        style={{
          background: `linear-gradient(
            ${135 + gradientPhase * 30}deg,
            #0f0c29 0%,
            #302b63 50%,
            #24243e 100%
          )`,
          display: "flex",
        }}
      >
        {/* Ambient particles/stars effect */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity: 0.3 }}>
          {Array.from({ length: 20 }).map((_, i) => {
            const x = (i * 97) % 100;
            const y = (i * 73) % 100;
            const size = 2 + (i % 3);
            const delay = i * 0.2;
            const twinkle = Math.sin((frame + i * 10) / 15) * 0.5 + 0.5;

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
                }}
              />
            );
          })}
        </div>

        {/* Main Study Interface */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 40,
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          {/* Header */}
          <FadeIn delay={5}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 40,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#22c55e",
                    boxShadow: "0 0 10px #22c55e",
                  }}
                />
                <span style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 14 }}>Study Mode Active</span>
              </div>
              <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 14 }}>
                Python Fundamentals • Lesson 4
              </div>
            </div>
          </FadeIn>

          {/* Chat Area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Assistant Message 1 with TypeWriter */}
            <div
              style={{
                opacity: interpolate(message1Progress, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(message1Progress, [0, 1], [20, 0])}px)`,
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255, 255, 255, 0.1)",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <Img
                  src={mockAssistants[0].avatarUrl}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 16,
                  borderTopLeftRadius: 4,
                  padding: 18,
                  maxWidth: 550,
                }}
              >
                <p style={{ color: "white", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                  <MessageTypeWriter
                    text="Great job on variables! Now let's explore functions. Functions are reusable blocks of code."
                    delay={25}
                    speed={1}
                  />
                </p>
              </div>
            </div>

            {/* User Message with TypeWriter */}
            <div
              style={{
                opacity: interpolate(message2Progress, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(message2Progress, [0, 1], [20, 0])}px)`,
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                justifyContent: "flex-end",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 16,
                  borderTopRightRadius: 4,
                  padding: 18,
                  maxWidth: 450,
                }}
              >
                <p style={{ color: "white", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
                  <MessageTypeWriter
                    text="How do I create a function with parameters?"
                    delay={85}
                    speed={1.2}
                  />
                </p>
              </div>
            </div>

            {/* Assistant Message 2 with CodeTypeWriter */}
            <div
              style={{
                opacity: interpolate(message3Progress, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(message3Progress, [0, 1], [20, 0])}px)`,
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(255, 255, 255, 0.1)",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <Img
                  src={mockAssistants[0].avatarUrl}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 16,
                  borderTopLeftRadius: 4,
                  padding: 18,
                  maxWidth: 550,
                }}
              >
                <p style={{ color: "white", fontSize: 15, lineHeight: 1.6, margin: 0, marginBottom: 14 }}>
                  <MessageTypeWriter
                    text="Great question! Here's how you define a function:"
                    delay={145}
                    speed={1}
                  />
                </p>
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    borderRadius: 12,
                    padding: 14,
                    fontFamily: "monospace",
                    fontSize: 14,
                    color: "#e2e8f0",
                    lineHeight: 1.6,
                  }}
                >
                  <CodeTypeWriter
                    code={`def greet(name):\n    return f"Hello, {name}!"`}
                    delay={180}
                    speed={1.5}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <FadeIn delay={140}>
            <div
              style={{
                marginTop: 16,
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: 16,
                padding: 14,
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <input
                type="text"
                placeholder="Ask Nova anything..."
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "white",
                  fontSize: 15,
                  outline: "none",
                }}
                readOnly
              />
              <button
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none",
                  borderRadius: 12,
                  width: 44,
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </FadeIn>
        </div>

        {/* Cursor Animation */}
        <CursorAnimation positions={cursorPositions} visible={frame >= 240} />
      </AbsoluteFill>
    </AppFrame>
  );
}
