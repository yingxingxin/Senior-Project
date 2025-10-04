'use client';

import { ReactNode } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Heading, Muted, Caption } from '@/components/ui/typography';
import { Stack } from '@/components/ui/spacing';
import { cn } from '@/src/lib/utils';

export type SelectItem<ID extends string | number = string> = {
  id: ID;
  title: string;
  subtitle?: string;
  renderBody?: ReactNode;
  icon?: string;
};

export function SelectGrid<ID extends string | number>({
  value,
  onChange,
  items,
  cols = 3,
  disabled = false,
  className,
}: {
  value: ID | null;
  onChange: (id: ID) => void;
  items: ReadonlyArray<SelectItem<ID>>;
  cols?: 2 | 3 | 4;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <RadioGroup
      value={value === null ? '' : String(value)}
      onValueChange={(v) => {
        const parsedValue = typeof items[0]?.id === 'number' ? Number(v) : v;
        onChange(parsedValue as ID);
      }}
      disabled={disabled}
      className={cn(
        'grid gap-4',
        cols === 2 && 'grid-cols-1 sm:grid-cols-2',
        cols === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        cols === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {items.map((item) => {
        const idStr = String(item.id);
        const inputId = `select-${idStr}`;
        const isSelected = value === item.id;

        return (
          <div key={idStr} className="relative">
            <RadioGroupItem
              id={inputId}
              className="sr-only"
              value={idStr}
              disabled={disabled}
            />
            <label
              htmlFor={inputId}
              className={cn(
                'group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card p-4 text-left transition',
                isSelected
                  ? 'border-primary ring-2 ring-primary/20 shadow-sm'
                  : 'hover:border-primary/40',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              <Stack gap="default" className="flex-1 h-full">
                <Stack gap="tight">
                  {item.icon && (
                    <span className="inline-flex size-10 items-center justify-center rounded-lg bg-muted text-lg">
                      {item.icon}
                    </span>
                  )}

                  <div>
                    <Heading level={5} as="div">{item.title}</Heading>
                    {item.subtitle && (
                      <Muted variant="small" className="mt-1">
                        {item.subtitle}
                      </Muted>
                    )}
                  </div>
                </Stack>

                {item.renderBody && (
                  <div className="text-sm text-muted-foreground">
                    {item.renderBody}
                  </div>
                )}

                <Caption
                  variant="default"
                  className={cn(
                    'mt-auto text-muted-foreground',
                    isSelected && 'text-primary',
                  )}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </Caption>
              </Stack>
            </label>
          </div>
        );
      })}
    </RadioGroup>
  );
}
