'use server';

import { getAllMusicTracks, getUserMusicTracks, setUserMusicTracks } from '@/src/db/queries';
import { MusicTrack } from '@/src/db/schema';

export async function getMusicTracks(): Promise<MusicTrack[]> {
  try {
    return await getAllMusicTracks();
  } catch (error) {
    console.error('Failed to get music tracks:', error);
    return [];
  }
}

export async function getUserMusicTracksAction(userId: number): Promise<MusicTrack[]> {
  try {
    return await getUserMusicTracks(userId);
  } catch (error) {
    console.error('Failed to get user music tracks:', error);
    return [];
  }
}

export async function setUserMusicTracksAction(userId: number, trackIds: number[]): Promise<{ success: boolean; error?: string }> {
  try {
    await setUserMusicTracks(userId, trackIds);
    return { success: true };
  } catch (error) {
    console.error('Failed to set user music tracks:', error);
    return { success: false, error: 'Failed to save music preferences' };
  }
}
