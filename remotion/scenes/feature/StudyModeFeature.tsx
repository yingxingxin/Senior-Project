import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AppFrame } from "../../components/AppFrame";
import { FadeIn, CodeTypeWriter } from "../../components/Transitions";
import { mockFeatureVideos, mockAssistants } from "../../lib/mock-data";
import { LoopFade } from "./shared/LoopFade";
import { MockChatBubble, MockCodeBlock } from "./shared/MockChatBubble";

/**
 * StudyModeFeature - 8 second feature video
 *
 * Shows interactive AI tutoring with code examples.
 * Timeline:
 * - 0-20: AppFrame scales in
 * - 10-30: "Study Mode" indicator appears
 * - 20-60: Assistant message fades in
 * - 50-90: User question fades in
 * - 80-180: Assistant response with code block
 * - 180-220: Input field with cursor
 * - 220-240: LoopFade out
 */

const { studyMode } = mockFeatureVideos;
const novaAvatar = mockAssistants[0].avatarUrl;

export function StudyModeFeature() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AppFrame url="sprite.exe/study/python/functions">
      <AbsoluteFill
        style={{
          backgroundColor: "#0a0a0a",
          padding: "40px 60px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Study Mode Indicator */}
        <FadeIn delay={10}>
          <StudyModeIndicator />
        </FadeIn>

        {/* Chat Container */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 20,
            maxWidth: 700,
            margin: "0 auto",
            width: "100%",
          }}
        >
          {/* Assistant first message */}
          <MockChatBubble
            role="assistant"
            avatarUrl={novaAvatar}
            delay={20}
          >
            {studyMode.messages[0].text}
          </MockChatBubble>

          {/* User question */}
          <MockChatBubble role="user" delay={50}>
            {studyMode.messages[1].text}
          </MockChatBubble>

          {/* Assistant response with code */}
          <MockChatBubble
            role="assistant"
            avatarUrl={novaAvatar}
            delay={80}
          >
            {studyMode.messages[2].text}
            <MockCodeBlock delay={100}>
              <CodeTypeWriter
                code={studyMode.codeExample}
                delay={110}
                speed={0.8}
              />
            </MockCodeBlock>
          </MockChatBubble>
        </div>

        {/* Input Field */}
        <InputField delay={180} frame={frame} fps={fps} />
      </AbsoluteFill>

      <LoopFade />
    </AppFrame>
  );
}

// Study Mode indicator with green dot
function StudyModeIndicator() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 24,
      }}
    >
      {/* Pulsing green dot */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: "#22c55e",
          boxShadow: "0 0 8px rgba(34, 197, 94, 0.5)",
        }}
      />
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "#22c55e",
          fontFamily: "system-ui, sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Study Mode Active
      </span>
      <span
        style={{
          fontSize: 14,
          color: "rgba(255, 255, 255, 0.4)",
          fontFamily: "system-ui, sans-serif",
          marginLeft: 8,
        }}
      >
        Python Functions
      </span>
    </div>
  );
}

// Mock input field with blinking cursor
function InputField({
  delay,
  frame,
  fps,
}: {
  delay: number;
  frame: number;
  fps: number;
}) {
  const progress = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 100, stiffness: 200, mass: 0.5 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [10, 0]);

  // Cursor blink
  const cursorOpacity = frame % 30 < 15 ? 1 : 0;

  return (
    <div
      style={{
        marginTop: 24,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 12,
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        <span
          style={{
            fontSize: 15,
            color: "rgba(255, 255, 255, 0.4)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Ask a follow-up question...
        </span>
        {/* Blinking cursor */}
        <div
          style={{
            width: 2,
            height: 20,
            backgroundColor: "#667eea",
            opacity: cursorOpacity,
          }}
        />
      </div>
    </div>
  );
}
