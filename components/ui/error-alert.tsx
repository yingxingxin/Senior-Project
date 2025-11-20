/**
 * ErrorAlert Component
 *
 * Subtle, dismissible error message component.
 * Uses a soft red background instead of harsh red text to reduce visual aggression.
 *
 * Design decisions:
 * - bg-destructive/10: 10% opacity background (very subtle, not jarring)
 * - border-destructive/50: 50% opacity border (softer than full red)
 * - Includes icon for context (AlertCircle)
 * - Dismissible with X button
 * - Accessible with role="alert" and aria-live="polite"
 *
 * Usage:
 * ```tsx
 * {error && <ErrorAlert message={error.message} onDismiss={clearError} />}
 * ```
 */

import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ message, onDismiss, className }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive",
        className
      )}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 text-destructive/70 hover:text-destructive transition-colors"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
