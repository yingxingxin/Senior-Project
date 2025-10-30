'use client';

import { useEffect } from 'react';
import { useMusic } from './music-context';
import { getMusicTracks, getUserMusicTracksAction, setUserMusicTracksAction } from '@/app/(app)/actions/music';

interface AutoMusicLoaderProps {
  userId: number;
}

export function AutoMusicLoader({ userId }: AutoMusicLoaderProps) {
  const { dispatch } = useMusic();

  useEffect(() => {
    const loadAndSyncTracks = async () => {
      try {
        // Get all available tracks
        const availableTracks = await getMusicTracks();
        
        if (availableTracks.length === 0) {
          console.log('No music tracks available');
          return;
        }

        // Get user's current selection
        const userTracks = await getUserMusicTracksAction(userId);
        
        // If user has no tracks selected, auto-select all available tracks
        if (userTracks.length === 0) {
          console.log('Auto-selecting all available tracks:', availableTracks.map(t => t.title));
          
          // Set all available tracks as user's selection
          await setUserMusicTracksAction(userId, availableTracks.map(t => t.id));
          
          // Update the music context with all tracks
          dispatch({ 
            type: 'SET_TRACKS', 
            payload: { 
              available: availableTracks, 
              userSelected: availableTracks 
            } 
          });
          
          // Auto-start playing the first track
          if (availableTracks.length > 0) {
            dispatch({ type: 'SET_CURRENT_TRACK', payload: availableTracks[0] });
            dispatch({ type: 'SET_CURRENT_TRACK_INDEX', payload: 0 });
            // Auto-start playing
            dispatch({ type: 'PLAY' });
          }
        } else {
            // Check if there are new tracks that aren't in user's selection
            const userTrackIds = new Set(userTracks.map(t => t.id));
            const newTracks = availableTracks.filter(t => !userTrackIds.has(t.id));

            if (newTracks.length > 0) {
                // Auto-add new tracks to user's selection
                console.log('Auto-adding new tracks:', newTracks.map(t => t.title));
                const allTrackIds = availableTracks.map(t => t.id);
                await setUserMusicTracksAction(userId, allTrackIds);

                // Update context with all tracks
                dispatch({
                    type: 'SET_TRACKS',
                    payload: {
                        available: availableTracks,
                        userSelected: availableTracks
                    }
                });
            } else {
                // No new tracks, just load existing selection
                dispatch({
                    type: 'SET_TRACKS',
                    payload: {
                        available: availableTracks,
                        userSelected: userTracks
                    }
                });
            }
        }
      } catch (error) {
        console.error('Failed to auto-load music tracks:', error);
      }
    };

    loadAndSyncTracks();
  }, [userId, dispatch]);

  // This component doesn't render anything, it just handles the auto-loading
  return null;
}
