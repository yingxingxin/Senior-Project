/**
 * Remotion Entry Point
 *
 * This file is the entry point for the Remotion Studio and CLI.
 * It registers all compositions and imports required styles.
 */
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

// Import Remotion-specific styles (simplified CSS without Tailwind v4 directives)
import "./styles.css";

registerRoot(RemotionRoot);
