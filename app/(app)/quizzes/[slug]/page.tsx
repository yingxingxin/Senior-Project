import { redirect, notFound } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { getQuizBySlug, getQuizQuestions, getUserWithAssistant } from "@/src/db/queries";
import { QuizForm } from "../_components/quiz-form";
import { QuizHeader } from "../_components/quiz-header";
import { Stack } from "@/components/ui/spacing";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function QuizPage({ params }: Props) {
  const { slug } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number(session.user.id);

  // Get quiz
  const [quiz] = await getQuizBySlug.execute({ slug });
  if (!quiz) {
    notFound();
  }

  // Get user's assistant
  const [userData] = await getUserWithAssistant.execute({ userId });
  if (!userData?.assistantName) {
    // User should have an assistant, but handle gracefully
    redirect("/settings");
  }

  // Get all questions
  const allQuestions = await getQuizQuestions.execute({ quizId: quiz.id });

  // Limit to default_length if there are more questions
  const questions = allQuestions.slice(0, quiz.defaultLength);

  if (questions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Stack gap="default">
          <h1 className="text-2xl font-bold">No questions available</h1>
          <p>This quiz doesn&apos;t have any questions yet.</p>
        </Stack>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Stack gap="loose">
        <QuizHeader
          title={quiz.title}
          description={quiz.description}
          assistantName={userData.assistantName}
          assistantAvatar={userData.assistantAvatar}
          assistantTagline={userData.assistantTagline}
          skillLevel={quiz.skillLevel}
          questionCount={questions.length}
        />

        <QuizForm
          quizId={quiz.id}
          quizTitle={quiz.title}
          questions={questions.map((q) => ({
            id: q.id,
            prompt: q.prompt,
            options: q.options,
            correctIndex: q.correctIndex,
            explanation: q.explanation,
          }))}
          assistantName={userData.assistantName}
          assistantAvatar={userData.assistantAvatar}
        />
      </Stack>
    </div>
  );
}

