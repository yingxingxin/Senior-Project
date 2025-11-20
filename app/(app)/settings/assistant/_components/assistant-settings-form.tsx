"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Stack, Inline } from "@/components/ui/spacing";
import { Button } from "@/components/ui/button";
import { AssistantSelector } from "./assistant-selector";
import { PersonalitySelector } from "./personality-selector";
import { updateAssistantGenderAction, updateAssistantPersonalityAction } from "../actions";
import type { AssistantPersona, PersonaOption } from "@/src/lib/constants";

interface Assistant {
  id: number;
  name: string;
  slug: string;
  gender: string | null;
  avatarUrl: string | null;
  tagline: string | null;
  description: string | null;
}

interface AssistantSettingsFormProps {
  assistants: Assistant[];
  currentAssistantId: number | null;
  currentPersona: AssistantPersona | null;
  personas: ReadonlyArray<PersonaOption>;
}

export function AssistantSettingsForm({
  assistants,
  currentAssistantId,
  currentPersona,
  personas,
}: AssistantSettingsFormProps) {
  const [selectedAssistantId, setSelectedAssistantId] = useState(currentAssistantId);
  const [selectedPersona, setSelectedPersona] = useState(currentPersona);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const assistantChanged = selectedAssistantId !== currentAssistantId;
  const personaChanged = selectedPersona !== currentPersona;
  const hasChanges = assistantChanged || personaChanged;

  const handleCancel = () => {
    setSelectedAssistantId(currentAssistantId);
    setSelectedPersona(currentPersona);
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    startTransition(async () => {
      try {
        // Update assistant if changed
        if (assistantChanged && selectedAssistantId) {
          await updateAssistantGenderAction(selectedAssistantId);
        }

        // Update personality if changed
        if (personaChanged && selectedPersona) {
          await updateAssistantPersonalityAction(selectedPersona);
        }

        router.refresh();
      } catch (error) {
        console.error("Failed to update settings:", error);
        alert(error instanceof Error ? error.message : "Failed to update settings");
      }
    });
  };

  return (
    <Stack gap="loose">
      {/* Assistant Selection */}
      <AssistantSelector
        assistants={assistants}
        value={selectedAssistantId}
        onChange={setSelectedAssistantId}
        disabled={isPending}
      />

      {/* Personality Selection */}
      <PersonalitySelector
        personas={personas}
        value={selectedPersona}
        onChange={setSelectedPersona}
        disabled={isPending}
      />

      {/* Unified Action Buttons */}
      {hasChanges && (
        <Inline gap="default" align="center" className="justify-end pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </Inline>
      )}
    </Stack>
  );
}
