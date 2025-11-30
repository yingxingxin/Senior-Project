"use server";

import { requireAdmin } from "@/app/admin/_lib/admin-guard";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  createLessonSection,
  updateLessonSection,
  deleteLessonSection,
  getAdminLessonById,
} from "@/src/db/queries/admin";
import { revalidatePath } from "next/cache";

interface LessonFormData {
  title: string;
  slug: string;
  description?: string;
  difficulty?: "easy" | "standard" | "hard" | null;
  estimatedDurationMin?: number | null;
  icon?: string | null;
  isPublished: boolean;
  scope: "global" | "user" | "shared";
  parentLessonId?: number | null;
  sections: Array<{
    id?: number;
    title: string;
    slug: string;
    bodyMd: string;
  }>;
}

export async function createLessonAction(
  data: LessonFormData
): Promise<{ success: boolean; error?: string; lessonId?: number }> {
  await requireAdmin();

  try {
    // Create the lesson
    const lesson = await createLesson({
      slug: data.slug,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty ?? undefined,
      estimatedDurationSec: data.estimatedDurationMin ? data.estimatedDurationMin * 60 : undefined,
      icon: data.icon ?? undefined,
      isPublished: data.isPublished,
      scope: data.scope,
      parentLessonId: data.parentLessonId ?? undefined,
    });

    // Create sections
    for (let i = 0; i < data.sections.length; i++) {
      const section = data.sections[i];
      await createLessonSection({
        lessonId: lesson.id,
        slug: section.slug,
        title: section.title,
        orderIndex: i,
        bodyMd: section.bodyMd,
      });
    }

    revalidatePath("/admin/content/lessons");
    return { success: true, lessonId: lesson.id };
  } catch (error) {
    console.error("Failed to create lesson:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    // Handle unique constraint violation
    if (message.includes("unique") || message.includes("duplicate")) {
      return { success: false, error: "A lesson with this slug already exists" };
    }
    return { success: false, error: message };
  }
}

export async function updateLessonAction(
  lessonId: number,
  data: LessonFormData
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    // Get current lesson to compare sections
    const currentLesson = await getAdminLessonById(lessonId);
    if (!currentLesson) {
      return { success: false, error: "Lesson not found" };
    }

    // Update the lesson
    await updateLesson(lessonId, {
      slug: data.slug,
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      estimatedDurationSec: data.estimatedDurationMin ? data.estimatedDurationMin * 60 : null,
      icon: data.icon,
      isPublished: data.isPublished,
      scope: data.scope,
      parentLessonId: data.parentLessonId,
    });

    // Handle sections: update existing, create new, delete removed
    const existingSectionIds = new Set(currentLesson.sections.map(s => s.id));
    const submittedSectionIds = new Set(data.sections.filter(s => s.id).map(s => s.id!));

    // Delete removed sections
    for (const section of currentLesson.sections) {
      if (!submittedSectionIds.has(section.id)) {
        await deleteLessonSection(section.id);
      }
    }

    // Update or create sections
    for (let i = 0; i < data.sections.length; i++) {
      const section = data.sections[i];
      if (section.id && existingSectionIds.has(section.id)) {
        // Update existing section
        await updateLessonSection(section.id, {
          slug: section.slug,
          title: section.title,
          orderIndex: i,
          bodyMd: section.bodyMd,
        });
      } else {
        // Create new section
        await createLessonSection({
          lessonId,
          slug: section.slug,
          title: section.title,
          orderIndex: i,
          bodyMd: section.bodyMd,
        });
      }
    }

    revalidatePath("/admin/content/lessons");
    revalidatePath(`/admin/content/lessons/${lessonId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update lesson:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("unique") || message.includes("duplicate")) {
      return { success: false, error: "A lesson with this slug already exists" };
    }
    return { success: false, error: message };
  }
}

export async function deleteLessonAction(
  lessonId: number
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const deleted = await deleteLesson(lessonId);
    if (!deleted) {
      return { success: false, error: "Lesson not found" };
    }

    revalidatePath("/admin/content/lessons");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete lesson:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
