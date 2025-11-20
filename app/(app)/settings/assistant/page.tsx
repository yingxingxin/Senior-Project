import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, users, assistants } from "@/src/db";
import { eq } from "drizzle-orm";
import { Stack } from "@/components/ui/spacing";
import { Heading, Body } from "@/components/ui/typography";
import { AssistantSettingsForm } from "./_components/assistant-settings-form";
import { PERSONA_OPTIONS } from "@/src/lib/constants";

/**
 * Assistant Settings (Wardrobe) Page
 *
 * Allows users to change their assistant's gender and personality after onboarding.
 *
 * USER STORIES SUPPORTED:
 *   - F02-US03: Switch personalities later
 *   - F04-US01: Change assistant's gender or personality after setup
 */

async function getUserAssistantData(userId: number) {
  const [user] = await db
    .select({
      assistantId: users.assistant_id,
      assistantPersona: users.assistant_persona,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new Error("User not found");
  }

  // Get all available assistants
  const allAssistants = await db
    .select({
      id: assistants.id,
      name: assistants.name,
      slug: assistants.slug,
      gender: assistants.gender,
      avatarUrl: assistants.avatar_url,
      tagline: assistants.tagline,
      description: assistants.description,
    })
    .from(assistants)
    .orderBy(assistants.name);

  return {
    currentAssistantId: user.assistantId,
    currentPersona: user.assistantPersona,
    assistants: allAssistants,
  };
}

export default async function AssistantSettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number(session.user.id);
  const data = await getUserAssistantData(userId);

  return (
    <Stack gap="loose">
      <div>
        <Heading level={2}>Assistant Customization</Heading>
        <Body className="mt-2 text-muted-foreground">
          Change your assistant&apos;s appearance and personality to match your learning style.
        </Body>
      </div>

      {/* Assistant Settings Form (with unified save/cancel) */}
      <AssistantSettingsForm
        assistants={data.assistants}
        currentAssistantId={data.currentAssistantId}
        currentPersona={data.currentPersona}
        personas={PERSONA_OPTIONS}
      />
    </Stack>
  );
}
