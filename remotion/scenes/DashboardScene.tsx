import React from "react";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { AppFrame } from "../components/AppFrame";
import { FadeInUp, FadeInLeft, CountUp, TypeWriter } from "../components/Transitions";
import { CursorAnimation, createCursorPath } from "../components/CursorAnimation";
import { mockUser, mockAssistants, mockQuickActions, mockCourses } from "../lib/mock-data";

/**
 * DashboardScene - User home dashboard (optimized for 8 seconds / 240 frames)
 *
 * Timeline:
 * - 0-30: Sidebar slides in
 * - 15-45: Stats count up
 * - 25-55: Assistant card fades up
 * - 40-80: Speech bubble with TypeWriter
 * - 60-100: Quick actions stagger in
 * - 80-140: Cursor moves to Quick Quiz, clicks
 * - 140-200: Course cards slide in
 * - 200-240: Hold + transition
 */

export function DashboardScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Speech bubble animation - starts earlier
  const speechProgress = spring({
    frame: Math.max(0, frame - 35),
    fps,
    config: { damping: 80, stiffness: 200 },
  });

  // Cursor positions - move to Quick Quiz button and click
  const cursorPositions = createCursorPath(
    [
      { x: 960, y: 540 },           // Start center
      { x: 560, y: 520 },           // Move to Quick Quiz button
      { x: 560, y: 520, click: true }, // Click
      { x: 700, y: 700 },           // Move toward course cards
    ],
    80,   // Start at frame 80
    25    // 25 frames between positions
  );

  // Button hover/press animation
  const isButtonHovered = frame >= 105 && frame < 130;
  const isButtonPressed = frame >= 130 && frame < 145;

  return (
    <AppFrame url="sprite.exe/home">
      <AbsoluteFill
        className="dark"
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
          padding: 40,
          display: "flex",
          gap: 40,
        }}
      >
        {/* Left Sidebar - Stats */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <FadeInLeft delay={5}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: 16,
                padding: 24,
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* User Info */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 700,
                    fontSize: 18,
                  }}
                >
                  {mockUser.name.charAt(0)}
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 600, fontSize: 16 }}>{mockUser.name}</div>
                  <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 13 }}>Level {mockUser.level}</div>
                </div>
              </div>

              {/* Stats Grid with CountUp */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <AnimatedStatCard label="Points" targetValue={mockUser.points} icon="⭐" delay={15} />
                <AnimatedStatCard label="Streak" targetValue={mockUser.streakDays} icon="🔥" suffix=" days" delay={20} />
                <AnimatedStatCard label="Lessons" targetValue={mockUser.totalLessonsCompleted} icon="📚" delay={25} />
                <AnimatedStatCard label="Courses" targetValue={mockUser.totalCoursesCompleted} icon="" delay={30} />
              </div>
            </div>
          </FadeInLeft>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Assistant Hero Card */}
          <FadeInUp delay={15}>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)",
                borderRadius: 20,
                padding: 28,
                border: "1px solid rgba(102, 126, 234, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: 28,
                position: "relative",
              }}
            >
              {/* Assistant Avatar */}
              <div
                style={{
                  width: 120,
                  height: 160,
                  borderRadius: 16,
                  background: "rgba(255, 255, 255, 0.05)",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                <Img
                  src={mockAssistants[0].avatarUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "bottom",
                  }}
                />
              </div>

              {/* Speech Bubble with TypeWriter */}
              <div
                style={{
                  flex: 1,
                  opacity: interpolate(speechProgress, [0, 1], [0, 1]),
                  transform: `translateX(${interpolate(speechProgress, [0, 1], [20, 0])}px)`,
                }}
              >
                <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 14, marginBottom: 8 }}>
                  {mockAssistants[0].name} says:
                </div>
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    borderRadius: 16,
                    padding: 20,
                    color: "white",
                    fontSize: 18,
                    lineHeight: 1.5,
                  }}
                >
                  <TypeWriter
                    text={mockAssistants[0].speechBubble}
                    delay={45}
                    speed={1.5}
                    showCursor={false}
                  />
                </div>
              </div>
            </div>
          </FadeInUp>

          {/* Quick Actions with hover/click effects */}
          <FadeInUp delay={45}>
            <div>
              <h3 style={{ color: "white", fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                Quick Actions
              </h3>
              <div style={{ display: "flex", gap: 12 }}>
                {mockQuickActions.map((action, index) => {
                  // Quick Quiz (index 1) gets hover and click effects
                  const isQuiz = index === 1;
                  const buttonScale = isQuiz && isButtonPressed ? 0.95 : 1;
                  const buttonGlow = isQuiz && isButtonHovered
                    ? "0 0 20px rgba(102, 126, 234, 0.5)"
                    : "none";
                  const buttonBorder = isQuiz && isButtonHovered
                    ? "1px solid rgba(102, 126, 234, 0.5)"
                    : "1px solid rgba(255, 255, 255, 0.1)";

                  return (
                    <button
                      key={action.id}
                      style={{
                        flex: 1,
                        background: isQuiz && isButtonHovered
                          ? "rgba(102, 126, 234, 0.15)"
                          : "rgba(255, 255, 255, 0.05)",
                        border: buttonBorder,
                        borderRadius: 12,
                        padding: "14px 18px",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        color: "white",
                        fontSize: 14,
                        fontWeight: 500,
                        transform: `scale(${buttonScale})`,
                        boxShadow: buttonGlow,
                        transition: "all 0.1s",
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{action.icon}</span>
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </FadeInUp>

          {/* Continue Learning */}
          <FadeInUp delay={120}>
            <div>
              <h3 style={{ color: "white", fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                Continue Learning
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {mockCourses.slice(0, 2).map((course, index) => (
                  <AnimatedCourseCard key={course.id} course={course} delay={130 + index * 10} />
                ))}
              </div>
            </div>
          </FadeInUp>
        </div>

        {/* Cursor Animation */}
        <CursorAnimation positions={cursorPositions} visible={frame >= 80} />
      </AbsoluteFill>
    </AppFrame>
  );
}

// Animated stat card with CountUp
function AnimatedStatCard({
  label,
  targetValue,
  icon,
  suffix = "",
  delay = 0,
}: {
  label: string;
  targetValue: number;
  icon: string;
  suffix?: string;
  delay?: number;
}) {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: 12,
        padding: 16,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ color: "white", fontSize: 20, fontWeight: 700 }}>
        <CountUp from={0} to={targetValue} delay={delay} suffix={suffix} />
      </div>
      <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}>{label}</div>
    </div>
  );
}

// Animated course card with progress bar animation
function AnimatedCourseCard({
  course,
  delay = 0,
}: {
  course: typeof mockCourses[0];
  delay?: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animate progress bar width
  const progressBarProgress = spring({
    frame: Math.max(0, frame - delay - 15),
    fps,
    config: { damping: 80, stiffness: 100 },
  });

  const animatedProgress = interpolate(progressBarProgress, [0, 1], [0, course.progress]);

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: 16,
        padding: 18,
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <span style={{ fontSize: 28 }}>{course.icon}</span>
        <div>
          <div style={{ color: "white", fontSize: 15, fontWeight: 600 }}>{course.title}</div>
          <div style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: 12 }}>
            {course.lessonsCount} lessons • {course.duration}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            flex: 1,
            height: 6,
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${animatedProgress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              borderRadius: 3,
            }}
          />
        </div>
        <span style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: 13 }}>
          {Math.round(animatedProgress)}%
        </span>
      </div>
    </div>
  );
}
