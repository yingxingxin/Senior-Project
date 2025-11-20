"use client";

import { useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ColorPicker } from "./color-picker";

/**
 * Color Picker Item Component
 *
 * Architecture Decision:
 * - Visual color picker (2D gradient + sliders) replaces HSL number inputs
 * - Click color swatch to toggle inline expansion below the item
 * - Accordion behavior: only one color picker expanded at a time (managed by parent)
 * - Auto-scrolls into view when expanded for better UX
 * - Displays color label, description, and HSL value
 *
 * HSL format: "220 70% 50%" (hue saturation lightness)
 * The ColorPicker internally converts to HEX for display but returns HSL for storage
 */

interface ColorPickerItemProps {
  colorKey: string;
  label: string;
  description: string;
  value: string; // HSL format: "220 70% 50%"
  onChange: (value: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export function ColorPickerItem({
  colorKey,
  label,
  description,
  value,
  onChange,
  isExpanded,
  onToggleExpanded,
}: ColorPickerItemProps) {
  const expandedSectionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll into view when expanded
  // Smooth scroll with small delay to ensure DOM has updated
  useEffect(() => {
    if (isExpanded && expandedSectionRef.current) {
      setTimeout(() => {
        expandedSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  }, [isExpanded]);

  return (
    <div className="border border-border">
      {/* Color Swatch Button */}
      <button
        className="w-full text-left p-3 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-3 group"
        type="button"
        onClick={onToggleExpanded}
        aria-expanded={isExpanded}
        aria-controls={`color-picker-${colorKey}`}
      >
        {/* Color Swatch */}
        <div
          className="h-10 w-10 rounded-md border-2 border-border flex-shrink-0 group-hover:border-primary transition-colors"
          style={{ backgroundColor: `hsl(${value})` }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
          <div className="text-xs text-muted-foreground font-mono mt-0.5">
            {value}
          </div>
        </div>
        {/* Chevron Indicator */}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {/* Inline Expandable Color Picker Section */}
      {isExpanded && (
        <div
          ref={expandedSectionRef}
          id={`color-picker-${colorKey}`}
          className="mt-2 p-4 ml-4 mr-4 md:ml-8 md:mr-8 rounded-lg bg-muted/30 transition-all"
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">{label}</h4>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>

            {/* Visual Color Picker */}
            <ColorPicker value={value} onChange={onChange} />
          </div>
        </div>
      )}
    </div>
  );
}
