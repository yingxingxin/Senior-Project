"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Muted } from "@/components/ui/typography";

interface SectionNavigatorProps {
  currentIndex: number;
  totalSections: number;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
  sectionTitle?: string;
  canProceed?: boolean;
}

export function SectionNavigator({
  currentIndex,
  totalSections,
  onNext,
  onPrevious,
  isLoading = false,
  sectionTitle,
  canProceed = true,
}: SectionNavigatorProps) {
  const canGoPrevious = currentIndex > 0;
  const progress = Math.round(((currentIndex + 1) / totalSections) * 100);

  return (
    <div className="space-y-4 mt-8 pt-8 border-t border-border">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Muted variant="small">
            Section {currentIndex + 1} of {totalSections}
          </Muted>
          <Muted variant="small">{progress}%</Muted>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrevious}
          disabled={!canGoPrevious || isLoading}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {sectionTitle && (
          <Muted className="flex-1 text-center text-xs sm:text-sm truncate">
            {sectionTitle}
          </Muted>
        )}

        <Button
          size="lg"
          onClick={onNext}
          disabled={isLoading || !canProceed}
          className="flex items-center gap-2"
        >
          {currentIndex === totalSections - 1 ? "Complete" : "Next"}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
