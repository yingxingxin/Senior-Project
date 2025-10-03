'use client';

import { useState } from 'react';
import { useOnboarding } from '@/app/onboarding/_context/onboarding-context';
import type { AssistantOption } from '@/app/onboarding/_lib/guard';
import { CharacterChooser } from '@/app/onboarding/_components/character-chooser';
import { Stack, Inline } from '@/components/ui/spacing';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function AssistantSelectionForm({
  options
}: {
  options: ReadonlyArray<AssistantOption>;
}) {
  const { selectAssistant, assistantId, pending, error, setError } = useOnboarding();
  const [localSelection, setLocalSelection] = useState<number | null>(assistantId);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localSelection) {
      setError('Please select an assistant to continue');
      return;
    }
    setError(null);
    await selectAssistant(localSelection);
  };

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="default">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <CharacterChooser
          items={options}
          value={localSelection}
          onChange={(id) => { setError(null); setLocalSelection(id); }}
          disabled={pending}
        />

        <Inline gap="default" align="center" className="justify-center">
          <Button type="submit" disabled={!localSelection || pending} size="lg" className="min-w-48">
            {pending ? 'Saving...' : 'Continue'}
          </Button>
        </Inline>
      </Stack>
    </form>
  );
}
