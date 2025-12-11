/**
 * Capture Screenshots using Remotion Still Renderer
 *
 * Renders poster stills from Remotion compositions to PNG files.
 * Uses mock data for realistic, polished screenshots.
 *
 * Usage:
 *   npm run capture              # Light mode only (saves ink)
 *   npm run capture -- --dark    # Dark mode only
 *   npm run capture -- --both    # Both light and dark modes
 */

import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "path";
import fs from "fs";

const OUTPUT_DIR = path.join(process.cwd(), "screenshots");
const OUTPUT_DIR_DARK = path.join(process.cwd(), "screenshots/dark");

// Light mode stills (default - saves ink for printing)
const LIGHT_STILLS = [
  { id: "PosterLanding", output: "landing.png" },
  { id: "PosterHomeDashboard", output: "home-dashboard.png" },
  { id: "PosterCourses", output: "courses.png" },
  { id: "PosterQuizzes", output: "quizzes.png" },
  { id: "PosterStudyChat", output: "study-chat.png" },
  { id: "PosterLeaderboard", output: "leaderboard.png" },
  { id: "PosterFriends", output: "friends.png" },
  { id: "PosterOnboardingWelcome", output: "onboarding-welcome.png" },
  { id: "PosterOnboardingGender", output: "onboarding-gender.png" },
  { id: "PosterOnboardingPersona", output: "onboarding-persona.png" },
];

// Dark mode stills (original theme)
const DARK_STILLS = [
  { id: "PosterLandingDark", output: "landing.png" },
  { id: "PosterHomeDashboardDark", output: "home-dashboard.png" },
  { id: "PosterCoursesDark", output: "courses.png" },
  { id: "PosterQuizzesDark", output: "quizzes.png" },
  { id: "PosterStudyChatDark", output: "study-chat.png" },
  { id: "PosterLeaderboardDark", output: "leaderboard.png" },
  { id: "PosterFriendsDark", output: "friends.png" },
  { id: "PosterOnboardingWelcomeDark", output: "onboarding-welcome.png" },
  { id: "PosterOnboardingGenderDark", output: "onboarding-gender.png" },
  { id: "PosterOnboardingPersonaDark", output: "onboarding-persona.png" },
];

async function ensureOutputDir(dir: string): Promise<void> {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

interface RenderOptions {
  bundleLocation: string;
  stills: typeof LIGHT_STILLS;
  outputDir: string;
  label: string;
}

async function renderStills({ bundleLocation, stills, outputDir, label }: RenderOptions): Promise<number> {
  console.log(`\nRendering ${label} stills...\n`);
  await ensureOutputDir(outputDir);

  let count = 0;
  for (const still of stills) {
    try {
      console.log(`  Rendering: ${still.id}`);

      // Get composition metadata
      const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: still.id,
      });

      const outputPath = path.join(outputDir, still.output);

      // Render the still
      await renderStill({
        composition,
        serveUrl: bundleLocation,
        output: outputPath,
        frame: 0,
        scale: 2, // 2x for high-quality output (3840x2160)
      });

      console.log(`    Saved: ${still.output}`);
      count++;
    } catch (error) {
      console.error(`    Error rendering ${still.id}:`, error);
    }
  }

  return count;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const darkOnly = args.includes("--dark");
  const both = args.includes("--both");

  const renderLight = !darkOnly;
  const renderDark = darkOnly || both;

  console.log("\n=== Sprite Screenshot Capture (Remotion) ===\n");
  console.log(`Mode: ${darkOnly ? "dark only" : both ? "both light and dark" : "light only (saves ink)"}`);
  console.log(`Output: ${OUTPUT_DIR}`);

  console.log("\nBundling Remotion project...");
  const bundleLocation = await bundle({
    entryPoint: path.join(process.cwd(), "remotion/index.tsx"),
    // Webpack override for Tailwind support
    webpackOverride: (config) => config,
  });
  console.log("Bundle complete!");

  let totalCount = 0;

  if (renderLight) {
    totalCount += await renderStills({
      bundleLocation,
      stills: LIGHT_STILLS,
      outputDir: OUTPUT_DIR,
      label: "light mode",
    });
  }

  if (renderDark) {
    totalCount += await renderStills({
      bundleLocation,
      stills: DARK_STILLS,
      outputDir: OUTPUT_DIR_DARK,
      label: "dark mode",
    });
  }

  console.log("\n=== Screenshot capture complete! ===\n");
  console.log(`Total captured: ${totalCount} screenshots`);

  if (renderLight) {
    const lightFiles = fs.readdirSync(OUTPUT_DIR).filter((f) => f.endsWith(".png"));
    console.log(`\nLight mode (${lightFiles.length}):`);
    lightFiles.forEach((f) => console.log(`  - ${f}`));
  }

  if (renderDark) {
    const darkFiles = fs.readdirSync(OUTPUT_DIR_DARK).filter((f) => f.endsWith(".png"));
    console.log(`\nDark mode (${darkFiles.length}):`);
    darkFiles.forEach((f) => console.log(`  - dark/${f}`));
  }

  console.log("");
}

main().catch(console.error);
