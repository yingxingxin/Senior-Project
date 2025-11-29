import { notFound } from "next/navigation";
import { Stack } from "@/components/ui/spacing";
import { Heading, Muted } from "@/components/ui/typography";
import { QuizForm } from "../_components/quiz-form";
import { getAdminQuizById, getQuizTopicOptions } from "@/src/db/queries/admin";
import { updateQuizAction, deleteQuizAction } from "../_lib/actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuizPage({ params }: PageProps) {
  const { id } = await params;
  const quizId = parseInt(id, 10);

  if (isNaN(quizId)) {
    notFound();
  }

  const [quiz, topicOptions] = await Promise.all([
    getAdminQuizById(quizId),
    getQuizTopicOptions(),
  ]);

  if (!quiz) {
    notFound();
  }

  // Wrap the server actions to pass the quiz ID
  const handleSubmit = async (data: Parameters<typeof updateQuizAction>[1]) => {
    "use server";
    return updateQuizAction(quizId, data);
  };

  const handleDelete = async () => {
    "use server";
    return deleteQuizAction(quizId);
  };

  return (
    <Stack gap="loose">
      <Stack gap="tight">
        <Heading level={1}>Edit Quiz</Heading>
        <Muted variant="small">
          {quiz.title} • {quiz.topicSlug}
        </Muted>
      </Stack>

      <QuizForm
        quiz={quiz}
        topicOptions={topicOptions}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </Stack>
  );
}
