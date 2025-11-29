import React from "react";
import { Series, AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AssistantSelectionScene } from "./scenes/AssistantSelectionScene";
import { DashboardScene } from "./scenes/DashboardScene";
import { CourseCreationScene } from "./scenes/CourseCreationScene";
import { StudyModeScene } from "./scenes/StudyModeScene";
import { AchievementScene } from "./scenes/AchievementScene";
import { OutroScene } from "./scenes/OutroScene";

/**
 * DemoVideo - Main composition orchestrating all scenes
 *
 * Scene breakdown (at 30fps) - 40 seconds total:
 * - AssistantSelectionScene: 0-210 frames (7 seconds) - Choose AI companion
 * - DashboardScene: 210-390 frames (6 seconds) - Personalized home dashboard
 * - CourseCreationScene: 390-630 frames (8 seconds) - AI creates course
 * - StudyModeScene: 630-930 frames (10 seconds) - AI chat experience
 * - AchievementScene: 930-1080 frames (5 seconds) - Lesson complete + rewards
 * - OutroScene: 1080-1200 frames (4 seconds) - CTA with all assistants
 *
 * Total: 40 seconds (1200 frames)
 */

// Scene configuration - 40 seconds total
const SCENE_DURATION = {
  assistantSelection: 210, // 7 seconds
  dashboard: 180, // 6 seconds (NEW)
  courseCreation: 240, // 8 seconds (renamed from lessonGeneration)
  studyMode: 300, // 10 seconds
  achievement: 150, // 5 seconds
  outro: 120, // 4 seconds (NEW)
};

export const DEMO_VIDEO_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  totalFrames:
    SCENE_DURATION.assistantSelection +
    SCENE_DURATION.dashboard +
    SCENE_DURATION.courseCreation +
    SCENE_DURATION.studyMode +
    SCENE_DURATION.achievement +
    SCENE_DURATION.outro,
};

// Transition overlay component - fade from black at scene start
function TransitionOverlay({ direction = "in" }: { direction?: "in" | "out" }) {
  const frame = useCurrentFrame();
  const transitionDuration = 15;

  const opacity =
    direction === "in"
      ? interpolate(frame, [0, transitionDuration], [1, 0], { extrapolateRight: "clamp" })
      : interpolate(frame, [0, transitionDuration], [0, 1], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
}

export const DemoVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <Series>
        {/* Scene 1: Assistant Selection - Choose your AI companion */}
        <Series.Sequence durationInFrames={SCENE_DURATION.assistantSelection}>
          <AssistantSelectionScene />
          <TransitionOverlay direction="in" />
        </Series.Sequence>

        {/* Scene 2: Dashboard - Personalized home with assistant greeting */}
        <Series.Sequence durationInFrames={SCENE_DURATION.dashboard}>
          <DashboardScene />
          <TransitionOverlay direction="in" />
        </Series.Sequence>

        {/* Scene 3: Course Creation - AI creates personalized course */}
        <Series.Sequence durationInFrames={SCENE_DURATION.courseCreation}>
          <CourseCreationScene />
          <TransitionOverlay direction="in" />
        </Series.Sequence>

        {/* Scene 4: Study Mode - AI chat experience */}
        <Series.Sequence durationInFrames={SCENE_DURATION.studyMode}>
          <StudyModeScene />
          <TransitionOverlay direction="in" />
        </Series.Sequence>

        {/* Scene 5: Achievement - Lesson complete with confetti */}
        <Series.Sequence durationInFrames={SCENE_DURATION.achievement}>
          <AchievementScene />
          <TransitionOverlay direction="in" />
        </Series.Sequence>

        {/* Scene 6: Outro - CTA with logo and all assistants */}
        <Series.Sequence durationInFrames={SCENE_DURATION.outro}>
          <OutroScene />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};
