"use server";

import { requireAdmin } from "@/app/admin/_lib/admin-guard";
import {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  getAdminQuizById,
} from "@/src/db/queries/admin";
import { revalidatePath } from "next/cache";

interface QuizFormData {
  title: string;
  slug: string;
  description?: string;
  topicSlug: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  defaultLength: number;
  questions: Array<{
    id?: number;
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }>;
}

export async function createQuizAction(
  data: QuizFormData
): Promise<{ success: boolean; error?: string; quizId?: number }> {
  await requireAdmin();

  try {
    // Create the quiz
    const quiz = await createQuiz({
      slug: data.slug,
      title: data.title,
      description: data.description,
      topicSlug: data.topicSlug,
      skillLevel: data.skillLevel,
      defaultLength: data.defaultLength,
    });

    // Create questions
    for (let i = 0; i < data.questions.length; i++) {
      const question = data.questions[i];
      await createQuizQuestion({
        quizId: quiz.id,
        orderIndex: i,
        prompt: question.prompt,
        options: question.options,
        correctIndex: question.correctIndex,
        explanation: question.explanation,
      });
    }

    revalidatePath("/admin/content/quizzes");
    return { success: true, quizId: quiz.id };
  } catch (error) {
    console.error("Failed to create quiz:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("unique") || message.includes("duplicate")) {
      return { success: false, error: "A quiz with this slug already exists" };
    }
    return { success: false, error: message };
  }
}

export async function updateQuizAction(
  quizId: number,
  data: QuizFormData
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    // Get current quiz to compare questions
    const currentQuiz = await getAdminQuizById(quizId);
    if (!currentQuiz) {
      return { success: false, error: "Quiz not found" };
    }

    // Update the quiz
    await updateQuiz(quizId, {
      slug: data.slug,
      title: data.title,
      description: data.description,
      topicSlug: data.topicSlug,
      skillLevel: data.skillLevel,
      defaultLength: data.defaultLength,
    });

    // Handle questions: update existing, create new, delete removed
    const existingQuestionIds = new Set(currentQuiz.questions.map(q => q.id));
    const submittedQuestionIds = new Set(data.questions.filter(q => q.id).map(q => q.id!));

    // Delete removed questions
    for (const question of currentQuiz.questions) {
      if (!submittedQuestionIds.has(question.id)) {
        await deleteQuizQuestion(question.id);
      }
    }

    // Update or create questions
    for (let i = 0; i < data.questions.length; i++) {
      const question = data.questions[i];
      if (question.id && existingQuestionIds.has(question.id)) {
        // Update existing question
        await updateQuizQuestion(question.id, {
          orderIndex: i,
          prompt: question.prompt,
          options: question.options,
          correctIndex: question.correctIndex,
          explanation: question.explanation,
        });
      } else {
        // Create new question
        await createQuizQuestion({
          quizId,
          orderIndex: i,
          prompt: question.prompt,
          options: question.options,
          correctIndex: question.correctIndex,
          explanation: question.explanation,
        });
      }
    }

    revalidatePath("/admin/content/quizzes");
    revalidatePath(`/admin/content/quizzes/${quizId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update quiz:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("unique") || message.includes("duplicate")) {
      return { success: false, error: "A quiz with this slug already exists" };
    }
    return { success: false, error: message };
  }
}

export async function deleteQuizAction(
  quizId: number
): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const deleted = await deleteQuiz(quizId);
    if (!deleted) {
      return { success: false, error: "Quiz not found" };
    }

    revalidatePath("/admin/content/quizzes");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete quiz:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
