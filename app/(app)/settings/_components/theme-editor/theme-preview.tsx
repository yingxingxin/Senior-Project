import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Body, Muted } from "@/components/ui/typography";
import type { AdvancedTheme } from "./types";
import { Check, Sparkles } from "lucide-react";

/**
 * Simple preview for AI-generated themes.
 * Mirrors the compact style of hand-crafted theme cards.
 */

interface ThemePreviewProps {
  theme: Partial<AdvancedTheme>;
  onApply?: (theme: Partial<AdvancedTheme>) => void;
}

export function ThemePreview({ theme, onApply }: ThemePreviewProps) {
  const swatches = [
    { label: "Primary", value: theme.primary },
    { label: "Secondary", value: theme.secondary },
    { label: "Accent", value: theme.accent },
    { label: "Background", value: theme.base_bg },
  ].filter((swatch) => swatch.value);

  return (
    <Card className="overflow-hidden border border-border/70">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <Body className="font-semibold">
                {theme.name || "Generated Theme"}
              </Body>
            </div>
            <Muted variant="small">
              {theme.font || theme.font_sans
                ? `Font: ${theme.font ?? theme.font_sans}`
                : "Sans/serif picks included"}
            </Muted>
          </div>
          {onApply && (
            <Button size="sm" onClick={() => onApply(theme)}>
              <Check className="h-4 w-4 mr-1" />
              Apply
            </Button>
          )}
        </div>

        {swatches.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {swatches.map((swatch) => (
              <div
                key={swatch.label}
                className="rounded-md border border-border/80 p-2"
              >
                <div
                  className="h-10 w-full rounded-sm border border-border"
                  style={{ backgroundColor: `hsl(${swatch.value})` }}
                />
                <div className="mt-2">
                  <Body variant="small" className="font-medium">
                    {swatch.label}
                  </Body>
                  <Muted variant="small" className="font-mono text-[11px]">
                    {swatch.value}
                  </Muted>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-3 text-xs">
          {theme.radius && (
            <Muted variant="small">
              Radius: <span className="text-foreground">{theme.radius}</span>
            </Muted>
          )}
          {theme.shadow_strength && (
            <Muted variant="small">
              Shadow:{" "}
              <span className="text-foreground">{theme.shadow_strength}</span>
            </Muted>
          )}
          {theme.spacing_scale !== undefined && (
            <Muted variant="small">
              Spacing:{" "}
              <span className="text-foreground">{theme.spacing_scale}x</span>
            </Muted>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
