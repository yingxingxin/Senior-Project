/**
 * Music Tracks Database Queries
 *
 * Contains all database operations related to music tracks and user music preferences.
 */

import { db } from '../index';
import { music_tracks, user_music_tracks, type MusicTrack, type NewMusicTrack, type UserMusicTrack, type NewUserMusicTrack } from '../schema';
import { eq, and } from 'drizzle-orm';

// Music Tracks

/**
 * Get all available music tracks
 */
export async function getAllMusicTracks(): Promise<MusicTrack[]> {
  return await db.select().from(music_tracks).orderBy(music_tracks.title);
}

/**
 * Get a specific music track by ID
 */
export async function getMusicTrackById(id: number): Promise<MusicTrack | null> {
  const [track] = await db.select().from(music_tracks).where(eq(music_tracks.id, id)).limit(1);
  return track || null;
}

/**
 * Get music tracks by IDs
 */
export async function getMusicTracksByIds(ids: number[]): Promise<MusicTrack[]> {
  if (ids.length === 0) return [];
  return await db.select().from(music_tracks).where(eq(music_tracks.id, ids[0])); // Simplified for now
}

// User Music Preferences

/**
 * Get user's selected music tracks
 */
export async function getUserMusicTracks(userId: number): Promise<MusicTrack[]> {
  const userTracks = await db
    .select({
      id: music_tracks.id,
      title: music_tracks.title,
      artist: music_tracks.artist,
      duration_sec: music_tracks.duration_sec,
      file_url: music_tracks.file_url,
      volume: music_tracks.volume,
    })
    .from(user_music_tracks)
    .innerJoin(music_tracks, eq(user_music_tracks.music_track_id, music_tracks.id))
    .where(eq(user_music_tracks.user_id, userId))
    .orderBy(music_tracks.title);

  return userTracks;
}

/**
 * Add a music track to user's selection
 */
export async function addUserMusicTrack(userId: number, musicTrackId: number): Promise<UserMusicTrack> {
  const [userMusicTrack] = await db
    .insert(user_music_tracks)
    .values({
      user_id: userId,
      music_track_id: musicTrackId,
    })
    .returning();

  return userMusicTrack;
}

/**
 * Remove a music track from user's selection
 */
export async function removeUserMusicTrack(userId: number, musicTrackId: number): Promise<void> {
  await db
    .delete(user_music_tracks)
    .where(
      and(
        eq(user_music_tracks.user_id, userId),
        eq(user_music_tracks.music_track_id, musicTrackId)
      )
    );
}

/**
 * Check if user has a specific music track selected
 */
export async function hasUserMusicTrack(userId: number, musicTrackId: number): Promise<boolean> {
  const [userMusicTrack] = await db
    .select()
    .from(user_music_tracks)
    .where(
      and(
        eq(user_music_tracks.user_id, userId),
        eq(user_music_tracks.music_track_id, musicTrackId)
      )
    )
    .limit(1);

  return !!userMusicTrack;
}

/**
 * Replace all user's music tracks with new selection
 */
export async function setUserMusicTracks(userId: number, musicTrackIds: number[]): Promise<void> {
  // First, remove all existing tracks
  await db.delete(user_music_tracks).where(eq(user_music_tracks.user_id, userId));

  // Then, add new tracks
  if (musicTrackIds.length > 0) {
    const newUserMusicTracks: NewUserMusicTrack[] = musicTrackIds.map(trackId => ({
      user_id: userId,
      music_track_id: trackId,
    }));

    await db.insert(user_music_tracks).values(newUserMusicTracks);
  }
}

// Admin Functions

/**
 * Create a new music track (admin function)
 */
export async function createMusicTrack(track: NewMusicTrack): Promise<MusicTrack> {
  const [newTrack] = await db.insert(music_tracks).values(track).returning();
  return newTrack;
}

/**
 * Update a music track (admin function)
 */
export async function updateMusicTrack(id: number, updates: Partial<MusicTrack>): Promise<MusicTrack | null> {
  const [updatedTrack] = await db
    .update(music_tracks)
    .set(updates)
    .where(eq(music_tracks.id, id))
    .returning();

  return updatedTrack || null;
}

/**
 * Delete a music track (admin function)
 */
//export async function deleteMusicTrack(id: number): Promise<boolean> {
//  const result = await db.delete(music_tracks).where(eq(music_tracks.id, id));
//  return result.rowCount > 0;
//}
