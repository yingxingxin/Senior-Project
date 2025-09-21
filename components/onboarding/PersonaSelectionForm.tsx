'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { selectAssistantPersonaAction } from '@/app/onboarding/actions';
import type { AssistantPersona, PersonaOption } from '@/src/lib/onboarding/fixtures';
import { cn } from '@/src/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
  },
  kind: {
    gradient: 'from-pink-500/15 via-rose-400/10 to-purple-500/15',
    borderColor: 'border-pink-300/40',
    selectedBorder: 'border-pink-400/60',
    glowColor: 'rgba(236, 72, 153, 0.3)',
    iconBg: 'bg-gradient-to-br from-pink-400/25 to-rose-500/20',
  },
  direct: {
    gradient: 'from-orange-500/15 via-amber-400/10 to-yellow-500/15',
    borderColor: 'border-amber-300/40',
    selectedBorder: 'border-amber-400/60',
    glowColor: 'rgba(251, 146, 60, 0.3)',
    iconBg: 'bg-gradient-to-br from-amber-400/25 to-orange-500/20',
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
    <div className="space-y-8">
      {error ? (
        <Alert variant="destructive" className="border-red-400/40 bg-red-500/10 text-red-100">
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
                        <h3 className="text-lg font-bold text-white">
                          {option.title}
                        </h3>
                      </div>
                      <p className="text-sm text-white/80">
                        {option.subtitle}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="inline-flex items-center rounded-full border border-cyan-200/50 bg-cyan-300/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-100">
                        Active
                      </span>
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
                        <span className="text-white/75 leading-relaxed">{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/40">
                      {option.id}
                    </span>
                    {!isSelected && (
                      <span className="text-xs text-white/60 transition-transform duration-300 group-hover:translate-x-1">
                        Select →
                      </span>
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
          <div className="overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-white/10 via-white/5 to-white/10 backdrop-blur-2xl shadow-2xl">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/20 px-6 py-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.25em] text-white/70">
                Live Preview
              </h3>
              <p className="mt-1 text-xs text-white/50">
                {activePreview ? personaLookup[activePreview]?.title : 'None'} Persona
              </p>
            </div>

            {/* Preview content */}
            <div className="p-6 space-y-4">
              {/* Sample message bubble */}
              <div className="relative">
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-sky-500/5 p-4">
                  <p className="text-sm italic text-white/60 mb-2">Your assistant says:</p>
                  <p className="text-base leading-relaxed text-white whitespace-pre-line">
                    {activePreviewCopy?.preview || 'Hover over a persona card to preview their communication style.'}
                  </p>
                </div>

                {/* Animated typing indicator */}
                {previewPersona && (
                  <div className="absolute -bottom-2 right-4 flex gap-1">
                    <span className="size-2 rounded-full bg-cyan-300/60 animate-bounce [animation-delay:-0.3s]" />
                    <span className="size-2 rounded-full bg-cyan-300/60 animate-bounce [animation-delay:-0.15s]" />
                    <span className="size-2 rounded-full bg-cyan-300/60 animate-bounce" />
                  </div>
                )}
              </div>

              {/* Additional preview examples if we have space */}
              <div className="space-y-2 pt-4 border-t border-white/10">
                <p className="text-xs uppercase tracking-wider text-white/40 mb-3">
                  Communication traits
                </p>
                {activePreviewCopy?.highlights.map((trait, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="size-5 rounded-full bg-gradient-to-br from-cyan-400/20 to-sky-500/10 grid place-items-center text-[10px] font-bold text-cyan-200">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-white/70">{trait}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer status */}
            <div className="border-t border-white/10 bg-black/20 px-6 py-3">
              <div className="flex items-center gap-2 text-xs">
                <span className={cn(
                  "size-2 rounded-full",
                  localPersona ? "bg-cyan-300" : "bg-white/30"
                )} />
                <span className="text-white/60">
                  {localPersona
                    ? `${personaLookup[localPersona]?.title} persona selected`
                    : 'Select a persona to continue'}
                </span>
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
          className="min-w-[200px] bg-gradient-to-r from-cyan-500 to-sky-500 text-white hover:from-cyan-600 hover:to-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}