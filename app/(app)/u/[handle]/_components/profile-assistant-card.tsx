"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Sparkles } from "lucide-react";
import {
  QUESTION_LABELS,
  type ProfileQuestionType,
} from "@/src/lib/ai/profileAssistant";
import { cn } from "@/lib/utils";

interface ProfileAssistantCardProps {
  handle: string;
  assistantName?: string | null;
  assistantAvatarUrl?: string | null;
  assistantTagline?: string | null;
  accentColor?: string;
}

interface AssistantResponse {
  questionType: ProfileQuestionType;
  answer: string;
  assistantName: string;
}

export function ProfileAssistantCard({
  handle,
  assistantName,
  assistantAvatarUrl,
  assistantTagline,
  accentColor,
}: ProfileAssistantCardProps) {
  const [selectedQuestion, setSelectedQuestion] =
    React.useState<ProfileQuestionType | null>(null);
  const [response, setResponse] = React.useState<AssistantResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleQuestionClick = async (questionType: ProfileQuestionType) => {
    if (isLoading) return;

    setSelectedQuestion(questionType);
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/profile/${handle}/assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionType }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to get response");
      }

      const data = (await res.json()) as AssistantResponse;
      setResponse(data);
    } catch (err) {
      console.error("[Profile Assistant] Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get assistant response. Please try again."
      );
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = assistantName || "Assistant";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={assistantAvatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle
              className="text-lg"
              style={accentColor ? { color: accentColor } : undefined}
            >
              Meet {displayName}
            </CardTitle>
            {assistantTagline && (
              <p className="text-sm text-muted-foreground mt-1">
                {assistantTagline}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            Ask {displayName} about this user:
          </p>

          {/* Question Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(QUESTION_LABELS).map(([questionType, label]) => (
              <Button
                key={questionType}
                variant={
                  selectedQuestion === questionType ? "default" : "outline"
                }
                onClick={() => handleQuestionClick(questionType as ProfileQuestionType)}
                disabled={isLoading}
                className="justify-start text-left h-auto py-2.5 px-3"
                style={
                  selectedQuestion === questionType && accentColor
                    ? {
                        backgroundColor: accentColor,
                        borderColor: accentColor,
                        color: "white",
                      }
                    : undefined
                }
              >
                {isLoading && selectedQuestion === questionType ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Response Display */}
        {response && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage
                  src={assistantAvatarUrl || undefined}
                  alt={response.assistantName}
                />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-xs text-white">
                  {response.assistantName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {response.answer}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Powered by AI */}
        {(response || error) && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Powered by AI
          </p>
        )}
      </CardContent>
    </Card>
  );
}

