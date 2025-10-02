'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { selectAssistantPersonaAction } from '@/app/onboarding/actions';
import type { AssistantPersona, PersonaOption } from '@/app/onboarding/_lib/fixtures';
import { cn } from '@/src/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Heading, Muted, Caption, Body } from '@/components/ui/typography';
import { Stack } from '@/components/ui/spacing';

interface PersonaSelectionFormProps {
  options: ReadonlyArray<PersonaOption>;
  selectedPersona: AssistantPersona | null;
}

// Icons/emojis for each persona type
const personaIcons = {
  calm: '🧘',
  kind: '💝',
  direct: '⚡',
} as const;

// Color schemes for each persona
const personaSchemes = {
  calm: {
    gradient: 'from-blue-500/15 via-cyan-400/10 to-sky-500/15',
    borderColor: 'border-sky-300/40',
    selectedBorder: 'border-sky-400/60',
    glowColor: 'rgba(56, 189, 248, 0.3)',
    iconBg: 'bg-gradient-to-br from-sky-400/25 to-blue-500/20',
    activeBadge: 'border-sky-500/30 bg-sky-500/20 text-sky-700 dark:border-sky-400/40 dark:bg-sky-400/20 dark:text-sky-200',
  },
  kind: {
    gradient: 'from-pink-500/15 via-rose-400/10 to-purple-500/15',
    borderColor: 'border-pink-300/40',
    selectedBorder: 'border-pink-400/60',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    iconBg: 'bg-gradient-to-br from-pink-400/25 to-rose-500/20',
    activeBadge: 'border-pink-500/30 bg-pink-500/20 text-pink-700 dark:border-pink-400/40 dark:bg-pink-400/20 dark:text-pink-200',
  },
  direct: {
    gradient: 'from-orange-500/15 via-amber-400/10 to-yellow-500/15',
    borderColor: 'border-amber-300/40',
    selectedBorder: 'border-amber-400/60',
    glowColor: 'rgba(251, 146, 60, 0.3)',
    iconBg: 'bg-gradient-to-br from-amber-400/25 to-orange-500/20',
    activeBadge: 'border-amber-500/30 bg-amber-500/20 text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/20 dark:text-amber-200',
  },
} as const;

