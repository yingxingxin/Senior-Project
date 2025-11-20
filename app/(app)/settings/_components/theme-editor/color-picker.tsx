"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Color from "color";
import { Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/**
 * ColorPicker Component
 *
 * Architecture Decision:
 * - Visual color picker matching the design:
 *   1. 2D saturation/lightness gradient square
 *   2. Horizontal hue slider (rainbow)
 *   3. Horizontal alpha/opacity slider (checkerboard)
 *   4. Hex input with eyedropper icon
 *   5. Preset color swatches grid
 *
 * Color Storage:
 * - Stores colors in HSL format: "220 70% 50%" (our theme system format)
 * - Displays in HEX format: "#8032FE" (user-friendly)
 * - Converts between formats using the `color` library
 *
 * Trade-offs:
 * - HSL storage: Better for programmatic theme adjustments
 * - HEX display: More familiar to designers and users
 */

interface ColorPickerProps {
  value: string; // HSL format: "220 70% 50%"
  onChange: (value: string) => void; // Returns HSL format
  presetColors?: string[]; // HSL format preset colors
}

const DEFAULT_PRESET_COLORS = [
  "0 0% 100%",    // White
  "0 0% 90%",     // Light gray
  "220 20% 80%",  // Gray
  "220 10% 60%",  // Medium gray
  "220 10% 40%",  // Dark gray
  "220 15% 20%",  // Darker gray
  "0 0% 0%",      // Black
  "350 80% 60%",  // Pink
  "260 80% 60%",  // Purple
  "195 80% 55%",  // Cyan
  "175 60% 50%",  // Teal
  "145 65% 50%",  // Green
  "45 90% 60%",   // Yellow
  "15 85% 55%",   // Orange/Red
];

export function ColorPicker({ value, onChange, presetColors = DEFAULT_PRESET_COLORS }: ColorPickerProps) {
  // Parse initial HSL value
  const initialColor = hslStringToColor(value);
  const [hue, setHue] = useState(initialColor.hue());
  const [saturation, setSaturation] = useState(initialColor.saturationl());
  const [lightness, setLightness] = useState(initialColor.lightness());
  const [alpha, setAlpha] = useState(initialColor.alpha() * 100);

  const gradientRef = useRef<HTMLDivElement>(null);
  const [isDraggingGradient, setIsDraggingGradient] = useState(false);

  // Calculate initial gradient position from saturation/lightness
  const calculateGradientPosition = useCallback((s: number, l: number) => {
    const x = s / 100;
    const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x);
    const y = 1 - (l / topLightness);
    return { x, y };
  }, []);

  const [gradientPosition, setGradientPosition] = useState(() =>
    calculateGradientPosition(initialColor.saturationl(), initialColor.lightness())
  );

  // Current color
  const currentColor = Color.hsl(hue, saturation, lightness).alpha(alpha / 100);
  const hexValue = currentColor.hex();

  // Store latest onChange callback in ref to avoid dependency issues
  // This prevents infinite loops when parent creates new onChange reference on each render
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Update parent when color changes (using ref to avoid onChange in deps)
  useEffect(() => {
    const hslString = `${Math.round(hue)} ${Math.round(saturation)}% ${Math.round(lightness)}%`;
    onChangeRef.current(hslString);
  }, [hue, saturation, lightness]);

  // Gradient background (based on current hue)
  const gradientBackground = `
    linear-gradient(to top, rgba(0,0,0,1), rgba(0,0,0,0)),
    linear-gradient(to right, rgba(255,255,255,1), rgba(255,255,255,0)),
    hsl(${hue}, 100%, 50%)
  `;

  // Handle gradient picker drag
  const handleGradientPointerMove = useCallback((event: PointerEvent) => {
    if (!isDraggingGradient || !gradientRef.current) return;

    const rect = gradientRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

    setGradientPosition({ x, y });

    // Calculate saturation and lightness from position
    const newSaturation = x * 100;
    const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x);
    const newLightness = topLightness * (1 - y);

    setSaturation(newSaturation);
    setLightness(newLightness);
  }, [isDraggingGradient]);

  useEffect(() => {
    const handlePointerUp = () => setIsDraggingGradient(false);

    if (isDraggingGradient) {
      window.addEventListener("pointermove", handleGradientPointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handleGradientPointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDraggingGradient, handleGradientPointerMove]);

  const handleHexChange = (hex: string) => {
    try {
      const color = Color(hex);
      setHue(color.hue());
      setSaturation(color.saturationl());
      setLightness(color.lightness());
      setAlpha(color.alpha() * 100);
    } catch {
      // Invalid hex, ignore
    }
  };

  const handleEyeDropper = async () => {
    try {
      // @ts-expect-error - EyeDropper API is experimental
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      handleHexChange(result.sRGBHex);
    } catch (error) {
      console.error("EyeDropper not supported or failed:", error);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 2D Saturation/Lightness Gradient Picker */}
      <div
        ref={gradientRef}
        className="relative h-48 w-full cursor-crosshair rounded-lg"
        style={{ background: gradientBackground }}
        onPointerDown={(e) => {
          e.preventDefault();
          setIsDraggingGradient(true);
          handleGradientPointerMove(e.nativeEvent);
        }}
      >
        {/* Picker Circle */}
        <div
          className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white pointer-events-none"
          style={{
            left: `${gradientPosition.x * 100}%`,
            top: `${gradientPosition.y * 100}%`,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
          }}
        />
      </div>

      {/* Hue Slider */}
      <div
        className="relative h-4 w-full rounded-full cursor-pointer"
        style={{
          background: "linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)",
        }}
      >
        <input
          type="range"
          min="0"
          max="360"
          value={hue}
          onChange={(e) => setHue(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-white pointer-events-none"
          style={{
            left: `${(hue / 360) * 100}%`,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
          }}
        />
      </div>

      {/* Alpha/Opacity Slider */}
      <div
        className="relative h-4 w-full rounded-full cursor-pointer"
        style={{
          background: `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==") left center`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(to right, transparent, ${Color.hsl(hue, saturation, lightness).hex()})`,
          }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={alpha}
          onChange={(e) => setAlpha(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-white pointer-events-none"
          style={{
            left: `${alpha}%`,
            boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
          }}
        />
      </div>

      {/* Hex Input with Eyedropper */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEyeDropper}
          className="shrink-0 h-10 w-10"
          type="button"
        >
          <Pipette className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 flex-1">
          <div
            className="h-10 w-10 rounded-md border border-border shrink-0"
            style={{ backgroundColor: hexValue }}
          />
          <Input
            value={hexValue.toUpperCase()}
            onChange={(e) => handleHexChange(e.target.value)}
            className="font-mono"
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Preset Colors */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Page colors</Label>
        <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
          {presetColors.map((presetHsl, index) => {
            const presetColor = hslStringToColor(presetHsl);
            const presetHex = presetColor.hex();
            const isSelected = hexValue.toLowerCase() === presetHex.toLowerCase();

            return (
              <button
                key={index}
                type="button"
                className={cn(
                  "h-10 w-10 rounded-md border-2 transition-all",
                  isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border hover:border-primary"
                )}
                style={{ backgroundColor: presetHex }}
                onClick={() => {
                  const color = hslStringToColor(presetHsl);
                  setHue(color.hue());
                  setSaturation(color.saturationl());
                  setLightness(color.lightness());
                  setAlpha(color.alpha() * 100);
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Converts HSL string format to Color object
 * Input: "220 70% 50%" or "220 70 50"
 * Output: Color object
 */
function hslStringToColor(hslString: string): ReturnType<typeof Color.hsl> {
  const parts = hslString.split(" ");
  const h = parseFloat(parts[0]) || 0;
  const s = parseFloat(parts[1]?.replace("%", "")) || 0;
  const l = parseFloat(parts[2]?.replace("%", "")) || 0;
  return Color.hsl(h, s, l);
}
