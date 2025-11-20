"use client";

import { useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Body, Muted } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Stack, Grid, Inline } from "@/components/ui/spacing";
import { ErrorAlert } from "@/components/ui/error-alert";
import { Sparkles, Send } from "lucide-react";
import { parseGeneratedTheme } from "../../_lib/theme-generator-schema";
import type { AdvancedTheme } from "./types";
import { ThemePreview } from "./theme-preview";

/**
 * Chat Component - AI Theme Generator
 *
 * Chat interface powered by the Vercel AI SDK.
 * Users describe their desired theme in natural language,
 * and the AI streams a response while calling the applyTheme tool
 * with the generated theme payload.
 *
 * Design System Compliance:
 * - Uses Stack for vertical spacing (no space-y-*)
 * - Uses Typography components (Body, Muted) instead of raw text
 * - Uses semantic colors (bg-card, text-foreground, border-border)
 * - Uses Grid and Inline for layout structure
 */

interface ChatProps {
  onThemeGenerated: (theme: Partial<AdvancedTheme>) => void;
}

const EXAMPLE_PROMPTS = [
  "Create a dark theme with purple accents",
  "Make a warm sunset theme with orange and pink",
  "Design a professional blue theme for productivity",
  "Build a nature-inspired green theme",
];

const INITIAL_ASSISTANT_MESSAGE: UIMessage = {
  id: "welcome-theme-generator",
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "Hi! I'm your AI theme designer. Pick an example below or describe your own theme:",
    },
  ],
};

const THEME_TOOL_TYPE = "tool-applyTheme";

