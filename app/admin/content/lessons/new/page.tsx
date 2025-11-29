import { Stack } from "@/components/ui/spacing";
import { Heading, Muted } from "@/components/ui/typography";
import { LessonForm } from "../_components/lesson-form";
import { getParentLessonOptions } from "@/src/db/queries/admin";
import { createLessonAction } from "../_lib/actions";

export default async function NewLessonPage() {
  const parentOptions = await getParentLessonOptions();

  return (
    <Stack gap="loose">
      <Stack gap="tight">
        <Heading level={1}>Create New Lesson</Heading>
        <Muted variant="small">
          Add a new lesson or course to the learning content
        </Muted>
      </Stack>

      <LessonForm
        parentOptions={parentOptions}
        onSubmit={createLessonAction}
      />
    </Stack>
  );
}
