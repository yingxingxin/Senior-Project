import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { getAllQuizzes, getUserWithAssistant, getUserQuizStatus } from "@/src/db/queries";
import { Card } from "@/components/ui/card";
import { Heading, Body, Muted } from "@/components/ui/typography";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Stack, Inline } from "@/components/ui/spacing";
import { QuizTopicTabs } from "./_components/quiz-topic-tabs";
import { getUserAICourses } from "@/app/(app)/courses/_lib/actions";

export default async function QuizzesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number(session.user.id);

  // Get user's assistant info
  const [userData] = await getUserWithAssistant.execute({ userId });

  // Get user's AI courses for quiz generation
  const aiCourses = await getUserAICourses();

  // Get all quizzes
  const allQuizzes = await getAllQuizzes.execute({});

  // Filter out quizzes without slugs (they can't be accessed)
  const validQuizzes = allQuizzes.filter((quiz) => quiz.slug != null && quiz.slug.trim() !== "");

  // Get completion status and best scores for all quizzes
  const quizStatuses = await Promise.all(
    validQuizzes.map(async (quiz) => {
      const [status] = await getUserQuizStatus.execute({
        userId,
        quizId: quiz.id,
      });
      return {
        quizId: quiz.id,
        bestPercentage: status?.bestPercentage ?? null,
        hasCompleted: status?.hasCompleted ?? false,
      };
    })
  );

  const statusMap = new Map(quizStatuses.map((s) => [s.quizId, s]));

  // Separate AI-generated quizzes from regular quizzes
  // AI-generated quizzes should only be visible to the user who created them
  // Filter AI-generated quizzes owned by the current user
  const aiQuizzes = validQuizzes.filter(quiz => {
    const isAI = quiz.isAiGenerated === true;
    const isOwner = quiz.ownerUserId === userId;
    return isAI && isOwner; // Only show AI quizzes owned by the current user
  });
  const regularQuizzes = validQuizzes.filter(quiz => {
    const isAI = quiz.isAiGenerated === true;
    return !isAI; // Regular quizzes are visible to everyone
  });

  // Group all quizzes by topic and skill level
  // AI quizzes go under "A.I. Generated Quiz" topic
  const quizzesByTopic = new Map<string, Map<string, typeof validQuizzes>>();

  // First, add regular quizzes grouped by their topic
  for (const quiz of regularQuizzes) {
    // Handle null/undefined topic slugs
    const topicKey = quiz.topicSlug || "uncategorized";
    const skillKey = quiz.skillLevel || "beginner";
    
    if (!quizzesByTopic.has(topicKey)) {
      quizzesByTopic.set(topicKey, new Map());
    }
    const topicMap = quizzesByTopic.get(topicKey)!;
    if (!topicMap.has(skillKey)) {
      topicMap.set(skillKey, []);
    }
    topicMap.get(skillKey)!.push(quiz);
  }

  // Then, add AI quizzes under "A.I. Generated Quiz" topic
  if (aiQuizzes.length > 0) {
    const aiTopicKey = "ai_generated_quiz";
    if (!quizzesByTopic.has(aiTopicKey)) {
      quizzesByTopic.set(aiTopicKey, new Map());
    }
    const aiTopicMap = quizzesByTopic.get(aiTopicKey)!;
    
    for (const quiz of aiQuizzes) {
      const skillKey = quiz.skillLevel || "beginner";
      if (!aiTopicMap.has(skillKey)) {
        aiTopicMap.set(skillKey, []);
      }
      aiTopicMap.get(skillKey)!.push(quiz);
    }
  }

  return (
    <div className="min-h-dvh bg-background container mx-auto px-4 py-8 max-w-7xl">
      <Stack gap="loose">
        {/* Header */}
        <Stack gap="tight">
          <Heading level={1}>Quizzes</Heading>
          <Muted>
            Practice and test your knowledge with topic-based quizzes. Each quiz is hosted by your assistant.
          </Muted>
        </Stack>

        {/* Assistant Host Info */}
        {userData?.assistantName && (
          <Card className="p-6">
            <Inline gap="default" align="center">
              {userData.assistantAvatar && (
                <Avatar className="h-12 w-12">
                  <AvatarImage src={userData.assistantAvatar} alt={userData.assistantName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                    {userData.assistantName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <Stack gap="tight">
                <Body className="font-medium">Hosted by {userData.assistantName}</Body>
                <Muted variant="small">
                  {userData.assistantTagline || "Your learning companion"}
                </Muted>
              </Stack>
            </Inline>
          </Card>
        )}

        {/* Topic Navigation Tabs (includes both regular and AI-generated quizzes) */}
        {/* Always show tabs, even if no quizzes exist (so users can generate quizzes) */}
        <QuizTopicTabs
          quizzesByTopic={quizzesByTopic}
          statusMap={statusMap}
          aiCourses={aiCourses}
        />
      </Stack>
    </div>
  );
}

