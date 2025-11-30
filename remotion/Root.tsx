import { Composition } from "remotion";
import { DemoVideo, DEMO_VIDEO_CONFIG } from "./DemoVideo";
import { NovaHeroScene } from "./scenes/hero/NovaHeroScene";
import { AtlasHeroScene } from "./scenes/hero/AtlasHeroScene";
import { SageHeroScene } from "./scenes/hero/SageHeroScene";
import { CourseCreationFeature } from "./scenes/feature/CourseCreationFeature";
import { StudyModeFeature } from "./scenes/feature/StudyModeFeature";
import { GamificationFeature } from "./scenes/feature/GamificationFeature";

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
    </>
  );
};
