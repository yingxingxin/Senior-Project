import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import { AppFrame } from "../components/AppFrame";
import { TypeWriter, ScaleIn, FadeInUp } from "../components/Transitions";
import { CursorAnimation, createCursorPath } from "../components/CursorAnimation";
import { mockAssistants } from "../lib/mock-data";

/**
 * AssistantSelectionScene - Choose your AI companion
 *
 * Timeline (210 frames / 7 seconds):
 * - 0-30: Title types out
 * - 20-60: Cards stagger in
 * - 60-90: Cursor enters, moves to Nova
 * - 90-120: Hover glow effect
 * - 120-135: Cursor clicks
 * - 135-180: Nova selected, others dim
 * - 165-210: Speech bubble appears
 */

export function AssistantSelectionScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Selected assistant is Nova (index 0)
  const selectedIndex = 0;

  // Cursor positions - enter from bottom right, move to Nova, click
  const cursorPositions = createCursorPath(
    [
      { x: 1600, y: 900 },  // Start off-screen bottom right
      { x: 480, y: 450 },   // Move to Nova card
      { x: 480, y: 450, click: true }, // Click Nova
    ],
    60,  // Start at frame 60
    30   // 30 frames between positions
  );

  // Selection animation - starts after click at frame 120
  const selectionProgress = spring({
    frame: Math.max(0, frame - 120),
    fps,
    config: { damping: 40, stiffness: 300 },
  });

  // Speech bubble animation - starts at frame 165
  const speechProgress = spring({
    frame: Math.max(0, frame - 165),
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  return (
    <AppFrame url="sprite.exe/onboarding">
      <AbsoluteFill
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
          padding: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1
            style={{
              color: "white",
              fontSize: 48,
              fontWeight: 700,
              margin: 0,
              marginBottom: 12,
            }}
          >
            <TypeWriter text="Choose Your Companion" delay={0} speed={1.5} />
          </h1>
          <FadeInUp delay={25}>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.6)",
                fontSize: 20,
                margin: 0,
              }}
            >
              Select an AI assistant to guide your learning journey
            </p>
          </FadeInUp>
        </div>

        {/* Assistant Cards */}
        <div
          style={{
            display: "flex",
            gap: 32,
            justifyContent: "center",
            marginBottom: 48,
          }}
        >
          {mockAssistants.map((assistant, index) => {
            // Staggered entrance for each card
            const cardProgress = spring({
              frame: Math.max(0, frame - 20 - index * 10),
              fps,
              config: { damping: 60, stiffness: 200 },
            });

            const isSelected = index === selectedIndex;
            const showSelection = frame > 120;

            // Determine card state based on selection
            const cardOpacity = showSelection
              ? isSelected
                ? 1
                : interpolate(selectionProgress, [0, 1], [1, 0.4])
              : interpolate(cardProgress, [0, 1], [0, 1]);

            const cardScale = showSelection && isSelected
              ? interpolate(selectionProgress, [0, 1], [1, 1.05])
              : interpolate(cardProgress, [0, 1], [0.8, 1]);

            // Hover glow effect (frames 90-120)
            const isHovering = frame >= 90 && frame < 120 && index === selectedIndex;
            const hoverGlow = isHovering ? "0 0 30px rgba(102, 126, 234, 0.5)" : "none";

            // Selection glow
            const selectionGlow = showSelection && isSelected
              ? `0 0 ${interpolate(selectionProgress, [0, 1], [0, 40])}px rgba(102, 126, 234, 0.6)`
              : "none";

            return (
              <div
                key={assistant.id}
                style={{
                  opacity: cardOpacity,
                  transform: `scale(${cardScale})`,
                  width: 280,
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: 20,
                  border: showSelection && isSelected
                    ? "2px solid rgba(102, 126, 234, 0.8)"
                    : "1px solid rgba(255, 255, 255, 0.1)",
                  overflow: "hidden",
                  boxShadow: selectionGlow || hoverGlow,
                  transition: "box-shadow 0.2s",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    height: 280,
                    background: "linear-gradient(180deg, rgba(102, 126, 234, 0.1) 0%, transparent 100%)",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <Img
                    src={assistant.avatarUrl}
                    style={{
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "bottom",
                    }}
                  />
                </div>

                {/* Info */}
                <div style={{ padding: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <h3
                      style={{
                        color: "white",
                        fontSize: 22,
                        fontWeight: 600,
                        margin: 0,
                      }}
                    >
                      {assistant.name}
                    </h3>
                    <span
                      style={{
                        fontSize: 12,
                        color: "rgba(255, 255, 255, 0.6)",
                        background: "rgba(255, 255, 255, 0.1)",
                        padding: "4px 10px",
                        borderRadius: 12,
                        textTransform: "capitalize",
                      }}
                    >
                      {assistant.personality}
                    </span>
                  </div>
                  <p
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      fontSize: 14,
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {assistant.description}
                  </p>

                  {/* Selected indicator */}
                  {showSelection && isSelected && (
                    <div
                      style={{
                        marginTop: 16,
                        opacity: interpolate(selectionProgress, [0, 1], [0, 1]),
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{ color: "white", fontSize: 14, fontWeight: 500 }}>
                        Selected
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Speech Bubble - appears after selection */}
        {frame > 165 && (
          <div
            style={{
              opacity: interpolate(speechProgress, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(speechProgress, [0, 1], [20, 0])}px)`,
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)",
              border: "1px solid rgba(102, 126, 234, 0.3)",
              borderRadius: 20,
              padding: "20px 32px",
              maxWidth: 500,
              textAlign: "center",
            }}
          >
            <p
              style={{
                color: "white",
                fontSize: 18,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {mockAssistants[selectedIndex].speechBubble}
            </p>
          </div>
        )}

        {/* Cursor Animation */}
        <CursorAnimation positions={cursorPositions} visible={frame >= 60} />
      </AbsoluteFill>
    </AppFrame>
  );
}
