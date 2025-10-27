'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Music, Plus } from 'lucide-react';
import { getMusicTracks } from '@/app/(app)/actions/music';
import { setUserMusicTracksAction } from '@/app/(app)/actions/music';
import { MusicTrack } from '@/src/db/schema';

interface QuickAddTracksProps {
  userId: number;
  onTracksAdded?: (tracks: MusicTrack[]) => void;
}

export function QuickAddTracks({ userId, onTracksAdded }: QuickAddTracksProps) {
  const [availableTracks, setAvailableTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setIsLoading(true);
        const tracks = await getMusicTracks();
        setAvailableTracks(tracks);
      } catch (error) {
        console.error('Failed to load tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, []);

  const handleQuickAdd = async () => {
    if (availableTracks.length === 0) return;

    try {
      setIsAdding(true);
      const result = await setUserMusicTracksAction(userId, availableTracks.map(t => t.id));
      
      if (result.success) {
        onTracksAdded?.(availableTracks);
        console.log('✅ All tracks added to your playlist!');
      } else {
        console.error('❌ Failed to add tracks:', result.error);
      }
    } catch (error) {
      console.error('❌ Error adding tracks:', error);
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      </Card>
    );
  }

  if (availableTracks.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center py-4">
          <Music className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No music tracks available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4" />
          <span className="text-sm font-medium">Available Music</span>
        </div>
        
        <div className="space-y-2">
          {availableTracks.map((track) => (
            <div key={track.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{track.title}</p>
                <p className="text-xs text-muted-foreground truncate">{track.artist}</p>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={handleQuickAdd}
          disabled={isAdding}
          className="w-full"
          size="sm"
        >
          {isAdding ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent" />
              <span>Adding...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Plus className="h-3 w-3" />
              <span>Add All to Playlist</span>
            </div>
          )}
        </Button>
      </div>
    </Card>
  );
}
