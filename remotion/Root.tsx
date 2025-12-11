import { Composition } from "remotion";
import { DemoVideo, DEMO_VIDEO_CONFIG } from "./DemoVideo";
import { NovaHeroScene } from "./scenes/hero/NovaHeroScene";
import { AtlasHeroScene } from "./scenes/hero/AtlasHeroScene";
import { SageHeroScene } from "./scenes/hero/SageHeroScene";
import { CourseCreationFeature } from "./scenes/feature/CourseCreationFeature";
import { StudyModeFeature } from "./scenes/feature/StudyModeFeature";
import { GamificationFeature } from "./scenes/feature/GamificationFeature";

// Poster stills for screenshot export
import {
  HomeDashboardStill,
  LandingStill,
  CoursesStill,
  QuizzesStill,
  StudyChatStill,
  LeaderboardStill,
  FriendsStill,
  OnboardingWelcomeStill,
  OnboardingGenderStill,
  OnboardingPersonaStill,
} from "./scenes/poster";

// Theme support for light/dark mode posters
import { DARK_THEME } from "./lib/poster-theme";

/**
 * Remotion Root
 *
 * Registers all video compositions:
 * - DemoVideo: Full 40-second marketing demo
 * - Hero Scenes: 8-second looping videos for landing page carousel
 */

// Hero scene config (8 seconds each)
const HERO_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  durationInFrames: 240, // 8 seconds
};

// Feature video config (8 seconds each)
const FEATURE_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  durationInFrames: 240, // 8 seconds
};

// Poster still config (single frame for screenshot export)
const STILL_CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  durationInFrames: 1, // Single frame
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main Demo Video */}
      <Composition
        id="DemoVideo"
        component={DemoVideo}
        durationInFrames={DEMO_VIDEO_CONFIG.totalFrames}
        fps={DEMO_VIDEO_CONFIG.fps}
        width={DEMO_VIDEO_CONFIG.width}
        height={DEMO_VIDEO_CONFIG.height}
        defaultProps={{}}
      />

      {/* Hero Videos for Landing Page Carousel */}
      <Composition
        id="NovaHeroScene"
        component={NovaHeroScene}
        durationInFrames={HERO_CONFIG.durationInFrames}
        fps={HERO_CONFIG.fps}
        width={HERO_CONFIG.width}
        height={HERO_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="AtlasHeroScene"
        component={AtlasHeroScene}
        durationInFrames={HERO_CONFIG.durationInFrames}
        fps={HERO_CONFIG.fps}
        width={HERO_CONFIG.width}
        height={HERO_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="SageHeroScene"
        component={SageHeroScene}
        durationInFrames={HERO_CONFIG.durationInFrames}
        fps={HERO_CONFIG.fps}
        width={HERO_CONFIG.width}
        height={HERO_CONFIG.height}
        defaultProps={{}}
      />

      {/* Feature Videos for Landing Page Feature Sections */}
      <Composition
        id="CourseCreationFeature"
        component={CourseCreationFeature}
        durationInFrames={FEATURE_CONFIG.durationInFrames}
        fps={FEATURE_CONFIG.fps}
        width={FEATURE_CONFIG.width}
        height={FEATURE_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="StudyModeFeature"
        component={StudyModeFeature}
        durationInFrames={FEATURE_CONFIG.durationInFrames}
        fps={FEATURE_CONFIG.fps}
        width={FEATURE_CONFIG.width}
        height={FEATURE_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="GamificationFeature"
        component={GamificationFeature}
        durationInFrames={FEATURE_CONFIG.durationInFrames}
        fps={FEATURE_CONFIG.fps}
        width={FEATURE_CONFIG.width}
        height={FEATURE_CONFIG.height}
        defaultProps={{}}
      />

      {/* Poster Stills for Screenshot Export */}
      <Composition
        id="PosterLanding"
        component={LandingStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="PosterHomeDashboard"
        component={HomeDashboardStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="PosterCourses"
        component={CoursesStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="PosterQuizzes"
        component={QuizzesStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="PosterStudyChat"
        component={StudyChatStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="PosterLeaderboard"
        component={LeaderboardStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="PosterFriends"
        component={FriendsStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="PosterOnboardingWelcome"
        component={OnboardingWelcomeStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="PosterOnboardingGender"
        component={OnboardingGenderStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{}}
      />
      <Composition
        id="PosterOnboardingPersona"
        component={OnboardingPersonaStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{}}
      />

      {/* Dark Mode Poster Stills (original dark theme) */}
      <Composition
        id="PosterLandingDark"
        component={LandingStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{ theme: DARK_THEME }}
      />
      <Composition
        id="PosterHomeDashboardDark"
        component={HomeDashboardStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{ theme: DARK_THEME }}
      />
      <Composition
        id="PosterCoursesDark"
        component={CoursesStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{ theme: DARK_THEME }}
      />
      <Composition
        id="PosterQuizzesDark"
        component={QuizzesStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{ theme: DARK_THEME }}
      />
      <Composition
        id="PosterStudyChatDark"
        component={StudyChatStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{ theme: DARK_THEME }}
      />
      <Composition
        id="PosterLeaderboardDark"
        component={LeaderboardStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{ theme: DARK_THEME }}
      />
      <Composition
        id="PosterFriendsDark"
        component={FriendsStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{ theme: DARK_THEME }}
      />
      <Composition
        id="PosterOnboardingWelcomeDark"
        component={OnboardingWelcomeStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{ theme: DARK_THEME }}
      />
      <Composition
        id="PosterOnboardingGenderDark"
        component={OnboardingGenderStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{ theme: DARK_THEME }}
      />
      <Composition
        id="PosterOnboardingPersonaDark"
        component={OnboardingPersonaStill}
        durationInFrames={STILL_CONFIG.durationInFrames}
        fps={STILL_CONFIG.fps}
        width={STILL_CONFIG.width}
        height={STILL_CONFIG.height}
        defaultProps={{ theme: DARK_THEME }}
      />
    </>
  );
};
