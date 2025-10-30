'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrackSelection } from './music-player';
import { useMusic } from './music-context';
import { getMusicTracks, getUserMusicTracksAction, setUserMusicTracksAction } from '@/app/(app)/actions/music';
import { MusicTrack } from '@/src/db/schema';

interface MusicSettingsProps {
  userId: number;
  className?: string;
}

export function MusicSettings({ userId, className = '' }: MusicSettingsProps) {
  const { state, addToUserTracks, removeFromUserTracks } = useMusic();
  const [availableTracks, setAvailableTracks] = useState<MusicTrack[]>([]);
  const [userTracks, setUserTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load tracks on mount
  useEffect(() => {
    const loadTracks = async () => {
      try {
        setIsLoading(true);
        const [available, userSelected] = await Promise.all([
          getMusicTracks(),
          getUserMusicTracksAction(userId)
        ]);
        setAvailableTracks(available);
        setUserTracks(userSelected);
      } catch (error) {
        console.error('Failed to load tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, [userId]);

  // Handle track selection
  const handleTrackSelect = (track: MusicTrack) => {
    const newUserTracks = [...userTracks, track];
    setUserTracks(newUserTracks);
    addToUserTracks(track);
  };

  const handleTrackDeselect = (trackId: number) => {
    const newUserTracks = userTracks.filter(t => t.id !== trackId);
    setUserTracks(newUserTracks);
    removeFromUserTracks(trackId);
  };

  // Save user preferences
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const result = await setUserMusicTracksAction(userId, userTracks.map(t => t.id));
      if (!result.success) {
        throw new Error(result.error || 'Failed to save music preferences');
      }
      // Show success message or handle success
      console.log('Music preferences saved');
    } catch (error) {
      console.error('Failed to save music preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Background Music Settings</h2>
          <p className="text-sm text-muted-foreground">
            Select your favorite tracks to play during study sessions. You can choose multiple tracks for variety.
          </p>
        </div>

        <TrackSelection
          availableTracks={availableTracks}
          selectedTracks={userTracks}
          onTrackSelect={handleTrackSelect}
          onTrackDeselect={handleTrackDeselect}
        />

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {userTracks.length} track{userTracks.length !== 1 ? 's' : ''} selected
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-24"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

