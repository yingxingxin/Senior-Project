import { openrouter } from "@/src/lib/openrouter";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  tool,
} from "ai";
import {
  themeGenerationSchema,
  parseGeneratedTheme,
} from "../../settings/_lib/theme-generator-schema";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: UIMessage[] } = await req.json();

    console.log(`[Chat API] Received ${messages.length} messages`);
    console.log("[Chat API] Last message:", messages[messages.length - 1]);

    console.log("[Chat API] Calling streamText with model: openai/gpt-4o");

    const result = streamText({
      model: openrouter("openai/gpt-4o"),
      system: `You are a helpful theme design assistant. You help users create beautiful, accessible color themes for their applications.

When users describe a theme they want (e.g., "dark theme with purple accents", "warm sunset theme"), you should:
1. Create appropriate HSL color values that match their description
2. Ensure sufficient contrast between background and foreground colors (WCAG AA minimum)
3. Choose complementary accent colors
4. Suggest appropriate font stacks and typography settings
5. Call the applyTheme tool with your generated theme

HSL Format: All colors should be in the format "hue saturation% lightness%" (e.g., "220 70% 50%")

Tips:
- Dark themes: base_bg around 220 10% 5-15%, base_fg around 0 0% 95-100%
- Light themes: base_bg around 0 0% 95-100%, base_fg around 220 10% 5-15%
- Primary colors: Use distinctive hues that stand out
- Maintain color harmony by using related hues or complementary colors

Visible assistant text should stay minimal: give a short acknowledgment (under 25 words) and avoid listing the palette. Do not include long explanations or "Here's the theme I've designed"—let the applyTheme tool output speak for itself.`,
      messages: convertToModelMessages(messages),
      tools: {
        applyTheme: tool({
          description:
            "Apply a generated theme to the user's application. Call this after generating theme colors based on the user's request.",
          inputSchema: themeGenerationSchema,
          execute: async (payload) => {
            console.log("[Chat API] applyTheme tool called");
            console.log("[Chat API] Payload:", JSON.stringify(payload, null, 2));

            // Parse the theme payload
            const theme = parseGeneratedTheme(payload);

            if (!theme) {
              console.log("[Chat API] Failed to parse theme");
              return {
                success: false,
                error: "Invalid theme data",
              };
            }

            console.log("[Chat API] Theme parsed successfully:", theme.name);

            // Return the theme data to be handled by the client
            return {
              success: true,
              theme,
            };
          },
        }),
      },
    });

    console.log("[Chat API] Streaming response...");
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[Chat API] Error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
