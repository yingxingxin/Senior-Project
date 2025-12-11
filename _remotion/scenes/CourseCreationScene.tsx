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
import { FadeInUp, TypeWriter, MessageTypeWriter } from "../components/Transitions";
import { mockAssistants } from "../lib/mock-data";

/**
 * CourseCreationScene - AI creating a personalized course
 *
 * Timeline (240 frames / 8 seconds):
 * - 0-30: Scene enters, "Creating personalized lessons..." appears
 * - 30-60: Loading animation with dots
 * - 60-90: Lesson card starts appearing
 * - 90-150: Lesson content types in (title, sections)
 * - 150-200: Sections fill in with checkmarks
 * - 200-240: "Ready to learn!" message
 */

export function CourseCreationScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Loading phase (0-60)
  const isLoading = frame < 60;
  const loadingDots = Math.floor((frame / 10) % 4);

  // Lesson card entrance
  const cardProgress = spring({
    frame: Math.max(0, frame - 50),
    fps,
    config: { damping: 60, stiffness: 200 },
  });

  // Section animations
  const section1Progress = spring({
    frame: Math.max(0, frame - 90),
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  const section2Progress = spring({
    frame: Math.max(0, frame - 110),
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  const section3Progress = spring({
    frame: Math.max(0, frame - 130),
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  const section4Progress = spring({
    frame: Math.max(0, frame - 150),
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  // Ready message
  const readyProgress = spring({
    frame: Math.max(0, frame - 180),
    fps,
    config: { damping: 50, stiffness: 300 },
  });

  // Shimmer effect for loading
  const shimmerPosition = (frame * 3) % 200;

  const lessonSections = [
    { title: "Introduction to Functions", duration: "5 min", icon: "📖" },
    { title: "Function Parameters", duration: "8 min", icon: "🔧" },
    { title: "Return Values", duration: "6 min", icon: "" },
    { title: "Practice Exercises", duration: "10 min", icon: "💻" },
  ];

  const sectionProgresses = [section1Progress, section2Progress, section3Progress, section4Progress];

  return (
    <AppFrame url="sprite.exe/learn/python/functions">
      <AbsoluteFill
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
          padding: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Assistant Avatar floating */}
        <div
          style={{
            position: "absolute",
            top: 40,
            right: 60,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.1)",
              overflow: "hidden",
              border: "2px solid rgba(102, 126, 234, 0.3)",
            }}
          >
            <Img
              src={mockAssistants[0].avatarUrl}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <span style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 14 }}>
            Nova is helping
          </span>
        </div>

        {/* Loading State */}
        {isLoading && (
          <FadeInUp delay={5}>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  margin: "0 auto 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "pulse 1s ease-in-out infinite",
                }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <h2 style={{ color: "white", fontSize: 28, fontWeight: 600, margin: 0 }}>
                Creating personalized lessons{".".repeat(loadingDots)}
              </h2>
              <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 16, marginTop: 12 }}>
                Personalizing content for your skill level
              </p>
            </div>
          </FadeInUp>
        )}

        {/* Lesson Card */}
        {!isLoading && (
          <div
            style={{
              opacity: interpolate(cardProgress, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(cardProgress, [0, 1], [40, 0])}px) scale(${interpolate(cardProgress, [0, 1], [0.95, 1])})`,
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: 24,
              padding: 32,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              width: 600,
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Lesson Header */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "inline-block",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  marginBottom: 12,
                }}
              >
                <span style={{ color: "white", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>
                  Python Fundamentals
                </span>
              </div>
              <h2 style={{ color: "white", fontSize: 28, fontWeight: 700, margin: 0 }}>
                <TypeWriter text="Functions & Parameters" delay={70} speed={1.5} showCursor={false} />
              </h2>
              <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 15, marginTop: 8 }}>
                <MessageTypeWriter
                  text="Learn to write reusable code with functions"
                  delay={95}
                  speed={1.2}
                />
              </p>
            </div>

            {/* Lesson Sections */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {lessonSections.map((section, index) => {
                const progress = sectionProgresses[index];
                const isComplete = frame > 150 + index * 15;

                return (
                  <div
                    key={section.title}
                    style={{
                      opacity: interpolate(progress, [0, 1], [0, 1]),
                      transform: `translateX(${interpolate(progress, [0, 1], [-20, 0])}px)`,
                      background: isComplete
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(255, 255, 255, 0.03)",
                      borderRadius: 12,
                      padding: 16,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      border: isComplete
                        ? "1px solid rgba(34, 197, 94, 0.3)"
                        : "1px solid rgba(255, 255, 255, 0.05)",
                      transition: "all 0.3s",
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{section.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "white", fontSize: 15, fontWeight: 500 }}>
                        {section.title}
                      </div>
                      <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 13 }}>
                        {section.duration}
                      </div>
                    </div>
                    {isComplete && (
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          background: "#22c55e",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Ready Message */}
            {frame > 180 && (
              <div
                style={{
                  marginTop: 24,
                  opacity: interpolate(readyProgress, [0, 1], [0, 1]),
                  transform: `translateY(${interpolate(readyProgress, [0, 1], [10, 0])}px)`,
                  textAlign: "center",
                }}
              >
                <button
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: 12,
                    padding: "14px 32px",
                    color: "white",
                    fontSize: 16,
                    fontWeight: 600,
                    boxShadow: "0 10px 30px rgba(102, 126, 234, 0.4)",
                  }}
                >
                  Start Learning →
                </button>
              </div>
            )}
          </div>
        )}
      </AbsoluteFill>
    </AppFrame>
  );
}
