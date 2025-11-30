import React from "react";
import { useCurrentFrame } from "remotion";
import { FadeIn } from "../../components/Transitions";
import { mockAssistants, mockHeroChats } from "../../lib/mock-data";
import { HeroBackground } from "./shared/HeroBackground";
import { HeroChatBubble } from "./shared/HeroChatBubble";

/**
 * SageHeroScene - 8-second hero video featuring Sage
 *
 * Timeline (240 frames @ 30fps):
 * - 0-20: Scene fades in
 * - 10-70: Sage's first message types
 * - 60-120: User message slides in + types
 * - 110-190: Sage's response types
 * - 190-220: Hold for readability
 * - 220-240: Fade out for loop
 *
 * Style: Thoughtful, earthy green-amber gradient, floating particles
 */
export function SageHeroScene() {
  const frame = useCurrentFrame();

  const sage = mockAssistants.find((a) => a.id === "sage");
  if (!sage) throw new Error("Sage assistant not found in mock data");

  const chat = mockHeroChats.sage;

  // Avatar gentle breathing animation (Sage's calm nature)
  const breathePhase = Math.sin(frame * 0.03) * 0.5 + 0.5;
  const avatarScale = 1 + breathePhase * 0.01;

  return (
    <HeroBackground
      colors={chat.gradient.colors}
      baseAngle={chat.gradient.angle}
      particleStyle={chat.particleStyle}
    >
      {/* Main content container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: 60,
          maxWidth: 900,
          margin: "0 auto",
          height: "100%",
        }}
      >
        {/* Header with assistant name */}
        <FadeIn delay={5}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#d97706",
                boxShadow: "0 0 10px #d97706",
              }}
            />
            <span
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              Learning with {sage.name}
            </span>
          </div>
        </FadeIn>

        {/* Chat messages */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            justifyContent: "center",
          }}
        >
          {/* Sage's first message */}
          <HeroChatBubble
            role="assistant"
            text={chat.messages[0].text}
            avatarUrl={sage.avatarUrl}
            delay={10}
            typingSpeed={1.3}
          />

          {/* User message */}
          <HeroChatBubble
            role="user"
            text={chat.messages[1].text}
            delay={60}
            typingSpeed={1.2}
          />

          {/* Sage's response */}
          <HeroChatBubble
            role="assistant"
            text={chat.messages[2].text}
            avatarUrl={sage.avatarUrl}
            delay={110}
            typingSpeed={1.3}
          />
        </div>
      </div>
    </HeroBackground>
  );
}
