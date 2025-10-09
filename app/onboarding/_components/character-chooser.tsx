'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heading, Muted, Caption } from '@/components/ui/typography';
import { Stack } from '@/components/ui/spacing';
import { cn } from '@/src/lib/utils';
import type { AssistantOption } from '@/app/onboarding/_lib/guard';

type CharacterChooserProps = {
  items: ReadonlyArray<AssistantOption>;
  value: number | null;
  onChange: (id: number) => void;
  disabled?: boolean;
};

export function CharacterChooser({ items, value, onChange, disabled }: CharacterChooserProps) {
  const [selected, setSelected] = useState<number | null>(value ?? items[0]?.id ?? null);

  useEffect(() => {
    if (value !== null) {
      setSelected(value);
    }
  }, [value]);

  const handleSelect = (id: number) => {
    if (disabled) return;
    setSelected(id);
    onChange(id);
  };

  return (
    <RadioGroup
      value={selected === null ? '' : String(selected)}
      onValueChange={(next) => {
        if (!next) return;
        handleSelect(Number(next));
      }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      aria-label="Choose your assistant"
    >
      {items.map((item) => {
        const isSelected = item.id === selected;
        const inputId = `assistant-${item.id}`;

        return (
          <label
            key={item.id}
            htmlFor={inputId}
            className={cn(
              'group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/40 focus-within:border-primary',
              isSelected && 'border-primary ring-2 ring-primary/20 shadow-sm',
              disabled && 'pointer-events-none opacity-60'
            )}
          >
            <RadioGroupItem id={inputId} value={String(item.id)} className="sr-only" disabled={disabled} />

            <div className="relative h-64 sm:h-72 bg-muted">
              {item.avatarUrl && (
                <Image
                  src={item.avatarUrl}
                  alt={`${item.name} assistant artwork`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-6"
                />
              )}
            </div>

            <Stack gap="tight" className="px-4 py-4">
              <Caption variant="uppercase" className="text-muted-foreground">
                {item.gender ?? 'androgynous'}
              </Caption>
              <Heading level={4} as="div">
                {item.name}
              </Heading>
              {item.tagline && (
                <Muted variant="small" className="line-clamp-2 text-muted-foreground">
                  {item.tagline}
                </Muted>
              )}
              <Caption
                variant="default"
                className={cn('mt-2 text-muted-foreground', isSelected && 'text-primary')}
              >
                {isSelected ? 'Selected' : 'Tap to select'}
              </Caption>
            </Stack>
          </label>
        );
      })}
    </RadioGroup>
  );
}
