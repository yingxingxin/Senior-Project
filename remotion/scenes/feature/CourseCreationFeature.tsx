import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AppFrame } from "../../components/AppFrame";
import { FadeIn, TypeWriter } from "../../components/Transitions";
import { mockFeatureVideos } from "../../lib/mock-data";
import { LoopFade } from "./shared/LoopFade";
import { MockCard } from "./shared/MockCard";
import { MockListItem } from "./shared/MockListItem";
import { MockProgressBar } from "./shared/MockProgressBar";

/**
 * CourseCreationFeature - 8 second feature video
 *
 * Shows AI generating a personalized Python course in real-time.
 * Timeline:
 * - 0-20: AppFrame scales in
 * - 15-50: "Creating your course..." header
 * - 40-70: Course card scales in
 * - 60-160: Lesson items animate staggered
 * - 150-190: Progress bar fills
 * - 180-210: Start Learning button appears
 * - 220-240: LoopFade out
 */

const { courseCreation } = mockFeatureVideos;

export function CourseCreationFeature() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AppFrame url="sprite.exe/courses/create">
      <AbsoluteFill
        style={{
          backgroundColor: "#0a0a0a",
          padding: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Creating header with loading indicator */}
        <FadeIn delay={15}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 32,
            }}
          >
            <LoadingSpinner frame={frame} />
            <span
              style={{
                fontSize: 20,
                color: "rgba(255, 255, 255, 0.7)",
                fontFamily: "system-ui, sans-serif",
                fontWeight: 500,
              }}
            >
              <TypeWriter
                text="Creating your personalized course..."
                delay={20}
                speed={1.5}
                showCursor={false}
              />
            </span>
          </div>
        </FadeIn>

        {/* Main course card */}
        <MockCard delay={40} width={600} padding={32}>
          {/* Course header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontSize: 48,
                lineHeight: 1,
              }}
            >
              {courseCreation.courseIcon}
            </div>
            <div>
              <h2
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#ffffff",
                  margin: 0,
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                {courseCreation.courseTitle}
              </h2>
              <p
                style={{
                  fontSize: 14,
                  color: "rgba(255, 255, 255, 0.5)",
                  margin: "4px 0 0 0",
                  fontFamily: "system-ui, sans-serif",
                }}
              >
                5 lessons • ~90 min total
              </p>
            </div>
          </div>

          {/* Lesson list */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 24,
            }}
          >
            {courseCreation.lessons.map((lesson, index) => (
              <MockListItem
                key={lesson.title}
                title={lesson.title}
                subtitle={lesson.duration}
                status={lesson.status}
                delay={60 + index * 20}
              />
            ))}
          </div>

          {/* Progress bar */}
          <MockProgressBar
            progress={100}
            delay={150}
            duration={40}
            color="#22c55e"
            showLabel
          />

          {/* Start Learning button */}
          <StartButton delay={180} frame={frame} fps={fps} />
        </MockCard>
      </AbsoluteFill>

      <LoopFade />
    </AppFrame>
  );
}

// Animated loading spinner
function LoadingSpinner({ frame }: { frame: number }) {
  const rotation = (frame * 6) % 360;

  return (
    <div
      style={{
        width: 20,
        height: 20,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="rgba(102, 126, 234, 0.3)"
          strokeWidth="2"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="#667eea"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

// Start Learning button with animation
function StartButton({
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

  return (
    <div
      style={{
        marginTop: 24,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <button
        style={{
          padding: "14px 32px",
          fontSize: 16,
          fontWeight: 600,
          color: "#ffffff",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
          fontFamily: "system-ui, sans-serif",
          boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
        }}
      >
        Start Learning
      </button>
    </div>
  );
}
