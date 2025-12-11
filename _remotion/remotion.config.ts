import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";
import path from "path";

/**
 * Remotion Configuration
 *
 * This config enables:
 * 1. TailwindCSS v4 support via @remotion/tailwind-v4
 * 2. Path aliases to match tsconfig.json for component sharing
 */
Config.setOverwriteOutput(true);

Config.overrideWebpackConfig((currentConfiguration) => {
  // First enable Tailwind v4
  const withTailwind = enableTailwind(currentConfiguration);

  // Then add path aliases
  return {
    ...withTailwind,
    resolve: {
      ...withTailwind.resolve,
      alias: {
        ...withTailwind.resolve?.alias,
        // Match tsconfig.json path aliases
        "@": path.resolve(__dirname, ".."),
        "@/lib": path.resolve(__dirname, "../src/lib"),
      },
    },
  };
});
