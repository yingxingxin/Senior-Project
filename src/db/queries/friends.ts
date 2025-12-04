/**
 * Friendship Queries
 *
 * Database query helpers for managing friendships and friend requests.
 */

import { db } from '@/src/db';
import { user_friendships, user_profiles } from '@/src/db/schema';
import { eq, and, or, sql, inArray } from 'drizzle-orm';

export type FriendshipStatus =
  | 'none'
  | 'pending_incoming'
  | 'pending_outgoing'
  | 'friends';

/**
 * Check friendship status between two users
 *
 * @param userAId - First user ID
 * @param userBId - Second user ID
 * @param currentUserId - The current user's ID (to determine direction)
 * @returns Friendship status
 */
export async function getFriendshipStatus(
  userAId: number,
  userBId: number,
  currentUserId: number
): Promise<FriendshipStatus> {
  // Check both directions (A->B and B->A)
  const [friendship] = await db
    .select()
    .from(user_friendships)
    .where(
      or(
        and(
          eq(user_friendships.requester_user_id, userAId),
          eq(user_friendships.receiver_user_id, userBId)
        ),
        and(
          eq(user_friendships.requester_user_id, userBId),
          eq(user_friendships.receiver_user_id, userAId)
        )
      )!
    )
    .limit(1);

  if (!friendship) {
    return 'none';
  }

  if (friendship.status === 'accepted') {
    return 'friends';
  }

  if (friendship.status === 'pending') {
    // Determine direction
    if (friendship.receiver_user_id === currentUserId) {
      return 'pending_incoming';
    } else {
      return 'pending_outgoing';
    }
  }

  return 'none';
}

/**
 * Create a friend request
 *
 * @param requesterUserId - User sending the request
 * @param receiverUserId - User receiving the request
 * @returns Created friendship record or null if already exists
 */
export async function createFriendRequest(
  requesterUserId: number,
  receiverUserId: number
) {
  // Don't allow self-friending
  if (requesterUserId === receiverUserId) {
    throw new Error('Cannot send friend request to yourself');
  }

  // Check if friendship already exists
  const existing = await getFriendshipStatus(
    requesterUserId,
    receiverUserId,
    requesterUserId
  );

  if (existing === 'friends') {
    return null; // Already friends
  }

  if (existing === 'pending_incoming' || existing === 'pending_outgoing') {
    // If there's a pending request in opposite direction, auto-accept
    const [oppositeRequest] = await db
      .select()
      .from(user_friendships)
      .where(
        and(
          eq(user_friendships.requester_user_id, receiverUserId),
          eq(user_friendships.receiver_user_id, requesterUserId),
          eq(user_friendships.status, 'pending')
        )
      )
      .limit(1);

    if (oppositeRequest) {
      // Auto-accept both ways
      await db
        .update(user_friendships)
        .set({
          status: 'accepted',
          updated_at: new Date(),
        })
        .where(eq(user_friendships.id, oppositeRequest.id));

      return oppositeRequest;
    }

    return null; // Request already exists
  }

  // Create new request
  const [newRequest] = await db
    .insert(user_friendships)
    .values({
      requester_user_id: requesterUserId,
      receiver_user_id: receiverUserId,
      status: 'pending',
    })
    .returning();

  return newRequest;
}

/**
 * Get pending friend requests for a user
 *
 * @param receiverUserId - User who received requests
 * @returns Array of pending requests with requester info
 */
export async function getPendingRequests(receiverUserId: number) {
  const requests = await db
    .select({
      id: user_friendships.id,
      requester_user_id: user_friendships.requester_user_id,
      created_at: user_friendships.created_at,
      // Requester profile info
      requester_handle: user_profiles.handle,
      requester_display_name: user_profiles.display_name,
      requester_avatar_url: user_profiles.avatar_url,
    })
    .from(user_friendships)
    .innerJoin(
      user_profiles,
      eq(user_friendships.requester_user_id, user_profiles.user_id)
    )
    .where(
      and(
        eq(user_friendships.receiver_user_id, receiverUserId),
        eq(user_friendships.status, 'pending')
      )
    );

  return requests;
}

/**
 * Accept a friend request
 *
 * @param friendshipId - The friendship record ID
 * @param receiverUserId - The user accepting (must be receiver)
 * @returns The friendship record with requester_user_id for notification
 */
export async function acceptFriendRequest(
  friendshipId: number,
  receiverUserId: number
) {
  // Verify the current user is the receiver
  const [friendship] = await db
    .select()
    .from(user_friendships)
    .where(
      and(
        eq(user_friendships.id, friendshipId),
        eq(user_friendships.receiver_user_id, receiverUserId),
        eq(user_friendships.status, 'pending')
      )
    )
    .limit(1);

  if (!friendship) {
    throw new Error('Friend request not found or already processed');
  }

  await db
    .update(user_friendships)
    .set({
      status: 'accepted',
      updated_at: new Date(),
    })
    .where(eq(user_friendships.id, friendshipId));

  return friendship;
}

/**
 * Reject/decline a friend request
 *
 * @param friendshipId - The friendship record ID
 * @param receiverUserId - The user rejecting (must be receiver)
 */
export async function rejectFriendRequest(
  friendshipId: number,
  receiverUserId: number
) {
  // Verify the current user is the receiver
  const [friendship] = await db
    .select()
    .from(user_friendships)
    .where(
      and(
        eq(user_friendships.id, friendshipId),
        eq(user_friendships.receiver_user_id, receiverUserId),
        eq(user_friendships.status, 'pending')
      )
    )
    .limit(1);

  if (!friendship) {
    throw new Error('Friend request not found or already processed');
  }

  // Delete the request (simpler than marking as rejected for school project)
  await db.delete(user_friendships).where(eq(user_friendships.id, friendshipId));
}

/**
 * List friends for a user
 *
 * @param userId - User ID
 * @returns Array of friend user IDs and profile info
 */
export async function getFriends(userId: number) {
  // Get friendships where user is either requester or receiver
  const friendships = await db
    .select()
    .from(user_friendships)
    .where(
      and(
        or(
          eq(user_friendships.requester_user_id, userId),
          eq(user_friendships.receiver_user_id, userId)
        )!,
        eq(user_friendships.status, 'accepted')
      )
    );

  // Get friend IDs (the other user in each friendship)
  const friendIds = friendships.map((f) =>
    f.requester_user_id === userId ? f.receiver_user_id : f.requester_user_id
  );

  if (friendIds.length === 0) {
    return [];
  }

  // Get friend profiles
  if (friendIds.length === 0) {
    return [];
  }

  const friendProfiles = await db
    .select({
      user_id: user_profiles.user_id,
      handle: user_profiles.handle,
      display_name: user_profiles.display_name,
      avatar_url: user_profiles.avatar_url,
      tagline: user_profiles.tagline,
    })
    .from(user_profiles)
    .where(inArray(user_profiles.user_id, friendIds));

  return friendProfiles;
}

/**
 * Check if two users are friends
 *
 * @param userAId - First user ID
 * @param userBId - Second user ID
 * @returns true if they are friends, false otherwise
 */
export async function areFriends(
  userAId: number,
  userBId: number
): Promise<boolean> {
  const [friendship] = await db
    .select()
    .from(user_friendships)
    .where(
      and(
        or(
          and(
            eq(user_friendships.requester_user_id, userAId),
            eq(user_friendships.receiver_user_id, userBId)
          ),
          and(
            eq(user_friendships.requester_user_id, userBId),
            eq(user_friendships.receiver_user_id, userAId)
          )
        )!,
        eq(user_friendships.status, 'accepted')
      )
    )
    .limit(1);

  return !!friendship;
}