export function PersonaSelectionForm({ options, selectedPersona }: PersonaSelectionFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [localPersona, setLocalPersona] = useState<AssistantPersona | null>(selectedPersona);
  const [previewPersona, setPreviewPersona] = useState<AssistantPersona | null>(selectedPersona);
  const [error, setError] = useState<string | null>(null);

  const activePreview = previewPersona ?? localPersona ?? options[0]?.id ?? null;
  const activePreviewCopy = options.find((option) => option.id === activePreview);
  const personaLookup = useMemo(() => Object.fromEntries(options.map((option) => [option.id, option])), [options]);

  const handleContinue = () => {
    if (!localPersona) {
      setError('Please select a persona to continue');
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const result = await selectAssistantPersonaAction(localPersona);
        router.push(result.nextHref);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save persona');
      }
    });
  };

  return (
    <Stack gap="loose">
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {/* Main content area */}
      <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
        {/* Persona cards */}
        <RadioGroup
          value={localPersona || ''}
          onValueChange={(value) => setLocalPersona(value as AssistantPersona)}
          disabled={pending}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {options.map((option) => {
            const isSelected = localPersona === option.id;
            const isPreviewing = previewPersona === option.id;
            const scheme = personaSchemes[option.id];
            const icon = personaIcons[option.id];

            return (
              <div key={option.id} className="relative">
                <RadioGroupItem value={option.id} id={`persona-${option.id}`} className="sr-only absolute" />
                <label
                  htmlFor={`persona-${option.id}`}
                  onMouseEnter={() => setPreviewPersona(option.id)}
                  onFocus={() => setPreviewPersona(option.id)}
                  onMouseLeave={() => setPreviewPersona(null)}
                  onBlur={() => setPreviewPersona(null)}
                  className={cn(
                    'cursor-pointer',
                  'group relative flex h-full min-h-[240px] flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-5 text-left transition-all duration-300',
                  scheme.gradient,
                  isSelected
                    ? `${scheme.selectedBorder} shadow-2xl scale-[1.02]`
                    : `${scheme.borderColor} hover:scale-[1.01] hover:shadow-xl`,
                  pending && 'opacity-70 pointer-events-none',
                )}
                style={{
                  boxShadow: (isPreviewing || isSelected)
                    ? `0 20px 50px ${scheme.glowColor}`
                    : undefined,
                }}
              >
                {/* Gradient overlay on hover */}
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 30% 0%, ${scheme.glowColor}, transparent 70%)`
                  }}
                  aria-hidden
                />

                <div className="relative flex flex-1 flex-col">
                  {/* Header with icon */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <span className={cn(
                          "inline-flex size-10 items-center justify-center rounded-xl border border-white/20 text-xl transition-transform duration-300",
                          scheme.iconBg,
                          "group-hover:scale-110"
                        )}>
                          {icon}
                        </span>
                        <Heading level={5}>
                          {option.title}
                        </Heading>
                      </div>
                      <Muted variant="small">
                        {option.subtitle}
                      </Muted>
                    </div>

                    {isSelected && (
                      <Caption variant="badge" className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5",
                        scheme.activeBadge
                      )}>
                        Active
                      </Caption>
                    )}
                  </div>

                  {/* Highlights list */}
                  <ul className="flex-1 space-y-2.5 text-xs">
                    {option.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span
                          className="mt-1 size-1.5 rounded-full opacity-80"
                          style={{ backgroundColor: scheme.glowColor }}
                          aria-hidden
                        />
                        <Muted variant="tiny" as="span" className="leading-relaxed">{highlight}</Muted>
                      </li>
                    ))}
                  </ul>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between">
                    <Caption variant="badge" className="text-muted-foreground">
                      {option.id}
                    </Caption>
                    {!isSelected && (
                      <Muted variant="tiny" as="span" className="transition-transform duration-300 group-hover:translate-x-1">
                        Select →
                      </Muted>
                    )}
                  </div>
                </div>
                </label>
              </div>
            );
          })}
        </RadioGroup>

        {/* Enhanced preview panel */}
        <aside className="sticky top-8 h-fit">
          <div className="overflow-hidden rounded-3xl border border-border bg-card backdrop-blur-2xl shadow-2xl">
            {/* Header */}
            <div className="border-b border-border bg-muted/20 px-6 py-4">
              <Caption variant="uppercase">
                Live Preview
              </Caption>
              <Muted variant="tiny" as="p" className="mt-1">
                {previewPersona ? (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                      Previewing: {personaLookup[previewPersona]?.title}
                    </span>
                  </>
                ) : localPersona ? (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <span className="size-2 rounded-full bg-primary" />
                      Selected: {personaLookup[localPersona]?.title}
                    </span>
                  </>
                ) : (
                  'Hover to preview personas'
                )}
              </Muted>
            </div>

            {/* Preview content */}
            <div className="p-6 space-y-4">
              {/* Sample message bubble */}
              <div className="relative">
                <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                  <Muted variant="small" as="p" className="italic mb-2">Your assistant says:</Muted>
                  <Body className="whitespace-pre-line">
                    {activePreviewCopy?.preview || 'Hover over a persona card to preview their communication style.'}
                  </Body>
                </div>
              </div>

              {/* Additional preview examples if we have space */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Caption variant="uppercase" className="mb-3">
                  Communication traits
                </Caption>
                {activePreviewCopy?.highlights.map((trait, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Caption variant="badge" className="size-5 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 grid place-items-center text-primary">
                      {idx + 1}
                    </Caption>
                    <Muted variant="tiny" as="span">{trait}</Muted>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer status */}
            <div className="border-t border-border bg-muted/20 px-6 py-3">
              <div className="space-y-2">
                {/* Main status */}
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "size-2 rounded-full",
                    localPersona ? "bg-primary" : "bg-muted"
                  )} />
                  <Muted variant="tiny" as="span" className="font-medium">
                    {localPersona
                      ? `✓ ${personaLookup[localPersona]?.title} will be saved`
                      : 'Select a persona to continue'}
                  </Muted>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Continue button */}
      <div className="flex justify-center">
        <Button
          onClick={handleContinue}
          disabled={!localPersona || pending}
          size="lg"
          className="min-w-[200px] bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            'Continue to Tour'
          )}
        </Button>
      </div>
    </Stack>
  );
}
