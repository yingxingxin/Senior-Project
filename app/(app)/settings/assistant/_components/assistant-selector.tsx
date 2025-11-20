"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Inline } from "@/components/ui/spacing";
import { Body, Muted } from "@/components/ui/typography";
import { Check } from "lucide-react";

interface Assistant {
  id: number;
  name: string;
  slug: string;
  gender: string | null;
  avatarUrl: string | null;
  tagline: string | null;
  description: string | null;
}

interface AssistantSelectorProps {
  assistants: Assistant[];
  value: number | null;
  onChange: (id: number) => void;
  disabled?: boolean;
}

export function AssistantSelector({
  assistants,
  value,
  onChange,
  disabled = false
}: AssistantSelectorProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assistant Appearance</CardTitle>
        <CardDescription>
          Choose the assistant that best fits your learning environment
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Assistant Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assistants.map((assistant) => {
            const isSelected = value === assistant.id;

            return (
              <button
                key={assistant.id}
                onClick={() => onChange(assistant.id)}
                disabled={disabled}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                )}

                <Inline gap="default" align="start">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={assistant.avatarUrl || undefined} alt={assistant.name} />
                    <AvatarFallback className="text-lg">
                      {assistant.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <Body className="font-semibold">{assistant.name}</Body>
                    {assistant.tagline && (
                      <Muted variant="small">{assistant.tagline}</Muted>
                    )}
                  </div>
                </Inline>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
