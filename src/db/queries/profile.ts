/**
 * Profile Queries
 *
 * Database query helpers for user profile, projects, experiences, and themes.
 */

import { db } from '@/src/db';
import {
  user_profiles,
  user_projects,
  user_experiences,
  user_profile_themes,
} from '@/src/db/schema';
import { eq, asc, desc } from 'drizzle-orm';

/**
 * Get user profile by user ID
 *
 * Returns the profile data for a given userId.
 * If no profile exists, returns null.
 *
 * @param userId - The user's ID (as string)
 * @returns User profile or null
 *
 * @example
 * const profile = await getUserProfileByUserId('123');
 */
export async function getUserProfileByUserId(userId: string) {
  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum)) {
    return null;
  }

  const [profile] = await db
    .select()
    .from(user_profiles)
    .where(eq(user_profiles.user_id, userIdNum))
    .limit(1);

  return profile || null;
}

/**
 * Get user profile by handle (case-insensitive)
 *
 * Returns the complete profile data including projects, experiences, and theme.
 * Projects are ordered by orderIndex (ascending), then createdAt as tie-breaker.
 * Experiences are ordered by orderIndex (ascending), then startDate descending as tie-breaker.
 *
 * @param handle - The profile handle (case-insensitive)
 * @returns Complete profile data with related records or null
 *
 * @example
 * const profile = await getUserProfileByHandle('johndoe');
 */
export async function getUserProfileByHandle(handle: string) {
  // Normalize handle to lowercase for lookup (handles are stored lowercase)
  const normalizedHandle = handle.toLowerCase();

  // Get the profile
  const [profile] = await db
    .select()
    .from(user_profiles)
    .where(eq(user_profiles.handle, normalizedHandle))
    .limit(1);

  if (!profile) {
    return null;
  }

  // Get projects ordered by orderIndex, then createdAt
  const projects = await db
    .select()
    .from(user_projects)
    .where(eq(user_projects.user_id, profile.user_id))
    .orderBy(
      asc(user_projects.order_index),
      asc(user_projects.created_at)
    );

  // Get experiences ordered by orderIndex, then startDate descending
  const experiences = await db
    .select()
    .from(user_experiences)
    .where(eq(user_experiences.user_id, profile.user_id))
    .orderBy(
      asc(user_experiences.order_index),
      desc(user_experiences.start_date)
    );

  // Get theme if present
  const [theme] = await db
    .select()
    .from(user_profile_themes)
    .where(eq(user_profile_themes.user_id, profile.user_id))
    .limit(1);

  return {
    ...profile,
    projects,
    experiences,
    theme: theme || null,
  };
}

/**
 * Upsert user profile
 *
 * If a profile row exists for userId, updates it.
 * If not, inserts a new row.
 * Automatically updates the updated_at timestamp.
 *
 * @param userId - The user's ID (as string)
 * @param data - Profile data to upsert
 * @returns The upserted profile row
 *
 * @example
 * const profile = await upsertUserProfile('123', {
 *   handle: 'johndoe',
 *   displayName: 'John Doe',
 *   bio: 'Software developer',
 * });
 */
export async function upsertUserProfile(
  userId: string,
  data: {
    handle?: string;
    displayName?: string | null;
    tagline?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
    websiteUrl?: string | null;
    githubUrl?: string | null;
    linkedinUrl?: string | null;
    xUrl?: string | null;
    isPublic?: boolean;
  }
) {
  const updateData: Partial<typeof user_profiles.$inferInsert> = {
    updated_at: new Date(),
  };

  if (data.handle !== undefined) updateData.handle = data.handle.toLowerCase();
  if (data.displayName !== undefined) updateData.display_name = data.displayName;
  if (data.tagline !== undefined) updateData.tagline = data.tagline;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
  if (data.websiteUrl !== undefined) updateData.website_url = data.websiteUrl;
  if (data.githubUrl !== undefined) updateData.github_url = data.githubUrl;
  if (data.linkedinUrl !== undefined) updateData.linkedin_url = data.linkedinUrl;
  if (data.xUrl !== undefined) updateData.x_url = data.xUrl;
  if (data.isPublic !== undefined) updateData.is_public = data.isPublic;

  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum)) {
    throw new Error('Invalid userId');
  }

  const [result] = await db
    .insert(user_profiles)
    .values({
      user_id: userIdNum,
      handle: data.handle?.toLowerCase() || '',
      display_name: data.displayName ?? null,
      tagline: data.tagline ?? null,
      bio: data.bio ?? null,
      avatar_url: data.avatarUrl ?? null,
      website_url: data.websiteUrl ?? null,
      github_url: data.githubUrl ?? null,
      linkedin_url: data.linkedinUrl ?? null,
      x_url: data.xUrl ?? null,
      is_public: data.isPublic ?? true,
    })
    .onConflictDoUpdate({
      target: user_profiles.user_id,
      set: updateData,
    })
    .returning();

  return result;
}

/**
 * Replace user projects
 *
 * Deletes all existing projects for userId and inserts the provided list.
 * Wraps the operation in a transaction to ensure atomicity.
 * Normalizes orderIndex values (0, 1, 2, ...) if not provided.
 *
 * @param userId - The user's ID (as string)
 * @param projects - Array of projects to insert
 * @returns Array of inserted project rows
 *
 * @example
 * const projects = await replaceUserProjects('123', [
 *   { title: 'My Project', description: 'A cool project', techStack: 'React, TypeScript' },
 * ]);
 */
