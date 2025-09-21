'use client';

/* eslint-disable @next/next/no-img-element */

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';

import { selectAssistantGenderAction } from '@/app/onboarding/actions';
import type { AssistantOption } from '@/src/db/queries/onboarding';
import { cn } from '@/src/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AssistantSelectionFormProps {
  options: ReadonlyArray<AssistantOption>;
  selectedAssistantId: number | null;
}

export function AssistantSelectionForm({ options, selectedAssistantId }: AssistantSelectionFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [localSelection, setLocalSelection] = useState<number | null>(selectedAssistantId);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const assistantById = useMemo(() => {
    const map = new Map<number, AssistantOption>();
    for (const option of options) {
      map.set(option.id, option);
    }
    return map;
  }, [options]);

  const handleContinue = () => {
    if (!localSelection) {
      setError('Please select an assistant to continue');
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const result = await selectAssistantGenderAction(localSelection);
        router.push(result.nextHref);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save selection');
      }
    });
  };

  return (
    <div className="space-y-6">
      {error ? (
        <Alert variant="destructive" className="border-red-400/40 bg-red-500/10 text-red-100">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <RadioGroup
        value={localSelection?.toString()}
        onValueChange={(value) => setLocalSelection(Number(value))}
        disabled={pending}
        className="grid gap-6 lg:grid-cols-3"
      >
        {options.map((option) => {
          const isSelected = localSelection === option.id;
          const isHovered = hoveredCard === option.id;
          const fallbackInitial = option.name?.at(0)?.toUpperCase() ?? '?';

          // Define personality-based color schemes
          const colorScheme = {
            feminine: {
              gradient: 'from-pink-500/20 via-rose-400/15 to-violet-500/20',
              borderHover: 'hover:border-pink-300/50',
              glowColor: 'rgba(236, 72, 153, 0.35)',
              accentBg: 'bg-gradient-to-br from-pink-400/30 to-rose-500/25',
            },
            masculine: {
              gradient: 'from-blue-500/20 via-indigo-400/15 to-cyan-500/20',
              borderHover: 'hover:border-blue-300/50',
              glowColor: 'rgba(59, 130, 246, 0.35)',
              accentBg: 'bg-gradient-to-br from-blue-400/30 to-indigo-500/25',
            },
            androgynous: {
              gradient: 'from-emerald-500/20 via-teal-400/15 to-cyan-500/20',
              borderHover: 'hover:border-emerald-300/50',
              glowColor: 'rgba(16, 185, 129, 0.35)',
              accentBg: 'bg-gradient-to-br from-emerald-400/30 to-teal-500/25',
            },
          };

          const scheme = colorScheme[option.gender as keyof typeof colorScheme] || colorScheme.androgynous;

          return (
            <div key={option.id} className="relative h-full">
              <RadioGroupItem value={option.id.toString()} id={`assistant-${option.id}`} className="sr-only absolute" />
              <label
                htmlFor={`assistant-${option.id}`}
                onMouseEnter={() => setHoveredCard(option.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={cn(
                  'group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-3xl border bg-gradient-to-br text-left transition-all duration-500 cursor-pointer',
                  isSelected
                    ? 'border-cyan-300/60 shadow-[var(--onboarding-card-selected-glow)] scale-[1.02]'
                    : `border-white/15 ${scheme.borderHover} hover:scale-[1.01] hover:shadow-2xl`,
                  pending && 'opacity-70 pointer-events-none',
                  scheme.gradient,
                )}
                style={{
                  boxShadow: isHovered && !isSelected
                    ? `0 20px 60px ${scheme.glowColor}`
                    : undefined,
                }}
              >
              {/* Enhanced gradient overlay */}
              <div
                className="absolute inset-0 opacity-60 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 30% 0%, ${scheme.glowColor}, transparent 60%)`
                }}
                aria-hidden
              />

              {/* Card content */}
              <div className="relative flex h-full flex-col p-6">
                {/* Avatar section - now larger and at the top */}
                <div className="mb-5 flex justify-center">
                  <div className={cn(
                    "relative grid size-24 place-items-center overflow-hidden rounded-2xl border border-white/20 shadow-2xl transition-all duration-300",
                    scheme.accentBg,
                    "group-hover:scale-110 group-hover:border-white/30"
                  )}>
                    {option.avatarUrl ? (
                      <img
                        src={option.avatarUrl}
                        alt={`${option.name} avatar`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-white">{fallbackInitial}</span>
                    )}

                    {/* Glow effect on avatar */}
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent 70%)'
                      }}
                    />
                  </div>
                </div>

                {/* Name and tagline */}
                <div className="mb-4 text-center">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {option.name}
                  </h3>
                  {option.tagline && (
                    <p className="text-sm text-white/80 italic">
                      {option.tagline}
                    </p>
                  )}
                </div>

                {/* Description */}
                {option.description && (
                  <p className="flex-1 text-sm leading-relaxed text-white/75 text-center">
                    {option.description}
                  </p>
                )}

                {/* Footer section */}
                <div className="mt-6 flex flex-col gap-3">
                  {/* Gender label */}
                  <div className="flex justify-center">
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-black/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                      {option.gender || 'Custom'}
                    </span>
                  </div>

                  {/* Selection button/status */}
                  <div className="relative">
                    {isSelected ? (
                      <div className="flex items-center justify-center gap-2 rounded-xl border border-cyan-300/50 bg-cyan-400/20 py-2.5 px-4">
                        <span className="size-2 rounded-full bg-cyan-300 animate-pulse" />
                        <span className="text-sm font-semibold text-cyan-100">
                          Selected
                        </span>
                      </div>
                    ) : (
                      <div className={cn(
                        "flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 py-2.5 px-4",
                        "transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/10"
                      )}>
                        <span className="text-sm font-medium text-white/80">
                          Choose {option.name}
                        </span>
                        <span className="text-white/60 transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </label>
            </div>
          );
        })}
      </RadioGroup>

      {/* Status and Continue button */}
      <div className="mt-8 flex flex-col items-center gap-4">
        {localSelection && (
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-sm">
            <span className="size-2 rounded-full bg-cyan-300" />
            <span className="text-white/80">
              {assistantById.get(localSelection)?.name ?? 'Assistant'} selected
            </span>
          </div>
        )}

        <Button
          onClick={handleContinue}
          disabled={!localSelection || pending}
          size="lg"
          className="min-w-[200px] bg-gradient-to-r from-cyan-500 to-sky-500 text-white hover:from-cyan-600 hover:to-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : (
            'Continue to Personality'
          )}
        </Button>

        {!localSelection && (
          <p className="text-sm text-white/60">
            Select an assistant to continue
          </p>
        )}
      </div>
    </div>
  );
}