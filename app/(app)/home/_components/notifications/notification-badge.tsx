"use client";

import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

/**
 * Notification Badge
 *
 * Displays unread notification count on the bell icon.
 * Hidden when count is 0, shows "9+" for counts above 9.
 */
export function NotificationBadge({ count, className }: NotificationBadgeProps) {
  if (count === 0) {
    return null;
  }

  const displayCount = count > 9 ? "9+" : count.toString();

  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground",
        className
      )}
    >
      {displayCount}
    </span>
  );
}
