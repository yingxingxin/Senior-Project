'use client';

import { useState } from 'react';
import { useOnboarding } from '@/app/onboarding/_context/onboarding-context';
import type { AssistantPersona, PersonaOption } from '@/src/lib/constants';
import { SelectGrid } from '@/app/onboarding/_components/select-grid';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Stack, Inline } from '@/components/ui/spacing';
import { Muted } from '@/components/ui/typography';

const personaIcons = {
  calm: '🧘',
  kind: '💝',
  direct: '⚡',
} as const;

export function PersonaSelectionForm({
  options
}: {
  options: ReadonlyArray<PersonaOption>;
}) {
  const { selectPersona, persona, pending, error, setError } = useOnboarding();
  const [localPersona, setLocalPersona] = useState<AssistantPersona | null>(persona);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPersona) {
      setError('Please select a persona to continue');
      return;
    }
    setError(null);
    await selectPersona(localPersona);
  };

  const items = options.map(option => ({
    id: option.id,
    title: option.title,
    subtitle: option.subtitle,
    icon: personaIcons[option.id],
    renderBody: (
      <ul className="space-y-3">
        {option.highlights.map((highlight, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="mt-1 size-1.5 rounded-full bg-current opacity-60" />
            <Muted variant="tiny" as="span">{highlight}</Muted>
          </li>
        ))}
      </ul>
    ),
  }));

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="default">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <SelectGrid
          value={localPersona}
          onChange={(id) => { setError(null); setLocalPersona(id as AssistantPersona); }}
          items={items}
          cols={3}
          disabled={pending}
        />

        <Inline gap="default" align="center" className="justify-center">
          <Button type="submit" disabled={!localPersona || pending} size="lg" className="min-w-48">
            {pending ? 'Saving...' : 'Continue to Tour'}
          </Button>
        </Inline>
      </Stack>
    </form>
  );
}