export function Chat({ onThemeGenerated }: ChatProps) {
  const [input, setInput] = useState("");

  const { messages, status, sendMessage, error, clearError } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    messages: [INITIAL_ASSISTANT_MESSAGE],
  });

  const isGenerating = status === "submitted" || status === "streaming";

  // Log messages and status changes
  useEffect(() => {
    console.log(`[Chat] Messages updated: ${messages.length} messages`);
    console.log("[Chat] Status:", status);
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log("[Chat] Last message:", {
        id: lastMessage.id,
        role: lastMessage.role,
        partsCount: lastMessage.parts.length,
        partTypes: lastMessage.parts.map((p) =>
          typeof p === "object" && p !== null && "type" in p
            ? (p as { type?: string }).type
            : "unknown"
        ),
      });
    }
  }, [messages, status]);

  // Filter out system messages
  // Keep messages with text or tool parts
  const visibleMessages = useMemo(
    () =>
      messages.filter((message) => {
        if (message.role === "system") return false;

        // Show if message has text content
        const hasText = message.parts.some(
          (part) =>
            typeof part === "object" &&
            part !== null &&
            part.type === "text" &&
            (part as { text?: string }).text
        );

        // Show if message has tool parts
        const hasTools = message.parts.some(
          (part) =>
            typeof part === "object" &&
            part !== null &&
            "type" in part &&
            (part as { type?: string }).type?.startsWith("tool-")
        );

        return hasText || hasTools;
      }),
    [messages]
  );

  // Log visible messages
  useEffect(() => {
    console.log(`[Chat] Visible messages: ${visibleMessages.length}`);
  }, [visibleMessages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) {
      console.log("[Chat] Cannot send: input empty or generating");
      return;
    }

    // Clear any previous errors
    if (error) {
      clearError();
    }

    const text = input.trim();
    console.log("[Chat] Sending message:", text);
    setInput("");

    try {
      await sendMessage({ text });
      console.log("[Chat] Message sent successfully");
    } catch (err) {
      console.error("[Chat] Failed to send message:", err);
    }
  };

  const handleExampleClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    // Flex Layout: Messages (scrollable) → Input (fixed)
    // Using raw flex classes instead of Stack to ensure proper scroll behavior
    // - Messages area fills remaining space (flex-1) with independent scroll
    // - Input box always visible at bottom (no sticky positioning needed)
    <div className="flex flex-col h-full pt-6">
      {/* Chat Messages - Scrollable */}
      <div className="flex-1 overflow-y-auto rounded-lg border border-border p-4 mb-4">
        <div className="space-y-4">
          {visibleMessages.map((message) => {
            const isUser = message.role === "user";
            const isWelcomeMessage = message.id === "welcome-theme-generator";

            console.log(
              `[Chat] Rendering message ${message.id}:`,
              message.role,
              `(${message.parts.length} parts)`
            );

            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div className={isWelcomeMessage ? "w-full" : "max-w-[80%]"}>
                  <div className="space-y-3">
                    {message.parts.map((part, index) => {
                      const partType =
                        typeof part === "object" &&
                        part !== null &&
                        "type" in part
                          ? (part as { type?: string }).type
                          : "unknown";

                      console.log(
                        `[Chat] Rendering part ${index}:`,
                        partType
                      );

                      // Render text parts
                      if (part.type === "text") {
                        return (
                          <div
                            key={`${message.id}-text-${index}`}
                            className={`rounded-lg px-4 py-3 ${
                              isUser
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <Body
                              variant="small"
                              className="whitespace-pre-wrap"
                            >
                              {part.text}
                            </Body>

                            {/* Example Prompt Cards - Only in welcome message */}
                            {isWelcomeMessage && (
                              <Grid cols={2} gap="tight" className="mt-4">
                                {EXAMPLE_PROMPTS.map((prompt) => (
                                  <Card
                                    key={prompt}
                                    className="cursor-pointer hover:border-primary hover:shadow-md transition-all group"
                                    onClick={() => handleExampleClick(prompt)}
                                  >
                                    <CardContent className="p-4">
                                      <Inline gap="tight" align="start">
                                        <Sparkles className="h-4 w-4 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                                        <Body variant="small" className="flex-1">
                                          {prompt}
                                        </Body>
                                      </Inline>
                                    </CardContent>
                                  </Card>
                                ))}
                              </Grid>
                            )}
                          </div>
                        );
                      }

                      // Render tool-applyTheme parts
                      if (part.type === THEME_TOOL_TYPE) {
                        const toolPart = part as ThemeToolPart;

                        switch (toolPart.state) {
                          case "input-available":
                            return (
                              <div
                                key={`${message.id}-tool-${index}`}
                                className="rounded-lg bg-muted px-4 py-3"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
                                    <div
                                      className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                                      style={{ animationDelay: "0.1s" }}
                                    />
                                    <div
                                      className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                                      style={{ animationDelay: "0.2s" }}
                                    />
                                  </div>
                                  <Muted variant="small">
                                    Generating theme...
                                  </Muted>
                                </div>
                              </div>
                            );

                          case "output-available": {
                            const theme = parseGeneratedTheme(toolPart.output);
                            if (!theme) {
                              return (
                                <ErrorAlert
                                  key={`${message.id}-tool-${index}`}
                                  message="Failed to parse generated theme"
                                />
                              );
                            }

                            return (
                              <ThemePreview
                                key={`${message.id}-tool-${index}`}
                                theme={theme}
                                onApply={onThemeGenerated}
                              />
                            );
                          }

                          case "output-error":
                            return (
                              <ErrorAlert
                                key={`${message.id}-tool-${index}`}
                                message={
                                  toolPart.errorText ||
                                  "Failed to generate theme"
                                }
                              />
                            );

                          default:
                            return null;
                        }
                      }

                      return null;
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading State - Animated dots */}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg bg-muted px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-primary/60 animate-bounce" />
                    <div
                      className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <Muted variant="small">Generating theme...</Muted>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Box - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-border pt-4">
        <div className="flex gap-2">
          <Input
            placeholder="Describe your theme..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isGenerating}
          />
          <Button
            onClick={handleSend}
            disabled={isGenerating || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorAlert
            message={error.message || "Something went wrong. Please try again."}
            onDismiss={clearError}
            className="mt-3"
          />
        )}
      </div>
    </div>
  );
}

/**
 * Type definition for tool parts in UIMessage
 * Used to detect and extract applyTheme tool outputs
 */
type ThemeToolPart = {
  type: string;
  toolCallId?: string;
  state?: string;
  output?: unknown;
  errorText?: string;
};
