"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Stack, Inline } from "@/components/ui/spacing";
import { Muted } from "@/components/ui/typography";
import { SelectGrid } from "@/app/onboarding/_components/select-grid";
import type { AssistantPersona, PersonaOption } from "@/src/lib/constants";

const personaIcons = {
  calm: "🧘",
  kind: "💝",
  direct: "⚡",
} as const;

interface PersonalitySelectorProps {
  personas: ReadonlyArray<PersonaOption>;
  value: AssistantPersona | null;
  onChange: (persona: AssistantPersona) => void;
  disabled?: boolean;
}

export function PersonalitySelector({
  personas,
  value,
  onChange,
  disabled = false
}: PersonalitySelectorProps) {

  const items = personas.map((option) => ({
    id: option.id,
    title: option.title,
    subtitle: option.subtitle,
    icon: personaIcons[option.id],
    renderBody: (
      <Stack gap="tight" as="ul">
        {option.highlights.map((highlight, idx) => (
          <Inline gap="tight" align="start" as="li" key={idx}>
            <span className="mt-1 size-1.5 rounded-full bg-current opacity-60" />
            <Muted variant="tiny" as="span">{highlight}</Muted>
          </Inline>
        ))}
      </Stack>
    ),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assistant Personality</CardTitle>
        <CardDescription>
          Adjust your assistant's teaching style to match your preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Persona Grid */}
        <SelectGrid
          value={value}
          onChange={(id) => onChange(id as AssistantPersona)}
          items={items}
          cols={3}
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}
