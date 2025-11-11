"use client";

import { MusicSettings } from "@/components/music";

/**
 * Music Settings Tab
 *
 * Wrapper component for music settings in the settings page tabs.
 * Delegates to the existing MusicSettings component.
 */

interface MusicSettingsTabProps {
  userId: number;
}

export function MusicSettingsTab({ userId }: MusicSettingsTabProps) {
  return <MusicSettings userId={userId} />;
}
