import { Stack } from "@/components/ui/spacing";
import { Heading, Muted } from "@/components/ui/typography";
import { QuizForm } from "../_components/quiz-form";
import { getQuizTopicOptions } from "@/src/db/queries/admin";
import { createQuizAction } from "../_lib/actions";

export default async function NewQuizPage() {
  const topicOptions = await getQuizTopicOptions();

  return (
    <Stack gap="loose">
      <Stack gap="tight">
        <Heading level={1}>Create New Quiz</Heading>
        <Muted variant="small">
          Add a new quiz with questions
        </Muted>
      </Stack>

      <QuizForm
        topicOptions={topicOptions}
        onSubmit={createQuizAction}
      />
    </Stack>
  );
}
