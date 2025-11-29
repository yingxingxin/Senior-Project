import { Composition } from "remotion";
import { DemoVideo, DEMO_VIDEO_CONFIG } from "./DemoVideo";

/**
 * Remotion Root
 *
 * Registers all video compositions. Currently only the main DemoVideo,
 * but this can be extended for additional variants (social clips, etc.).
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DemoVideo"
        component={DemoVideo}
        durationInFrames={DEMO_VIDEO_CONFIG.totalFrames}
        fps={DEMO_VIDEO_CONFIG.fps}
        width={DEMO_VIDEO_CONFIG.width}
        height={DEMO_VIDEO_CONFIG.height}
        defaultProps={{}}
      />
    </>
  );
};
