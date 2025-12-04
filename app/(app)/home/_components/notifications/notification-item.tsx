"use client";

import { useRouter } from "next/navigation";
import { UserPlus, Users, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/src/db/schema";
import { markAsRead } from "@/app/(app)/notifications/actions";

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: number) => void;
}

/**
 * Get icon component based on notification type
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "friend_request":
      return UserPlus;
    case "friend_accepted":
      return Users;
    case "level_up":
      return TrendingUp;
    case "system":
    default:
      return Info;
  }
}

/**
 * Get relative time string from date
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return "Just now";
  } else if (diffMin < 60) {
    return `${diffMin}m ago`;
  } else if (diffHour < 24) {
    return `${diffHour}h ago`;
  } else if (diffDay === 1) {
    return "Yesterday";
  } else if (diffDay < 7) {
    return `${diffDay}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Notification Item
 *
 * Individual notification row with icon, title, message, and timestamp.
 * Clicking navigates to the notification's link and marks it as read.
 */
export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const router = useRouter();
  const Icon = getNotificationIcon(notification.type);
  const isUnread = notification.read_at === null;

  const handleClick = async () => {
    // Mark as read if unread
    if (isUnread) {
      await markAsRead(notification.id);
      onRead?.(notification.id);
    }

    // Navigate to link if present
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50",
        isUnread && "bg-primary/5"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          isUnread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm line-clamp-1",
              isUnread ? "font-semibold text-foreground" : "font-medium text-foreground"
            )}
          >
            {notification.title}
          </p>
          {/* Unread indicator dot */}
          {isUnread && (
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {getRelativeTime(new Date(notification.created_at))}
        </p>
      </div>
    </button>
  );
}
