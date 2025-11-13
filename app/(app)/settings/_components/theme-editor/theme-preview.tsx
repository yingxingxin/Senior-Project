import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stack, Grid, Inline } from "@/components/ui/spacing";
import { Heading, Body, Muted } from "@/components/ui/typography";
import type { AdvancedTheme } from "./types";
import { Sparkles, Check } from "lucide-react";

/**
 * ThemePreview Component
 *
 * Displays a generated theme with visual preview of colors, typography, and settings.
 * Follows generative UI pattern from AI SDK - renders when tool-applyTheme completes.
 *
 * User can review the theme before applying it to the live preview.
 */

interface ThemePreviewProps {
  theme: Partial<AdvancedTheme>;
  onApply?: (theme: Partial<AdvancedTheme>) => void;
}

export function ThemePreview({ theme, onApply }: ThemePreviewProps) {
  // Color tokens to display
  const colors = [
    { key: "primary", label: "Primary", value: theme.primary },
    { key: "secondary", label: "Secondary", value: theme.secondary },
    { key: "accent", label: "Accent", value: theme.accent },
    { key: "base_bg", label: "Background", value: theme.base_bg },
    { key: "base_fg", label: "Foreground", value: theme.base_fg },
    { key: "card_bg", label: "Card", value: theme.card_bg },
    { key: "muted_bg", label: "Muted", value: theme.muted_bg },
    { key: "destructive_bg", label: "Destructive", value: theme.destructive_bg },
  ].filter((color) => color.value); // Only show defined colors

  return (
    <Card className="border-primary/20 bg-card/50">
      <CardContent className="p-6">
        <Stack gap="default">
          {/* Header */}
          <Inline gap="tight" align="center">
            <Sparkles className="h-5 w-5 text-primary" />
            <Heading level={3}>
              {theme.name || "Generated Theme"}
            </Heading>
          </Inline>

          {/* Color Swatches */}
          {colors.length > 0 && (
            <Stack gap="tight">
              <Muted variant="small">Colors</Muted>
              <Grid cols={4} gap="tight">
                {colors.map((color) => (
                  <div
                    key={color.key}
                    className="flex flex-col gap-2 rounded-lg border border-border p-3"
                  >
                    <div
                      className="h-12 w-full rounded border border-border"
                      style={{
                        backgroundColor: `hsl(${color.value})`,
                      }}
                    />
                    <div>
                      <Body variant="small" className="font-medium">
                        {color.label}
                      </Body>
                      <Muted variant="small" className="font-mono text-xs">
                        {color.value}
                      </Muted>
                    </div>
                  </div>
                ))}
              </Grid>
            </Stack>
          )}

          {/* Typography */}
          {(theme.font_sans || theme.font_serif || theme.font_mono) && (
            <Stack gap="tight">
              <Muted variant="small">Typography</Muted>
              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <Stack gap="tight">
                  {theme.font_sans && (
                    <div>
                      <Muted variant="small">Sans Serif</Muted>
                      <Body
                        variant="small"
                        className="font-mono text-muted-foreground"
                      >
                        {theme.font_sans}
                      </Body>
                    </div>
                  )}
                  {theme.font_serif && (
                    <div>
                      <Muted variant="small">Serif</Muted>
                      <Body
                        variant="small"
                        className="font-mono text-muted-foreground"
                      >
                        {theme.font_serif}
                      </Body>
                    </div>
                  )}
                  {theme.font_mono && (
                    <div>
                      <Muted variant="small">Monospace</Muted>
                      <Body
                        variant="small"
                        className="font-mono text-muted-foreground"
                      >
                        {theme.font_mono}
                      </Body>
                    </div>
                  )}
                </Stack>
              </div>
            </Stack>
          )}

          {/* Other Settings */}
          {(theme.radius ||
            theme.shadow_strength ||
            theme.spacing_scale !== undefined) && (
            <Stack gap="tight">
              <Muted variant="small">Settings</Muted>
              <div className="rounded-lg border border-border p-4 bg-muted/20">
                <Grid cols={3} gap="tight">
                  {theme.radius && (
                    <div>
                      <Muted variant="small">Radius</Muted>
                      <Body variant="small">{theme.radius}</Body>
                    </div>
                  )}
                  {theme.shadow_strength && (
                    <div>
                      <Muted variant="small">Shadows</Muted>
                      <Body variant="small">{theme.shadow_strength}</Body>
                    </div>
                  )}
                  {theme.spacing_scale !== undefined && (
                    <div>
                      <Muted variant="small">Spacing</Muted>
                      <Body variant="small">{theme.spacing_scale}x</Body>
                    </div>
                  )}
                </Grid>
              </div>
            </Stack>
          )}

          {/* Apply Button */}
          {onApply && (
            <Button onClick={() => onApply(theme)} className="w-full">
              <Check className="h-4 w-4 mr-2" />
              Apply Theme
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
