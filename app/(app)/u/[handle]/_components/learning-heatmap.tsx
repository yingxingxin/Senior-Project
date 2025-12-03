"use client";

import * as React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HeatmapCell } from "@/src/lib/date/activityHeatmap";
import { cn } from "@/lib/utils";

interface LearningHeatmapProps {
  cells: HeatmapCell[];
  accentColor?: string;
}

type IntensityLevel = "empty" | "low" | "medium" | "high";

/**
 * Learning Activity Heatmap Component
 *
 * Displays a calendar-style activity heatmap showing daily learning activity
 * over the last 30 days. Each cell represents a day, with color intensity
 * indicating activity level.
 */
export function LearningHeatmap({ cells, accentColor }: LearningHeatmapProps) {
  // Calculate maximum event count for intensity scaling
  const maxEventCount = React.useMemo(() => {
    if (cells.length === 0) return 0;
    return Math.max(...cells.map((cell) => cell.eventCount));
  }, [cells]);

  // Determine intensity level for a cell
  const getIntensity = (eventCount: number): IntensityLevel => {
    if (eventCount === 0) return "empty";
    if (maxEventCount === 0) return "empty";

    const ratio = eventCount / maxEventCount;
    if (ratio >= 0.75) return "high";
    if (ratio >= 0.5) return "medium";
    if (ratio >= 0.25) return "low";
    return "low";
  };

  // Organize cells into a calendar grid (weeks as rows, days as columns)
  // Find the day of week for the first cell to align properly
  const calendarGrid = React.useMemo(() => {
    if (cells.length === 0) return [];

    // Get day of week for first cell (0 = Sunday, 1 = Monday, etc.)
    const firstDay = cells[0]?.date.getDay() ?? 0;
    // Convert to Monday = 0, Tuesday = 1, etc.
    const firstDayMondayBased = (firstDay + 6) % 7;

    // Create grid: array of weeks, each week is an array of 7 days (Mon-Sun)
    const grid: (HeatmapCell | null)[][] = [];
    let currentWeek: (HeatmapCell | null)[] = [];

    // Add empty cells for days before the first day
    for (let i = 0; i < firstDayMondayBased; i++) {
      currentWeek.push(null);
    }

    // Add all cells
    for (const cell of cells) {
      currentWeek.push(cell);

      // If we've filled a week (7 days), start a new week
      if (currentWeek.length === 7) {
        grid.push(currentWeek);
        currentWeek = [];
      }
    }

    // Add the last incomplete week if it exists
    if (currentWeek.length > 0) {
      // Fill remaining days with null
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      grid.push(currentWeek);
    }

    return grid;
  }, [cells]);

  // Day labels (Monday to Sunday)
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Format date for tooltip
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Convert hex to RGB for opacity calculation
  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Get color for intensity level
  const getIntensityColor = (intensity: IntensityLevel): string => {
    // Default colors (GitHub-style green scale)
    const colorMap = {
      empty: "bg-muted",
      low: "bg-green-400 dark:bg-green-500",
      medium: "bg-green-500 dark:bg-green-600",
      high: "bg-green-600 dark:bg-green-700",
    };
    return colorMap[intensity];
  };

  // Get inline style for accent color with opacity
  const getAccentColorStyle = (intensity: IntensityLevel): React.CSSProperties | undefined => {
    if (!accentColor || intensity === "empty") return undefined;

    const rgb = hexToRgb(accentColor);
    if (!rgb) return undefined;

    const opacityMap = {
      low: 0.3,
      medium: 0.6,
      high: 1,
    };

    return {
      backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacityMap[intensity]})`,
    };
  };

  if (cells.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3
              className="text-lg font-semibold"
              style={accentColor ? { color: accentColor } : undefined}
            >
              Learning Activity
            </h3>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </div>
        </div>

        {/* Calendar-style Heatmap Grid */}
        <div className="w-full">
          {/* Day labels row */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayLabels.map((day) => (
              <div
                key={day}
                className="text-xs font-medium text-muted-foreground text-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarGrid.map((week, weekIndex) =>
              week.map((cell, dayIndex) => {
                if (cell === null) {
                  return (
                    <div
                      key={`empty-${weekIndex}-${dayIndex}`}
                      className="aspect-square rounded-md bg-transparent"
                    />
                  );
                }

                const intensity = getIntensity(cell.eventCount);
                const colorClass = getIntensityColor(intensity);
                const hasActivity = cell.eventCount > 0;

                const accentStyle = getAccentColorStyle(intensity);
                const finalColorClass = accentStyle ? "" : colorClass;

                return (
                  <Tooltip key={`${cell.dateString}-${weekIndex}-${dayIndex}`}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "aspect-square rounded-md transition-all hover:ring-2 hover:ring-ring hover:scale-105",
                          finalColorClass,
                          hasActivity && "cursor-pointer",
                          "relative group"
                        )}
                        style={accentStyle}
                        aria-label={`${formatDate(cell.date)}: ${hasActivity ? `${cell.eventCount} events, ${cell.totalPoints} XP` : "No activity"}`}
                        tabIndex={hasActivity ? 0 : -1}
                      >
                        {/* Show day number on hover or for today */}
                        <span className={cn(
                          "absolute inset-0 flex items-center justify-center text-xs font-medium transition-opacity",
                          "opacity-0 group-hover:opacity-100",
                          intensity !== "empty" && "text-white"
                        )}>
                          {cell.date.getDate()}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1">
                        <p className="font-medium">{formatDate(cell.date)}</p>
                        {hasActivity ? (
                          <p className="text-xs">
                            {cell.eventCount} {cell.eventCount === 1 ? "event" : "events"} · {cell.totalPoints} XP
                          </p>
                        ) : (
                          <p className="text-xs">No activity</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })
            )}
          </div>
        </div>

        {/* Caption */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-2">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="h-4 w-4 rounded-md bg-muted" />
              <div className="h-4 w-4 rounded-md bg-green-400 dark:bg-green-500" />
              <div className="h-4 w-4 rounded-md bg-green-500 dark:bg-green-600" />
              <div className="h-4 w-4 rounded-md bg-green-600 dark:bg-green-700" />
            </div>
            <span>More</span>
          </div>
          <span className="ml-auto">Each cell shows your activity for that day</span>
        </div>
      </div>
    </TooltipProvider>
  );
}