export async function replaceUserProjects(
  userId: string,
  projects: Array<{
    id?: string;
    title: string;
    description?: string | null;
    techStack?: string | null;
    linkUrl?: string | null;
    orderIndex?: number;
  }>
) {
  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum)) {
    throw new Error('Invalid userId');
  }

  return await db.transaction(async (tx) => {
    // Delete all existing projects for this user
    await tx
      .delete(user_projects)
      .where(eq(user_projects.user_id, userIdNum));

    // Normalize orderIndex if not provided
    const normalizedProjects = projects.map((project, index) => ({
      ...project,
      orderIndex: project.orderIndex ?? index,
    }));

    // Insert new projects
    if (normalizedProjects.length === 0) {
      return [];
    }

    const inserted = await tx
      .insert(user_projects)
      .values(
        normalizedProjects.map((project) => ({
          user_id: userIdNum,
          title: project.title,
          description: project.description ?? null,
          tech_stack: project.techStack ?? null,
          link_url: project.linkUrl ?? null,
          order_index: project.orderIndex ?? 0,
        }))
      )
      .returning();

    return inserted;
  });
}

/**
 * Replace user experiences
 *
 * Deletes all existing experiences for userId and inserts the provided list.
 * Wraps the operation in a transaction to ensure atomicity.
 * Normalizes orderIndex values (0, 1, 2, ...) if not provided.
 *
 * @param userId - The user's ID (as string)
 * @param experiences - Array of experiences to insert
 * @returns Array of inserted experience rows
 *
 * @example
 * const experiences = await replaceUserExperiences('123', [
 *   { role: 'Software Engineer', organization: 'Tech Corp', isCurrent: true },
 * ]);
 */
export async function replaceUserExperiences(
  userId: string,
  experiences: Array<{
    id?: string;
    role: string;
    organization: string;
    location?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    isCurrent?: boolean;
    description?: string | null;
    orderIndex?: number;
  }>
) {
  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum)) {
    throw new Error('Invalid userId');
  }

  return await db.transaction(async (tx) => {
    // Delete all existing experiences for this user
    await tx
      .delete(user_experiences)
      .where(eq(user_experiences.user_id, userIdNum));

    // Normalize orderIndex if not provided
    const normalizedExperiences = experiences.map((exp, index) => ({
      ...exp,
      orderIndex: exp.orderIndex ?? index,
    }));

    // Insert new experiences
    if (normalizedExperiences.length === 0) {
      return [];
    }

    const inserted = await tx
      .insert(user_experiences)
      .values(
        normalizedExperiences.map((exp) => ({
          user_id: userIdNum,
          role: exp.role,
          organization: exp.organization,
          location: exp.location ?? null,
          start_date: exp.startDate
            ? (typeof exp.startDate === "string"
                ? exp.startDate
                : exp.startDate.toISOString().split("T")[0])
            : null,
          end_date: exp.endDate
            ? (typeof exp.endDate === "string"
                ? exp.endDate
                : exp.endDate.toISOString().split("T")[0])
            : null,
          is_current: exp.isCurrent ?? false,
          description: exp.description ?? null,
          order_index: exp.orderIndex ?? 0,
        }))
      )
      .returning();

    return inserted;
  });
}

/**
 * Upsert user profile theme
 *
 * If a theme row exists for userId, updates it.
 * If not, inserts a new row.
 * Automatically updates the updated_at timestamp.
 *
 * @param userId - The user's ID (as string)
 * @param data - Theme data to upsert
 * @returns The upserted theme row
 *
 * @example
 * const theme = await upsertUserProfileTheme('123', {
 *   layoutStyle: 'two_column',
 *   accentColor: '#ff80bf',
 *   showAssistant: true,
 * });
 */
export async function upsertUserProfileTheme(
  userId: string,
  data: {
    layoutStyle?: string;
    accentColor?: string | null;
    backgroundImageUrl?: string | null;
    backgroundPattern?: string | null;
    fontStyle?: string | null;
    showAssistant?: boolean;
    showMusicPlayer?: boolean;
  }
) {
  const updateData: Partial<typeof user_profile_themes.$inferInsert> = {
    updated_at: new Date(),
  };

  if (data.layoutStyle !== undefined) updateData.layout_style = data.layoutStyle;
  if (data.accentColor !== undefined) updateData.accent_color = data.accentColor;
  if (data.backgroundImageUrl !== undefined) updateData.background_image_url = data.backgroundImageUrl;
  if (data.backgroundPattern !== undefined) updateData.background_pattern = data.backgroundPattern;
  if (data.fontStyle !== undefined) updateData.font_style = data.fontStyle;
  if (data.showAssistant !== undefined) updateData.show_assistant = data.showAssistant;
  if (data.showMusicPlayer !== undefined) updateData.show_music_player = data.showMusicPlayer;

  const userIdNum = parseInt(userId, 10);
  if (isNaN(userIdNum)) {
    throw new Error('Invalid userId');
  }

  const [result] = await db
    .insert(user_profile_themes)
    .values({
      user_id: userIdNum,
      layout_style: data.layoutStyle || 'classic',
      accent_color: data.accentColor ?? null,
      background_image_url: data.backgroundImageUrl ?? null,
      background_pattern: data.backgroundPattern ?? null,
      font_style: data.fontStyle ?? null,
      show_assistant: data.showAssistant ?? true,
      show_music_player: data.showMusicPlayer ?? false,
    })
    .onConflictDoUpdate({
      target: user_profile_themes.user_id,
      set: updateData,
    })
    .returning();

  return result;
}

