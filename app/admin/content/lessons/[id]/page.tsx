import { notFound } from "next/navigation";
import { Stack } from "@/components/ui/spacing";
import { Heading, Muted } from "@/components/ui/typography";
import { LessonForm } from "../_components/lesson-form";
import { getAdminLessonById, getParentLessonOptions } from "@/src/db/queries/admin";
import { updateLessonAction, deleteLessonAction } from "../_lib/actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLessonPage({ params }: PageProps) {
  const { id } = await params;
  const lessonId = parseInt(id, 10);

  if (isNaN(lessonId)) {
    notFound();
  }

  const [lesson, parentOptions] = await Promise.all([
    getAdminLessonById(lessonId),
    getParentLessonOptions(),
  ]);

  if (!lesson) {
    notFound();
  }

  // Wrap the server actions to pass the lesson ID
  const handleSubmit = async (data: Parameters<typeof updateLessonAction>[1]) => {
    "use server";
    return updateLessonAction(lessonId, data);
  };

  const handleDelete = async () => {
    "use server";
    return deleteLessonAction(lessonId);
  };

  return (
    <Stack gap="loose">
      <Stack gap="tight">
        <Heading level={1}>Edit Lesson</Heading>
        <Muted variant="small">
          {lesson.title} • {lesson.slug}
        </Muted>
      </Stack>

      <LessonForm
        lesson={lesson}
        parentOptions={parentOptions}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </Stack>
  );
}
