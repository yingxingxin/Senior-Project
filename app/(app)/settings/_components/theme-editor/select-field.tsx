"use client";

import { FieldGroup, FieldTitle, FieldDescription } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * SelectField Component
 *
 * Standardized dropdown/select field for theme editor settings.
 * Similar visual pattern to color-picker-item but uses Select for discrete options.
 *
 * Used for:
 * - Font selection (with font preview in options)
 * - Border radius selection
 * - Spacing scale selection
 * - Shadow strength selection
 */

interface SelectOption {
  value: string;
  label: string;
  style?: React.CSSProperties;
}

interface SelectFieldProps {
  label: string;
  description: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SelectField({
  label,
  description,
  value,
  options,
  onChange,
  placeholder = "Select an option",
}: SelectFieldProps) {
  return (
    <FieldGroup>
      <div>
        <FieldTitle>{label}</FieldTitle>
        <FieldDescription>{description}</FieldDescription>
      </div>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              style={option.style}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldGroup>
  );
}
