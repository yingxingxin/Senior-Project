/**
 * Testimonial Queries
 *
 * Database query helpers for managing user testimonials.
 */

import { db } from '@/src/db';
import { user_testimonials, user_profiles } from '@/src/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { areFriends } from './friends';

/**
 * Create a testimonial
 *
 * Only allows creation if author and recipient are friends.
 *
 * @param authorUserId - User writing the testimonial
 * @param recipientUserId - User the testimonial is about
 * @param body - Testimonial text
 * @returns Created testimonial or null if not friends
 */
export async function createTestimonial(
  authorUserId: number,
  recipientUserId: number,
  body: string
) {
  // Don't allow self-testimonials
  if (authorUserId === recipientUserId) {
    throw new Error('Cannot write testimonial about yourself');
  }

  // Check if they are friends
  const isFriends = await areFriends(authorUserId, recipientUserId);
  if (!isFriends) {
    throw new Error('Can only write testimonials for friends');
  }

  // Create testimonial
  const [testimonial] = await db
    .insert(user_testimonials)
    .values({
      author_user_id: authorUserId,
      recipient_user_id: recipientUserId,
      body: body.trim(),
      is_public: true,
    })
    .returning();

  return testimonial;
}

/**
 * Get testimonials for a profile
 *
 * Only returns public testimonials.
 *
 * @param recipientUserId - User whose profile testimonials are for
 * @returns Array of testimonials with author info
 */
export async function getTestimonialsForProfile(recipientUserId: number) {
  const testimonials = await db
    .select({
      id: user_testimonials.id,
      body: user_testimonials.body,
      created_at: user_testimonials.created_at,
      updated_at: user_testimonials.updated_at,
      // Author info
      author_user_id: user_testimonials.author_user_id,
      author_handle: user_profiles.handle,
      author_display_name: user_profiles.display_name,
      author_avatar_url: user_profiles.avatar_url,
    })
    .from(user_testimonials)
    .innerJoin(
      user_profiles,
      eq(user_testimonials.author_user_id, user_profiles.user_id)
    )
    .where(
      and(
        eq(user_testimonials.recipient_user_id, recipientUserId),
        eq(user_testimonials.is_public, true)
      )
    )
    .orderBy(desc(user_testimonials.created_at));

  return testimonials;
}

/**
 * Delete a testimonial (only by recipient)
 *
 * @param testimonialId - Testimonial ID
 * @param recipientUserId - User who owns the profile (must match)
 */
export async function deleteTestimonial(
  testimonialId: number,
  recipientUserId: number
) {
  // Verify the current user is the recipient
  const [testimonial] = await db
    .select()
    .from(user_testimonials)
    .where(
      and(
        eq(user_testimonials.id, testimonialId),
        eq(user_testimonials.recipient_user_id, recipientUserId)
      )
    )
    .limit(1);

  if (!testimonial) {
    throw new Error('Testimonial not found or you do not have permission');
  }

  await db
    .delete(user_testimonials)
    .where(eq(user_testimonials.id, testimonialId));
}

/**
 * Hide/show a testimonial (toggle is_public)
 *
 * @param testimonialId - Testimonial ID
 * @param recipientUserId - User who owns the profile (must match)
 * @param isPublic - New public status
 */
export async function updateTestimonialVisibility(
  testimonialId: number,
  recipientUserId: number,
  isPublic: boolean
) {
  // Verify the current user is the recipient
  const [testimonial] = await db
    .select()
    .from(user_testimonials)
    .where(
      and(
        eq(user_testimonials.id, testimonialId),
        eq(user_testimonials.recipient_user_id, recipientUserId)
      )
    )
    .limit(1);

  if (!testimonial) {
    throw new Error('Testimonial not found or you do not have permission');
  }

  await db
    .update(user_testimonials)
    .set({
      is_public: isPublic,
      updated_at: new Date(),
    })
    .where(eq(user_testimonials.id, testimonialId));
}

