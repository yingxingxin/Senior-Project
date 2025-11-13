/**
 * OpenRouter Configuration
 *
 * Centralized OpenRouter client for AI theme generation.
 * Uses the Vercel AI SDK's OpenAI adapter pointed at OpenRouter.
 *
 * Configuration:
 * - API Key: Must be set via OPENROUTER_API_KEY environment variable
 * - All other settings are hardcoded constants
 *
 * Note: Using a specific model (anthropic/claude-3.5-sonnet) instead of
 * openrouter/auto for better tool calling compatibility.
 *
 * See: https://openrouter.ai/docs for API documentation
 */

import { createOpenAI } from "@ai-sdk/openai";

// OpenRouter API Configuration
// These values are hardcoded since they rarely change
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_SITE_URL = "http://localhost:3000"; // Used for OpenRouter analytics
const OPENROUTER_APP_NAME = "Senior Project Theme Editor";
// Using GPT-4o for reliable tool calling at lower cost
const DEFAULT_MODEL = "openai/gpt-4o";

/**
 * OpenRouter client instance
 * Configured to work with Vercel AI SDK
 */
export const openrouter = createOpenAI({
  baseURL: OPENROUTER_BASE_URL,
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": OPENROUTER_SITE_URL,
    "X-Title": OPENROUTER_APP_NAME,
  },
  name: "openrouter",
});

/**
 * Default model for theme generation
 * Using GPT-4o for reliable tool calling at lower cost
 */
export const THEME_MODEL = DEFAULT_MODEL;

/**
 * Validates OpenRouter configuration
 * @throws Error if OPENROUTER_API_KEY is not set
 */
export function validateOpenRouterConfig() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set");
  }
}
